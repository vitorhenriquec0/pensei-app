import React, { useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ArrowLeftCircleIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BookDetailScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // referencia para controlar a gaveta (abrir e fechar caso necessário)
    const bottomSheetRef = useRef<BottomSheet>(null);

    // define as posições da gaveta em relação à tela
    const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

    return (
        <View className="flex-1 bg-surface pt-16">
            {/* Cabeçalho */}
            <View className="px-6 flex-row items-center justify-between mb-6">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeftCircleIcon color="#94a3b8" size={28} />
                    <Text className="text-slate-400 font-bold">Voltar</Text>
                </TouchableOpacity>
                <Text className="text-white font-bold text-base" numberOfLines={1}>
                    Engenharia de Software
                </Text>
                <View className="w-12"/>
            </View>

            {/* Leitura */}
            <ScrollView className="flex-1 px-6">
                <Text className="text-slate-300 text-lg leading-relaxed text-justify mb-40">
                    O projeto de arquitetura de software deve mitigar riscos de manutenção precoce. 
                        {'\n\n'}
                    <Text className="bg-primary/20 text-primary font-bold px-1 rounded">
                        O princípio do Baixo Acoplamento defende que os módulos devem ser independentes
                    </Text>
                    , garantindo que alterações isoladas não propaguem erros colaterais em cascata por todo o sistema.
                    {'\n\n'}
                    Esta modularidade permite que equipes trabalhem em paralelo, substituindo peças da arquitetura sem comprometer o núcleo da aplicação.
                </Text>
            </ScrollView>

            {/* Bottom Sheet */}
            <BottomSheet
                ref={bottomSheetRef}
                index={0} // começa em 15% da tela
                snapPoints={snapPoints}
                backgroundStyle={{ backgroundColor: '#1E293B' }}
                handleIndicatorStyle={{ backgroundColor: '#475569' }}
            >
                <View className="flex-1 px-6 pt-2" style={{ paddingBottom: insets.bottom }}>
                    {/* Topo */}
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-white font-bold text-lg">Flashcards deste Material</Text>
                        <Text className="text-primary font-bold">24 cards</Text>
                    </View>

                    {/* Adicionar rápido */}
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => router.push('/create-card')}
                        className="bg-surface border border-dashed border-slate-600 rounded-xl p-4 items-center mb-6"
                    >
                        <Text className="text-slate-400 font-semibold text-sm">
                            + Toque para fixar um trecho
                        </Text>
                    </TouchableOpacity>

                    {/* Lista Simples de Cards existentes */}
                    <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                        <View className="bg-surface rounded-xl p-4 mb-3 border border-slate-800">
                            <Text className="text-primary text-[10px] font-bold uppercase mb-1">
                                Cap. 3 - Acoplamento
                            </Text>
                            <Text className="text-white font-bold text-sm">
                                O que o princípio do Baixo Acoplamento defende?
                            </Text>
                        </View>
                        <View className="bg-surface rounded-xl p-4 mb-3 border border-slate-800">
                            <Text className="text-primary text-[10px] font-bold uppercase mb-1">
                                Cap.4 - Coesão
                            </Text>
                            <Text className="text-white font-bold text-sm">
                                Qual a diferença estrutural entre coesão e acoplamento?
                            </Text>
                        </View>
                    </BottomSheetScrollView>
                </View>
            </BottomSheet>
        </View>
    )
}