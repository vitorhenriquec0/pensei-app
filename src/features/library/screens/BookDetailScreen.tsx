import React, { useRef, useMemo, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
            <ScrollView className="flex-1 px-6">
                {livro.descricao && (
                    <Text className="text-primary/80 font-semibold mb-4 text-sm text-center">
                        {livro.descricao}
                    </Text>
                )}
                <Text className="text-slate-300 text-lg leading-relaxed text-justify mb-40">
                    O projeto de arquitetura de software deve mitigar riscos de manutenção
                    precoce.
                    {"\n\n"}
                    <Text className="bg-primary/20 text-primary font-bold px-1 rounded">
                        O princípio do Baixo Acoplamento defende que os módulos devem ser
                        independentes
                    </Text>
                    , garantindo que alterações isoladas não propaguem erros colaterais em
                    cascata por todo o sistema.
                    {"\n\n"}
                    Esta modularidade permite que equipes trabalhem em paralelo,
                    substituindo peças da arquitetura sem comprometer o núcleo da
                    aplicação.
                </Text>
            </ScrollView>

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
                                <Text className="text-slate-500 text-center">Nenhum flashcard encontrado. Fixe um trecho do material para criar o seu primeiro flashcard!</Text>
                            </View>
                        ) : null}

                        {flashcards.map((card) => (
                            <View key={card.id} className="bg-surface rounded-xl p-4 mb-3 border border-slate-800">
                                {card.contexto ? (
                                    <Text className="text-primary text-[10px] font-bold uppercase mb-1" numberOfLines={1}>
                                        {card.contexto}
                                    </Text>
                                ) : null }

                                <Text className="text-white font-bold text-sm">{card.pergunta}</Text>
                                <Text className="text-slate-500 text-xs" numberOfLines={2}>{card.resposta}</Text>
                            </View>
                        ))}
                        
                    </BottomSheetScrollView>
                </View>
            </BottomSheet>
        </View>
    );
}
