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
import { ArrowBigLeft, Plus } from "lucide-react-native/icons";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../config/firebase";

export function CreateBookScreen() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSalvar = async () => {
    if (!titulo.trim()) return;
    
    setIsLoading(true);

    try {
      // aponta para a coleção cadernos do firestore
      const cadernosRef = collection(db, 'cadernos');

      // adiciona o novo documento
      await addDoc(cadernosRef, {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        dataCriacao: serverTimestamp(),
        flashcardsCount: 0,
        progresso: 0,
        ultimoAcesso: serverTimestamp(),
      });

      // sucedido: volta para o ecrâ anterior
      router.back();
    } catch (error) {
      console.error("Erro ao guardar o caderno:", error); 
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
            disabled={isLoading}
            className="bg-surface-paper p-6 rounded-3xl border-2 border-dashed border-slate-600 mb-10 items-center justify-center py-10"
          >
            <View className="bg-slate-800 h-16 w-16 rounded-full items-center justify-center mb-4">
              <Plus color="#94a3b8" />
            </View>
            <Text className="text-white font-bold text-base mb-1">
              Anexar Arquivo PDF
            </Text>
            <Text className="text-slate-500 text-sm text-center px-4">
              (Funcionalidade em desenvolvimento)
            </Text>
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
