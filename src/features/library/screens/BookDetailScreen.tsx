import React, { useRef, useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ArrowLeftCircleIcon, PlusIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// motor de ficheiros e web
import { WebView } from "react-native-webview";
import * as FileSystem from 'expo-file-system/legacy';

// firebase
import {
    doc,
    onSnapshot,
    collection,
    query,
    orderBy,
} from "firebase/firestore";
import { db } from "../../../config/firebase";

interface LivroData {
    titulo: string;
    descricao?: string;
    progresso: number;
    pdfUri?: string;
}

interface FlashcardData {
    id: string;
    pergunta: string;
    resposta: string;
    contexto?: string;
}

export function BookDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // id do livro passado pela rota
    const { id } = useLocalSearchParams();

    // estado para guardar os dados do livro
    const [livro, setLivro] = useState<LivroData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // estado para guardar os flashcards desse documento
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

    // estados do motor de PDF
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [textoSelecionado, setTextoSelecionado] = useState<string>('');
    const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState<number | null>(null);

    // enquanto a tela é carregada
    useEffect(() => {
        // se o id nao chegar, interrompe
        if (!id || typeof id !== "string") {
            setError(true);
            setLoading(false);
            return;
        }

        // referencia para o documento do livro
        const docRef = doc(db, "cadernos", id);

        // referencia para os flashcards relacionados a esse livro, ordenados do mais recente para o mais antigo
        const flashcardsRef = query(
            collection(db, "cadernos", id, "flashcards"),
            orderBy("dataCriacao", "desc"),
        );

        // conexão em tempo real
        const unsubscribe = onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    // extrair os dados
                    const data = docSnap.data();
                    setLivro({
                        titulo: data.titulo || "Sem Título",
                        descricao: data.descricao,
                        progresso: data.progresso || 0,
                        pdfUri: data.pdfUri,
                    });
                    setError(false);
                } else {
                    // documento não encontrado
                    setError(true);
                }
                setLoading(false);
            },
            (err) => {
                console.error("Erro ao carregar o documento:", err);
                setError(true);
                setLoading(false);
            },
        );

        const unsubscribeCards = onSnapshot(flashcardsRef, (querySnapshot) => {
                // instancia o array vazio na memória local
                const cards: FlashcardData[] = [];

                // itera diretamente pela "pasta" que o Firebase devolveu.
                // e se não houver flashcards, este loop é ignorado
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    cards.push({
                        id: doc.id,
                        pergunta: data.pergunta,
                        resposta: data.resposta,
                        contexto: data.contexto,
                    });
                });

                // atualiza o estado -> se o loop foi ignorado, ele guarda o array vazio []
                setFlashcards(cards);
            },
            (err) => {
                console.error("Erro ao carregar os flashcards:", err);
            },
        );

        // limpeza: desconecta o ouvinte se sair da tela
        return () => {
            unsubscribe();
            unsubscribeCards();
        };
    }, [id]); // o id é a dependência: se mudar, recarrega os dados


    // conversão para memoria (base64)
    useEffect(() => {
        const processarPdf = async () => {
            if (livro?.pdfUri) {
                try {
                    // le o arquivo do disco do celular e converte para string
                    const base64 = await FileSystem.readAsStringAsync(livro.pdfUri, {
                        encoding: FileSystem.EncodingType.Base64,
                    })
                    setPdfBase64(base64);
                } catch (e) {
                    console.error("Erro ao processar o PDF:", e);
                }
            }
        };

        // só executa se o livro ja tiver carregado e tiver um PDF
        if (livro && livro.pdfUri) {
            processarPdf();
        }
    }, [livro]); // depende do livro, se mudar, recarrega o PDF


    // o html que seja injetado no WebView para permitir a seleção de texto
    const gerarHtmlPdf = (base64Data: string) => `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
            body { margin: 0; background-color: #0F172A; display: flex; flex-direction: column; align-items: center; padding-bottom: 100px; }
            
            /* O container precisa ser 'relative' para o texto flutuar sobre ele */
            .page-container { position: relative; margin-bottom: 12px; box-shadow: 0px 4px 10px rgba(0,0,0,0.5); }
            canvas { display: block; max-width: 100%; height: auto; }
            
            /* A CSS da camada invisível */
            .text-layer { position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; color: transparent; pointer-events: auto; }
            .text-layer span { position: absolute; white-space: pre; cursor: text; transform-origin: 0% 0%; }
            
            /* Cor do "grifo" quando o usuario seleciona o texto */
            ::selection { background: rgba(234, 179, 8, 0.4); color: transparent; }
            
            .loading { color: #94a3b8; font-family: sans-serif; margin-top: 50px; }
        </style>
    </head>
    <body>
        <div id="pdf-container"><div class="loading">Descodificando o PDF e mapeando texto...</div></div>
        
        <script>
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            const pdfData = atob('${base64Data}');
            const pdfArray = new Uint8Array(pdfData.length);
            for (let i = 0; i < pdfData.length; i++) {
                pdfArray[i] = pdfData.charCodeAt(i);
            }

            pdfjsLib.getDocument({ data: pdfArray }).promise.then(pdf => {
                const container = document.getElementById('pdf-container');
                container.innerHTML = ''; 

                const totalPages = Math.min(pdf.numPages, 5); 
                
                for(let i = 1; i <= totalPages; i++) {
                    pdf.getPage(i).then(page => {

                        // pega o tamanho original da pagina
                        const unscaledViewport = page.getViewport({ scale: 1.0 });

                        // calcula a escala exata para caber na largura da tela
                        const scaleRequired = (window.innerWidth - 16) / unscaledViewport.width;
                        
                        // aplica a escala
                        const viewport = page.getViewport({ scale: scaleRequired });

                        // cria a "Caixa" da Página
                        const pageContainer = document.createElement('div');
                        pageContainer.className = 'page-container';
                        pageContainer.style.width = viewport.width + 'px';
                        pageContainer.style.height = viewport.height + 'px';
                        container.appendChild(pageContainer);

                        // desenha a Imagem 
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        pageContainer.appendChild(canvas);

                        // renderiza a Imagem e depois injeta a Camada de Texto
                        page.render({ canvasContext: context, viewport: viewport }).promise.then(() => {
                            return page.getTextContent();
                        }).then(textContent => {
                            const textLayer = document.createElement('div');
                            textLayer.className = 'text-layer';
                            pageContainer.appendChild(textLayer);

                            // mapeia cada palavra para flutuar no pixel exato
                            textContent.items.forEach(item => {
                                const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
                                const fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
                                
                                const span = document.createElement('span');
                                span.textContent = item.str + ' ';
                                span.style.left = tx[4] + 'px';
                                span.style.top = (tx[5] - fontHeight) + 'px';
                                span.style.fontSize = fontHeight + 'px';
                                span.style.fontFamily = item.fontName;
                                
                                textLayer.appendChild(span);
                            });
                        });
                    });
                }
            }).catch(err => {
                document.getElementById('pdf-container').innerHTML = '<div class="loading">Erro: ' + err.message + '</div>';
            });

            // detecta a seleção invisível e manda para o React Native
            document.addEventListener('selectionchange', () => {
                const selection = window.getSelection();
                const text = selection.toString();

                if (text.trim().length > 0 && selection.rangeCount > 0) {
                    // pega o retangulo da seleção na tela
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

                    // calcula a coordenada absoluta
                    const absoluteY = rect.top + window.scrollY;

                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        tipo: 'TEXTO_SELECIONADO',
                        payload: text,
                        localizacaoY: absoluteY
                    }));
                } else {
                    // se o usuario clicar fora, limpa a seleção
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        tipo: 'LIMPAR_SELECAO'
                    }));
                }
            });
        </script>
    </body>
    </html>
    `;

    const onWebViewMessage = (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.tipo === 'TEXTO_SELECIONADO') {
                setTextoSelecionado(data.payload.trim());
                setLocalizacaoSelecionada(data.localizacaoY);
            } else if (data.tipo === 'LIMPAR_SELECAO') {
                setTextoSelecionado('');
                setLocalizacaoSelecionada(null);
            }
        } catch (e) {}
    };

    // referencia para controlar a gaveta (abrir e fechar caso necessário)
    const bottomSheetRef = useRef<BottomSheet>(null);
    // define as posições da gaveta em relação à tela
    const snapPoints = useMemo(() => ["15%", "50%", "90%"], []);

    {
        /* Estados condicionais */
    }

    // carregando os dados
    if (loading) {
        return (
            <View className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#EAB308" />
                <Text className="text-slate-400 mt-4">Carregando documento...</Text>
            </View>
        );
    }

    // livro nao encontrado ou id invalido
    if (error || !livro) {
        return (
            <View className="flex-1  bg-surface justify-center items-center px-6">
                <Text className="text-red-400 font-bold text-xl mb-4">
                    Livro não encontrado
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-slate-800 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-bold">Voltar para Biblioteca</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // renderização completa do documento
    return (
        <View className="flex-1 bg-surface pt-16">
            {/* Cabeçalho */}
            <View className="px-6 flex-row items-center justify-between mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="p-2 -ml-2 *:bg-slate-800 rounded-xl flex-row items-center gap-2"
                >
                    <ArrowLeftCircleIcon color="#94a3b8" size={28} />
                    <Text className="text-slate-400 font-bold">Voltar</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-base" numberOfLines={1}>
                    {livro.titulo}
                </Text>
                <View className="w-12" />
            </View>

            {/* Leitura */}
            <View className="flex-1 bg-[#0F172A]">
                {livro.pdfUri && pdfBase64 ? (
                    <WebView
                        originWhitelist={['*']}
                        source={{ html: gerarHtmlPdf(pdfBase64) }}
                        onMessage={onWebViewMessage}
                        style={{ flex: 1, backgroundColor: 'transparent' }}
                        showsVerticalScrollIndicator={false}
                        setBuiltInZoomControls={true}
                        setDisplayZoomControls={false}
                        scalesPageToFit={true}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-slate-500 text-center text-lg">
                            Este caderno não possui um PDF anexado.
                        </Text>
                    </View>
                )}
            </View>

            {/* Botão de extração de texto */}
            {textoSelecionado.length > 0 && (
                <TouchableOpacity
                    activeOpacity={0.9}
                    //envia o textoSelecionado como parametro para a tela de criação de card
                    onPress={() => router.push({
                        pathname: "/create-card",
                        params: { livroId: id, contextoSugerido: textoSelecionado, localizacaoY: localizacaoSelecionada }
                    })}
                    className="absolute bottom-32 right-6 bg-primary px-6 py-4 rounded-full flex-row items-center shadow-lg border-2 border-yellow-300 z-50"
                >
                    <PlusIcon color="#0F172A"  size={20}/>
                    <Text className="text-surface font-extrabold ml-2">Criar Flashcard</Text>
                </TouchableOpacity>
            )}

            {/* Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0} // começa em 15% da tela
                snapPoints={snapPoints}
                backgroundStyle={{ backgroundColor: "#1E293B" }}
                handleIndicatorStyle={{ backgroundColor: "#475569" }}
            >
                <View
                    className="flex-1 px-6 pt-2"
                    style={{ paddingBottom: insets.bottom }}
                >
                    {/* Topo */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white font-bold text-lg">
                            Flashcards deste Material
                        </Text>
                        <Text className="text-primary font-bold">
                            {flashcards.length} {flashcards.length === 1 ? "Flashcard" : "Flashcards"}
                        </Text>
                    </View>

                    {/* Adicionar rápido */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                            router.push({ pathname: "/create-card", params: { livroId: id } })
                        }
                        className="bg-surface border border-dashed border-slate-600 rounded-xl p-4 items-center mb-6"
                    >
                        <Text className="text-slate-400 font-semibold text-sm">
                            + Toque para fixar um trecho
                        </Text>
                    </TouchableOpacity>

                    {/* Lista Simples de Cards existentes */}
                    <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                        {flashcards.length === 0 ? (
                            <View className="items-center justify-center mt-10">
                                <Text className="text-slate-500 text-center">Nenhum flashcard encontrado. Sublinhe o PDF para extrair conceitos!</Text>
                            </View>
                        ) : null}

                        {flashcards.map((card) => (
                            <TouchableOpacity
                                key={card.id}
                                className="bg-surface rounded-xl p-4 mb-3 border border-slate-800"
                                activeOpacity={0.7}
                                onPress={() => router.push({ pathname: '/card-detail', params: { livroId: id, cardId: card.id }})}>
                                {card.contexto ? (
                                    <Text className="text-primary text-[10px] font-bold uppercase mb-1" numberOfLines={1}>
                                        {card.contexto}
                                    </Text>
                                ) : null }

                                <Text className="text-white font-bold text-sm">{card.pergunta}</Text>
                                <Text className="text-slate-500 text-xs" numberOfLines={2}>{card.resposta}</Text>
                            </TouchableOpacity>
                        ))}
                        
                    </BottomSheetScrollView>
                </View>
            </BottomSheet>
        </View>
    );
}
