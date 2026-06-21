import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Plus, FileTextIcon, ArrowLeftCircleIcon } from "lucide-react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// sistema de ficheiros
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';

// firebase
import Toast from "react-native-toast-message";
import { db } from "../../../config/firebase";

interface PDF {
  uri: string;
  nome: string;
  tamanho?: number;
}

export function CreateBookScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  // estado para guardar o pdf temporario selecionado
  const [pdf, setPdf] = useState<PDF | null>(null)

  const [isLoading, setIsLoading] = useState(false);

  // abrir o seletor de arquivos para escolher um PDF
  const handleSelecionarPDF = async() => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // filtro
        copyToCacheDirectory: true, // copia para cache
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        const file = resultado.assets[0];
        setPdf({
          uri: file.uri,
          nome: file.name,
          tamanho: file.size,
        });

        // se o usuario nao escrever um titulo
        if (!titulo) {
          setTitulo(file.name.replace('.pdf', ''));
        }
      }
    } catch (error) {
      console.error("Erro ao selecionar o PDF:", error);
    }
  };

  // função para processar o PDF localmente e retornar o caminho do arquivo processado
  const processarPDFLocalmente = async (cacheUri: string, fileName: string) : Promise<string> => {
    try {
      // cria um nome unico para evitar que pdfs com o mesmo nome sobrescrevam
      const uniqueFileName = `${Date.now()}_${fileName}`;
    
      const temp = new File(cacheUri);

      if(!temp.exists) {
        throw new Error("Arquivo temporário não encontrado");
      }

      const permanent =  new File(Paths.document, uniqueFileName);

      await temp.copy(permanent);

      return permanent.uri;
    } catch (error) {
      console.error("Erro ao processar ficheiro:", error);
      throw error;
    }
  }

  // guardar na base de dados
  const handleSalvar = async () => {
    if (!titulo.trim()) return;
    setIsLoading(true);

    try {
      let finalPdfUri = null;

      // se o usuario selecionou um PDF, processa fisicamente primeiro
      if (pdf) {
        finalPdfUri = await processarPDFLocalmente(pdf.uri, pdf.nome);
      }

      // adiciona o novo documento na coleção 'cadernos' do Firestore
      const cadernosRef = collection(db, 'cadernos');
      await addDoc(cadernosRef, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        pdfUri: finalPdfUri || null,
        pdfNome: pdf ? pdf.nome : null,
        dataCriacao: serverTimestamp(),
        flashcardsCount: 0,
        progresso: 0,
        ultimoAcesso: serverTimestamp()
      });

      Toast.show({
        type: 'success',
        text1: 'Caderno criado com sucesso!',
        text2: 'Você pode começar a adicionar flashcards agora mesmo.',
      })

      router.back();
    } catch (error) {
      console.error("Erro ao guardar o caderno:", error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao criar caderno',
        text2: 'Não foi possível criar o caderno.',
      });
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Cabeçalho */}
        <View className="flex-row items-center justify-between mb-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2 flex-row gap-2 items-center">
            <ArrowLeftCircleIcon color="#94a3b8" />
            <Text className="text-slate-400 font-bold">Voltar</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg ">Novo Caderno</Text>
          <View className="w-12" />
        </View>

          {/* Campo: Titulo */}
          <View className="mb-6">
            <Text className="text-slate-400 font-semibold mb-2 text-sm">
              Título do Livro
            </Text>
            <TextInput
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ex: Engenharia de Software"
              placeholderTextColor="#64748B"
              className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-700 text-base focus:border-primary"
              editable={!isLoading}
            />
          </View>

          {/* Campo: Descrição */}
          <View className="mb-8">
            <Text className="text-slate-400 font-semibold mb-2 text-sm">
              Descrição ou Semestre (Opcional)
            </Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex: Resumos para a prova final..."
              placeholderTextColor="#64748B"
              className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-700 text-base focus:border-primary"
            />
          </View>

          {/* Área de Anexo de PDF */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSelecionarPDF}
            disabled={isLoading}
            className={`p-6 rounded-3xl border-2 border-dashed mb-10 items-center justify-center py-10 ${
              pdf ? "bg-primary/10 border-primary" : "bg-surface-paper border-slate-600"
            }`}
          >
            {pdf ? (
              <>
                <View className="bg-primary/20 h-16 w-16 rounded-full items-center justify-center mb-4">
                  <FileTextIcon color="#8b5cf6" size={32} />
                </View>
                <Text className="text-white font-bold text-base mb-1 text-center" numberOfLines={1}>
                  {pdf.nome}
                </Text>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation();
                    setPdf(null);
                  }}
                  className="mt-2"
                >
                  <Text className="text-red-400 text-sm font-semibold">Remover arquivo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="bg-slate-800 h-16 w-16 rounded-full items-center justify-center mb-4">
                  <Plus color="#94a3b8" />
                </View>
                <Text className="text-white font-bold text-base mb-1">
                  Anexar Arquivo PDF
                </Text>
                <Text className="text-slate-500 text-sm text-center px-4">
                  Selecione um PDF para o seu caderno
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botão Criar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSalvar}
            disabled={!titulo || isLoading}
            className={`rounded-2xl p-4 items-center justify-center mb-12 ${
              titulo ? "bg-primary" : "bg-slate-800 opacity-50"
            }`}
          >
            <Text
              className={`text-base font-extrabold ${
                titulo ? "text-surface" : "text-slate-500"
              }`}
            >
              Criar Caderno
            </Text>
          </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
