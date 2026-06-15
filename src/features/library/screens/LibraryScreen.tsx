import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";

export function LibraryScreen() {
  const router = useRouter();

  const mockBooks = [
    {
      id: "1",
      titulo: "Engenharia de Software",
      dataCriacao: "15 Jun 2026",
      flashcards: 24,
      progresso: 45,
      ultimoAcesso: "Hoje",
    },
    {
      id: "2",
      titulo: "Arquitetura de Computadores",
      dataCriacao: "10 Jun 2026",
      flashcards: 58,
      progresso: 80,
      ultimoAcesso: "Há 2 dias",
    },
    {
      id: "3",
      titulo: "Artigo: Redes Neurais U-Net",
      dataCriacao: "05 Jun 2026",
      flashcards: 12,
      progresso: 15,
      ultimoAcesso: "Há 1 semana",
    },
  ];

  return (
    <View className="flex-1 bg-surface pt-16">
      {/* Cabeçalho fixo */}
      <View className="px-6 mb-4">
        <Text className="text-3xl font-extrabold text-white tracking-tight mb-6">
          Sua Biblioteca
        </Text>

        {/* Barra de pesquisa */}
        <View className="bg-surface-paper flex-row items-center px-4 py-2 rounded-2xl border border-slate-700 mb-2">
          <Search color="slate-400" />
          <TextInput
            placeholder="Buscar cadernos..."
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-base"
          />
        </View>
      </View>

      {/* Lista */}
      <ScrollView className="flex-1 px-6">
        <Text className="text-slate-400 font-semibold mb-4 uppercase text-xs tracking-wider">
          Todos os Cadernos ({mockBooks.length})
        </Text>

        {mockBooks.map((book) => (
          <TouchableOpacity
            key={book.id}
            activeOpacity={0.7}
            className="bg-surface rounded-2xl p-4 mb-4 border border-slate-700 flex-row items-center shadow-sm"
            onPress={() => {
              // abrira o bookdetailscreen
              console.log("Abrir livro: ", book.titulo);
            }}
          >
            {/* Ícone do PDF */}
            <View className="w-20 h-28 bg-surface border border-slate-600 rounded-lg items-center justify-center mr-4 p-2 shadow-inner">
              <Text className="text-slate-500 font-extrabold text-xs mb-2">
                PDF
              </Text>
              <View className="w-full h-1 bg-slate-700 rounded-full mb-1" />
              <View className="w-3/4 h-1 bg-slate-700 rounded-full mb-1" />
              <View className="w-full h-1 bg-slate-700 rounded-full" />
            </View>

            {/* Informações e Metadados */}
            <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1 leading-tight">
                    {book.titulo}
                </Text>

                <View className="flex-row items-center mb-1">
                    <Text className="text-primary font-bold text-xs">
                        {book.flashcards} Flashcards
                    </Text>
                    <Text className="text-slate-600 text-xs mx-2">•</Text>
                    <Text className="text-slate-400 text-xs">Criado em {book.dataCriacao}</Text>
                </View>

                <Text className="text-slate-500 text-xs mb-3">Último acesso: {book.ultimoAcesso}</Text>

                {/* Barra de progresso de leitura */}
                <View className="w-full">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-slate-400 text-[10px] font-semibold uppercase">Progresso</Text>
                        <Text className="text-slate-400 text-[10px] font-bold">{book.progresso}%</Text>
                    </View>
                    <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${book.progresso}%` }}
                        />
                    </View>
                </View>
            </View>
          </TouchableOpacity>
        ))}
        
        <View className="h-24" />
      </ScrollView>
    </View>
  );
}
