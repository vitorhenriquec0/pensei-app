import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function DashboardScreen() {
  return (
    <View className="flex-1 bg-slate-50 items-center justify-center p-6">
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center max-w-sm w-full">
        <Text className="text-4xl font-extrabold text-indigo-600 mb-3 tracking-tight">
          Pensei!
        </Text>
        <Text className="text-slate-500 text-center mb-8 text-base leading-relaxed">
          Transforme artigos científicos densos em revisões ativas e flashcards memoráveis com a nossa IA.
        </Text>
        
        <TouchableOpacity 
          className="bg-indigo-600 active:bg-indigo-800 px-6 py-4 rounded-xl w-full items-center shadow-sm"
          onPress={() => console.log('Botão pressionado: Ir para Importação')}
        >
          <Text className="text-white font-bold text-lg">
            Começar Nova Leitura
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}