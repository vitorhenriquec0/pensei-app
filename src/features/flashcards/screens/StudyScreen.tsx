import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Flashcard } from "../components/Flashcard";
import { ArrowLeftCircleIcon } from "lucide-react-native";

export function StudyScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-primary px-6 pt-16">
            {/* Cabeçalho */}
            <View className="flex-row items-center justify-between  mb-10">
                <TouchableOpacity onPress={() => router.back()} className="flex-row items-center justify-center ">
                    <ArrowLeftCircleIcon size={24} color="#FEF08A" />                
                </TouchableOpacity>
                <Text className="text-primary-light font-bold text-xl">Sessão de Estudo</Text>
                {/* Espaçador para centralizar o título */}
                <View className="w-12" />
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