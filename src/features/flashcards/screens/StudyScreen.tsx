import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { Flashcard } from "../components/Flashcard";
import { ArrowLeftCircleIcon, XIcon, RotateCcwIcon, MapPinIcon } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolate } from "react-native-reanimated";
import Toast from "react-native-toast-message";

import { collectionGroup, query, getDocs, limit, doc, updateDoc, Timestamp, where } from "firebase/firestore";
import { db } from "../../../config/firebase";

const { width } = Dimensions.get('window');

interface FlashcardData {
    id: string;
    pergunta: string;
    resposta: string;
    contexto?: string;
    refPath: string;
}

export function StudyScreen() {
    const router = useRouter();

    // estados de dados
    const [cards, setCards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState(true);

    // estados visuais
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const rotationProgress = useSharedValue(0); // 0 - frente, 1 - verso

    const currentCard = cards[currentIndex];
    const totalCards = cards.length;
    const progressPercentage = ((currentIndex + 1) / totalCards) * 100;


    // busca global para sessão diaria
    useEffect(() => {
        const carregarSessaoDiaria = async () => {
            try {
                const hoje = new Date();

                // le todas subcoleções "flashcards"
                const q = query(
                    collectionGroup(db, 'flashcards'),
                    where('proximaRevisao', '<=', hoje),
                    limit(20) // test
                );

                const querySnapshot = await getDocs(q);
                const cardsCarregados: FlashcardData[] = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    cardsCarregados.push({
                        id: doc.id,
                        pergunta: data.pergunta,
                        resposta: data.resposta,
                        contexto: data.contexto,
                        refPath: doc.ref.path
                    });
                });

                setCards(cardsCarregados);
            } catch (error) {
                console.error("Erro ao carregar a sessão global:", error);                
            } finally {
                setLoading(false);
            }
        };

        carregarSessaoDiaria();
    }, []);


    // dispara a virada
    const handleFlip = () => {
        const nextValue = isFlipped ? 0 : 1;
        setIsFlipped(!isFlipped);
    
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
    

    // função para avançar ou finalizar sessão
    const handleAvaliar = async (nivel: string) => {
        console.log(`Card avaliado como: ${nivel}`);

        const cardAtual = cards[currentIndex];

        // recupera as variaveis atuais do card
        let intervaloAtual = (cardAtual as any).intervaloDias || 0;
        let repeticoesAtuais = (cardAtual as any).repeticoes || 0;
        let fatorAtual = (cardAtual as any).fatorFacilidade || 2.5;

        let novoIntervalo = 1;
        let novasRepeticoes = 0;
        let novoFator = fatorAtual;

        // sm-2 algorithm based on feedback
        switch (nivel) {
            case 'errei':
                // reinicia o ciclo e penaliza fator de facilidade
                novasRepeticoes = 0;
                novoIntervalo = 0; // volta para a fila imediata
                novoFator = Math.max(1.3, fatorAtual - 0.2); // não fica menor que 1.3
                break;

            case 'dificil':
                novasRepeticoes = repeticoesAtuais + 1;
                novoIntervalo = repeticoesAtuais === 0 ? 1 : Math.round(intervaloAtual * 1.2);
                novoFator = Math.max(1.3, fatorAtual - 0.15);
                break;

            case 'bom':
                novasRepeticoes = repeticoesAtuais + 1;
                if (novasRepeticoes === 1) {
                    novoIntervalo = 1; // 1 dia
                } else if (novasRepeticoes === 2) {
                    novoIntervalo = 4; // 4 dias
                } else {
                    novoIntervalo = Math.round(intervaloAtual * fatorAtual); // exponencial
                }
                break;

            case 'facil':
                novasRepeticoes = repeticoesAtuais + 1;
                if (novasRepeticoes === 1) {
                    novoIntervalo = 4;
                } else {
                    novoIntervalo = Math.round(intervaloAtual * fatorAtual * 1.3);
                }
                novoFator = fatorAtual + 0.15; // aumenta o fator de facilidade
                break;
        }

        // data de retorno
        const dataProximaRevisao = new Date();
        dataProximaRevisao.setDate(dataProximaRevisao.getDate() + novoIntervalo);

        try {
            // atualiza o card instantaneamente no banco de dados
            const cardRef = doc(db, cardAtual.refPath);
            await updateDoc(cardRef, {
                intervaloDias: novoIntervalo,
                repeticoes: novasRepeticoes,
                fatorFacilidade: novoFator,
                proximaRevisao: dataProximaRevisao
            });
        } catch (error) {
            console.error("Erro ao salvar progresso do algoritmo:", error);
            Toast.show({
                type: 'error',
                text1: 'Erro ao salvar progresso',
                text2: 'Não foi possível atualizar o cartão.'
            });
        }

        // avança ou finaliza a sessão
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

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-surface justify-center items-center">
                <ActivityIndicator size="large" color="#EAB308"/>
                <Text className="text-slate-400 mt-4">Carregando cartões...</Text>
            </SafeAreaView>
        );
    }
    


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

                {totalCards > 0 && (
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-white font-bold">
                            Card {currentIndex + 1} <Text className="text-slate-500"> de {totalCards}</Text>
                        </Text>
                        <Text className="text-primary font-bold">{Math.round(progressPercentage)}%</Text>
                    </View>
                )}

                {/* Barra de progresso */}
                {totalCards > 0 && (
                    <View className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${progressPercentage}%`}}
                        />
                    </View>
                )}
            </View>

            {/* Área do flashcard */}
            {totalCards === 0 ? (
                <View className="flex-1 items-center justify-center px-6 mb-10">
                    <Text className="text-slate-400 text-center">
                        Nenhum cartão para revisar hoje!
                    </Text>
                </View>
            ) : (
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
            )}


            {/* Ações */}
            {totalCards > 0 && (
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
                                <TouchableOpacity onPress={() => handleAvaliar('errei')} className="flex-1 bg-red-500 border border-red-500/30 py-4 rounded-3xl items-center">
                                    <Text className="text-white font-bold text-sm mb-1">Errei</Text>
                                    <Text className="text-white text-[10px]">&lt; 1 min</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity onPress={() => handleAvaliar('dificil')} className="flex-1 bg-orange-500 border border-orange-500/30 py-4 rounded-3xl items-center">
                                    <Text className="text-white font-bold text-sm mb-1">Difícil</Text>
                                    <Text className="text-white text-[10px]">6 min</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity onPress={() => handleAvaliar('bom')} className="flex-1 bg-blue-500 border border-blue-500/30 py-4 rounded-3xl items-center">
                                    <Text className="text-white font-bold text-sm mb-1">Bom</Text>
                                    <Text className="text-white text-[10px]">1 dia</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity onPress={() => handleAvaliar('facil')} className="flex-1 bg-green-500 border border-green-500/30 py-4 rounded-3xl items-center">
                                    <Text className="text-white font-bold text-sm mb-1">Fácil</Text>
                                    <Text className="text-white text-[10px]">4 dias</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}