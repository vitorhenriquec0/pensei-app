import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

export function DashboardScreen() {
  const router = useRouter();



  return (
    <ScrollView className="flex-1 bg-surface px-6 pt-16">
      
      {/* Cabeçalho de Boas-vindas */}
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-white tracking-tight">
          Bom dia, Vitor!
        </Text>
        <Text className="text-slate-400 mt-2 text-base">
          Você tem <Text className="font-bold text-primary font-serif">12 flashcards</Text> para revisar hoje.
        </Text>
      </View>

      {/* Botão de Ação Principal */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/study')}
        className="bg-primary rounded-3xl p-6 mb-10 shadow-sm flex-row items-center justify-between"
      >
        <View>
          <Text className="text-surface font-semibold mb-1 uppercase tracking-wider text-xs">
            Sessão Diária
          </Text>
          <Text className="text-surface-paper text-xl font-extrabold">
            Começar Revisão
          </Text>
        </View>
        
        <View className="bg-primary-dark h-12 w-12 rounded-full items-center justify-center">
          <ArrowRight color="white" size={24} />
        </View>
      </TouchableOpacity>

      {/* Seção de Cadernos / Leituras */}
      <View className="mb-6">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-xl font-bold text-white">Suas Leituras</Text>
          <TouchableOpacity>
            <Text className="text-primary font-semibold">Ver todas</Text>
          </TouchableOpacity>
        </View>

        {/* Placeholder de um Caderno/PDF existente */}
        <TouchableOpacity 
          activeOpacity={0.7}
          // 'surface-paper' cria um card levemente mais claro que o fundo
          className="bg-surface-paper p-5 rounded-2xl border border-slate-700 shadow-sm mb-3 flex-row items-center"
        >
          {/* Ícone do PDF adaptado para o modo escuro */}
          <View className="bg-red-500/10 h-12 w-12 rounded-xl items-center justify-center mr-4 border border-red-500/20">
            <Text className="text-red-400 font-bold text-xs uppercase">PDF</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              Engenharia de Software.pdf
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              Última leitura há 2 horas
            </Text>
          </View>
        </TouchableOpacity>

        {/* Botão de Adicionar Novo Arquivo */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push('/create-book')}
          className="bg-surface p-5 rounded-2xl border-2 border-dashed border-slate-700 mb-8 items-center justify-center py-6"
        >
          <Text className="text-slate-400 font-semibold">
            + Novo Caderno/Livro/PDF
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}