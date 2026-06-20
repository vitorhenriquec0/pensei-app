import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import { collection, addDoc, serverTimestamp, doc, increment, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";


export function CreateCardScreen() {
  const router = useRouter();

  const { livroId, contextoSugerido, localizacaoY } = useLocalSearchParams();

  const [contexto, setContexto] = useState((contextoSugerido as string) || '');
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSalvar = async () => {
    if(!pergunta.trim() || !resposta.trim()) return;
    if (!livroId || typeof livroId !== 'string') {
      console.error("Erro: ID do livro não encontrado.");
      return;      
    }

    setIsLoading(true);

    try {
      // aponta para a subcoleção flashcards dentro do caderno
      const flashcardsRef = collection(db, 'cadernos', livroId, 'flashcards');

      // grava o novo card
      await addDoc(flashcardsRef, {
        pergunta: pergunta.trim(),
        resposta: resposta.trim(),
        contexto: contexto.trim() || null,
        localizacaoPdfY: localizacaoY ? Number(localizacaoY) : null,
        dataCriacao: serverTimestamp(),
        nivelRevisao: 0,
        proximaRevisao: serverTimestamp(),
      });

      // atualiza o contador de flashcards no documento do caderno
      const cadernoRef = doc(db, 'cadernos', livroId);
      await updateDoc(cadernoRef, {
        flashcardsCount: increment(1),
      });

      router.back();
    } catch (error) {
      console.error("Erro ao guardar flashcard:", error);
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
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 flex-row items-center gap-2">
            <ArrowLeftCircleIcon color="#94a3b8" size={24} />
            <Text className="text-slate-400 font-bold">Voltar</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Novo Flashcard</Text>
          <View className="w-12" />
        </View>

        {/* Campo: Contexto */}
        <View className="mb-6">
          <Text className="text-slate-400 font-semibold mb-2 text-sm">
            Contexto ou Fonte do Texto (Opcional)
          </Text>
          <TextInput
            multiline
            numberOfLines={4}
            value={contexto}
            onChangeText={setContexto}
            placeholder="Cola aqui o parágrafo do artigo..."
            placeholderTextColor="#64748B"
            className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base min-h-[100px] textAlignVertical-top"
            editable={!isLoading}
          />
        </View>

        {/* Campo: Pergunta */}
        <View className="mb-6">
          <Text className="text-slate-400 font-semibold mb-2 text-sm">
            Pergunta / Frente do Card *
          </Text>
          <TextInput
            value={pergunta}
            onChangeText={setPergunta}
            placeholder="O que quer fixar?"
            placeholderTextColor="#64748B"
            className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base"
            editable={!isLoading}
          />
        </View>

        {/* Campo: Resposta */}
        <View className="mb-10">
          <Text className="text-slate-400 font-semibold mb-2 text-sm">
            Resposta / Verso do Card *
          </Text>
          <TextInput
            multiline
            numberOfLines={3}
            value={resposta}
            onChangeText={setResposta}
            placeholder="A resposta curta e objetiva..."
            placeholderTextColor="#64748B"
            className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base min-h-[80px]"
            editable={!isLoading}
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSalvar}
          disabled={!pergunta || !resposta || isLoading}
          className={`rounded-2xl p-4 items-center justify-center mb-12 ${
            pergunta && resposta ? 'bg-primary' : 'bg-slate-800 opacity-50'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className={`text-base font-extrabold ${
              pergunta && resposta ? 'text-surface' : 'text-slate-500'}`}>Adicionar Flashcard</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
