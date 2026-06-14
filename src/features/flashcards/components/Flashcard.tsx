import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface FlashcardProps {
    pergunta: string;
    resposta: string;
}
export function Flashcard({ pergunta, resposta }: FlashcardProps) {
  const [revelado, setRevelado] = useState(false);

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      onPress={() => setRevelado(!revelado)}
      className={`p-8 rounded-3xl w-full min-h-[240px] justify-center items-center shadow-sm  ${
        revelado ? 'bg-surface-paper' : 'bg-white border-slate-200'
      }`}
    >
      <Text className={`text-xs font-bold mb-6 uppercase tracking-widest ${
        revelado ? 'text-surface-light' : 'text-slate-400'
      }`}>
        {revelado ? 'Resposta' : 'Pergunta'}
      </Text>
      
      <Text className={`text-2xl font-extrabold text-center leading-tight ${
        revelado ? 'text-surface-light' : 'text-surface-paper'
      }`}>
        {revelado ? resposta : pergunta}
      </Text>

      <View className={`mt-8 px-5 py-2 rounded-full ${
        revelado ? 'bg-white' : 'bg-slate-50'
      }`}>
        <Text className={`font-semibold text-sm ${
          revelado ? 'text-surface-paper' : 'text-slate-500'
        }`}>
          Toque para {revelado ? 'esconder' : 'revelar'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}