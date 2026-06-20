import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Flashcard } from "../components/Flashcard";
import { ArrowLeftCircleIcon, XIcon, RotateCcwIcon, MapPinIcon } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get('window');

const MOCK_CARDS = [
  {
    id: '1',
    pergunta: 'O que defende o princípio do Baixo Acoplamento na arquitetura de software?',
    resposta: 'Defende que os módulos devem ser o mais independentes possível, garantindo que alterações isoladas não propaguem erros em cascata pelo sistema.',
    contexto: 'Capítulo 4 - Coesão e Acoplamento'
  },
  {
    id: '2',
    pergunta: 'Qual a diferença entre arquitetura de Harvard e von Neumann?',
    resposta: 'Harvard possui memórias separadas para dados e instruções (barramentos distintos), enquanto von Neumann usa uma memória unificada para ambos.',
    contexto: 'Revisão P1'
  }
];

export function StudyScreen() {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // 0 - frente, 1 - verso
    const rotationProgress = useSharedValue(0);

    // dispara a virada
    const handleFlip = () => {
    const nextValue = isFlipped ? 0 : 1;
        setIsFlipped(!isFlipped);
    
        // Roda suavemente em 400 milissegundos
        rotationProgress.value = withTiming(nextValue, { duration: 400 });
    };

    // estilos
    const frontAnimatedStyle = useAnimatedStyle(() => {
        // interpola o valor de 0 a 1 para graus de rotação
        const rotateY = interpolate(rotationProgress.value, [0, 1], [0, 180]);

        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateY}deg` }  
            ],
        };
    });
    const backAnimatedStyle = useAnimatedStyle(() => {
        // interpola o valor de 0 a 1 para graus de rotação, invertendo a direção
        const rotateY = interpolate(rotationProgress.value, [0, 1], [180, 360]);

        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateY}deg` }  
            ],
        };
    })

    const currentCard = MOCK_CARDS[currentIndex];
    const totalCards = MOCK_CARDS.length;
    const progressPercentage = ((currentIndex + 1) / totalCards) * 100;

    const handleAvaliar = (nivel: string) => {
        console.log(`Card avaliado como: ${nivel}`);

        if (currentIndex < totalCards - 1) {
            rotationProgress.value = 0;
            setIsFlipped(false);
            setCurrentIndex(prev => prev + 1);
        } else {
            Toast.show({
                type: 'success',
                text1: 'Sessão finalizada!',
                text2: 'Good job!'
            });
            router.back();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-surface pt-10">
            {/* Header e progresso */}
            <View className="px-6 pb-4">
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 bg-slate-800 rounded-full">
                        <XIcon color="#94a3b8" size={24}/>
                    </TouchableOpacity>
                    <Text className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                        Revisão Diária
                    </Text>
                    <View className="w-10"/>
                </View>

                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white font-bold">
                        Card {currentIndex + 1} <Text className="text-slate-500"> de {totalCards}</Text>
                    </Text>
                    <Text className="text-primary font-bold">{Math.round(progressPercentage)}%</Text>
                </View>

                {/* Barra de progresso */}
                <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${progressPercentage}%`}}
                    />
                </View>
            </View>

            {/* Área do flashcard */}
            <View className="flex-1 px-6 py-4 items-center justify-center">
                {/* Container geral */}
                <View className="w-full h-full relative">

                    {/* frente */}
                    <Animated.View
                        style={[frontAnimatedStyle, { backfaceVisibility: 'hidden' }]}
                        className="absolute w-full h-full bg-surface-paper rounded-3xl border border-slate-700 shadow-xl p-6"
                    >
                        {currentCard.contexto && (
                            <View className="self-start bg-primary/10 px-3 py-1.5 rounded-lg mb-6 border border-primary/20 flex-row items-center">
                                <Text className="text-primary text-xs font-bold uppercase">
                                    {currentCard.contexto}
                                </Text>
                            </View>
                        )}
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-white text-2xl font-bold text-center leading-relaxed">
                                {currentCard.pergunta}
                            </Text>
                        </ScrollView>
                    </Animated.View>

                    {/* verso */}
                    <Animated.View
                        style={[backAnimatedStyle, { backfaceVisibility: 'hidden' }]}
                        className="absolute w-full h-full bg-surface-paper rounded-3xl border border-slate-700 shadow-xl p-6"
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-slate-400 text-base mb-4 text-center">
                                {currentCard.pergunta}
                            </Text>
                            <View className="h-[1px] w-full bg-slate-700 mb-6" />
                            <Text className="text-white text-xl font-semibold leading-relaxed">
                                {currentCard.resposta}
                            </Text>
                        </ScrollView>
                    </Animated.View>
                </View>
            </View>

            {/* Ações */}
            <View className="px-6 pb-8 pt-4">
                {!isFlipped ? (
                    // botao para virar carta
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleFlip()}
                        className="bg-primary py-5 rounded-full items-center flex-row justify-center shadow-lg shadow-primary/30"
                    >
                        <Text className="text-surface font-black text-lg ml-3 uppercase tracking-wider">
                            Mostrar Resposta
                        </Text>
                    </TouchableOpacity>
                ) : (
                    // Botões de avaliação da repetição espaçada
                    <View>
                        <Text className="text-slate-400 text-center mb-4 font-semibold text-sm">
                            Como você se saiu?
                        </Text>
                        <View className="flex-row justify-between gap-2">
                            <TouchableOpacity onPress={() => handleAvaliar('errei')} className="flex-1 bg-red-500/10 border border-red-500/30 py-4 rounded-xl items-center">
                                <Text className="text-red-400 font-bold text-sm mb-1">Errei</Text>
                                <Text className="text-red-500/50 text-[10px]">&lt; 1 min</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => handleAvaliar('dificil')} className="flex-1 bg-orange-500/10 border border-orange-500/30 py-4 rounded-xl items-center">
                                <Text className="text-orange-400 font-bold text-sm mb-1">Difícil</Text>
                                <Text className="text-orange-500/50 text-[10px]">6 min</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => handleAvaliar('bom')} className="flex-1 bg-blue-500/10 border border-blue-500/30 py-4 rounded-xl items-center">
                                <Text className="text-blue-400 font-bold text-sm mb-1">Bom</Text>
                                <Text className="text-blue-500/50 text-[10px]">1 dia</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => handleAvaliar('facil')} className="flex-1 bg-green-500/10 border border-green-500/30 py-4 rounded-xl items-center">
                                <Text className="text-green-400 font-bold text-sm mb-1">Fácil</Text>
                                <Text className="text-green-500/50 text-[10px]">4 dias</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}