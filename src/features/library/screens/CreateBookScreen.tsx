import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowBigLeft } from "lucide-react-native/icons";

export function CreateBookScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSalvar = () => {
    console.log({ titulo, descricao });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-surface"
    >
      <ScrollView className="flex-1 px-6 pt-16">
        {/* Cabeçalho */}
        <View className="flex-column items-center justify-between mb-10">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowBigLeft color="#94a3b8" />
            <Text className="text-slate-400 font-bold">Voltar</Text>
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Novo Caderno</Text>
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
            className="bg-surface-paper p-6 rounded-3xl border-2 border-dashed border-slate-600 mb-10 items-center justify-center py-10"
          >
            {/* Se quiser usar um ícone do Lucide, substitua esta View */}
            <View className="bg-slate-800 h-16 w-16 rounded-full items-center justify-center mb-4">
              <Text className="text-slate-400 text-3xl font-light">+</Text>
            </View>
            <Text className="text-white font-bold text-base mb-1">
              Anexar Arquivo PDF
            </Text>
            <Text className="text-slate-500 text-sm text-center px-4">
              Toque para procurar um documento no seu celular
            </Text>
          </TouchableOpacity>

          {/* Botão Criar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSalvar}
            disabled={!titulo}
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
