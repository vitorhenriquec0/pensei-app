import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";

export function CreateCardScreen() {
  const router = useRouter();

  const [contexto, setContexto] = useState("");
  const [pergunta, setPergunta] = useState("");
  const [resposta, setResposta] = useState("");

  const handleSalvar = () => {
    console.log({ contexto, pergunta, resposta });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Cabeçalho */}
        <View className="flex-row items-center justify-between mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowRight color="slate-400" size={24} />
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
            placeholder="Cola aqui o parágrafo do artigo ou livro para não perderes o contexto..."
            placeholderTextColor="#64748B"
            className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base min-h-[100px] textAlignVertical-top"
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
            placeholder="O que queres fixar?"
            placeholderTextColor="#64748B"
            className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base"
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
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSalvar}
          disabled={!pergunta || !resposta}
          className={`rounded-2xl p-4 items-center justify-center mb-12 ${
            pergunta && resposta ? 'bg-primary' : 'bg-slate-800 opacity-50'
          }`}
        >
          <Text className={`text-base font-extrabold ${
            pergunta && resposta ? 'text-surface' : 'text-slate-500'
          }`}>Adicionar flashcard</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
