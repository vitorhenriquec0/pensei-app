import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-yellow-500 items-center justify-center p-6">
      <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center max-w-sm w-full">
        <Text className="text-4xl font-extrabold text-yellow-500 mb-3 tracking-tight">
          Pensei!
        </Text>
        <Text className="text-gray-700 text-center mb-8 text-base leading-relaxed">
          Transforme seus textos e aulas em revisões ativas e flashcards memoráveis com a nossa IA.
        </Text>
        
        <TouchableOpacity 
          className="bg-yellow-500 active:bg-yellow-600 px-6 py-4 rounded-full w-full items-center shadow-sm"
          onPress={() => router.push('/study')}
        >
          <Text className="text-white font-bold text-lg">
            Avançar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}