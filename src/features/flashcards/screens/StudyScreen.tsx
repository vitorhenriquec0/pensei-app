import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Flashcard } from "../components/Flashcard";

export function StudyScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-slate-50 px-6 pt-16">
            {/* Cabeçalho */}
            <View className="flex-row items-center justify-between mb-10">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Text className="text-slate-500 font-bold">← Voltar</Text>
                </TouchableOpacity>
                <Text className="text-slate-800 font-bold text-lg">Sessão de Estudo</Text>
                <View className="w-12" /> {/* Espaçador para centralizar o título */}
            </View>

                <View className="flex-1 items-center justify-center mb-20">
                    <Flashcard
                        pergunta="O que o princípio do Baixo Acoplamento defende na Arquitetura de Software?"
                        resposta="Que os módulos devem ser o mais independentes possível, para que mudanças em um não quebrem o outro."
                    />
                </View>
            </View>
    );
}