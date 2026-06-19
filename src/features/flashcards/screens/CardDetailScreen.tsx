import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { ArrowLeftCircleIcon } from "lucide-react-native";

export function CardDetailScreen() {
    const router = useRouter();

    // pegar os dois ponteiros da URL
    const { livroId, cardId } = useLocalSearchParams();

    const [pergunta, setPergunta] = useState('');
    const [resposta, setResposta] = useState('');
    const [contexto, setContexto] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // leitura unica
    useEffect(() => {
        const fetchCard = async () => {
            if (!livroId || !cardId || typeof livroId !== 'string' || typeof cardId !== 'string') return;

            try {
                // o caminho da subcolecao: cadernos -> ID -> flashcards -> ID
                const cardRef = doc(db, 'cadernos', livroId, 'flashcards', cardId);
                const cardSnap = await getDoc(cardRef);

                if (cardSnap.exists()) {
                    const data = cardSnap.data();
                    setPergunta(data.pergunta || '');
                    setResposta(data.resposta || '');
                    setContexto(data.contexto || '');
                } else {
                    Alert.alert('Erro', 'Flashcard não encontrado');
                    router.back();
                }
            } catch (error) {
                console.error("Erro ao procurar o card:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [livroId, cardId]);

    // atualizar dados
    const handleAtualizar = async () => {
        if (!pergunta.trim() || !resposta.trim()) return;
        setSaving(true);

        try {
            const cardRef = doc(db, 'cadernos', livroId as string, 'flashcards', cardId as string);
            await updateDoc(cardRef, {
                pergunta: pergunta.trim(),
                resposta: resposta.trim(),
                contexto: contexto.trim(),
            });
            router.back();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
        } finally {
            setSaving(false);
        }
    };

    // apagar dados
    const handleApagar = async () => {
        Alert.alert(
            "Apagar Flashcard",
            "Realmente deseja apagar este flashcard? Esta ação não pode ser desfeita.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Apagar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const cardRef = doc(db, 'cadernos', livroId as string, 'flashcards', cardId as string);
                            await deleteDoc(cardRef);

                            router.back();
                        } catch (error) {
                            console.error("Erro ao apagar:", error);
                            
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-surface items-center justify-center">
                <ActivityIndicator size="large" color="#EAB308" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-surface">
            <View className="flex-1 px-6 pt-16">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeftCircleIcon color="#94a3b8" size={24} />
                        <Text className="text-slate-400 text-lg">Voltar</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-bold text-lg">Editar Flashcard</Text>
                    <TouchableOpacity onPress={handleApagar} className="p-2">
                        <Text className="text-red-400 font-bold">Apagar</Text>
                    </TouchableOpacity>
                </View>

                {/* Campos identicos ao de criacao */}
                <TextInput
                    multiline numberOfLines={2}
                    value={contexto} onChangeText={setContexto}
                    placeholder="Contexto (Opcional)" placeholderTextColor="#64748B"
                    className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base mb-4"
                />
                
                <TextInput
                    multiline numberOfLines={3}
                    value={pergunta} onChangeText={setPergunta}
                    placeholder="Pergunta" placeholderTextColor="#64748B"
                    className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base mb-4"
                />

                <TextInput
                    multiline numberOfLines={4}
                    value={resposta} onChangeText={setResposta}
                    placeholder="Resposta" placeholderTextColor="#64748B"
                    className="bg-surface-paper text-white p-4 rounded-2xl border border-slate-800 text-base mb-8 textAlignVertical-top"
                />

                <TouchableOpacity
                    activeOpacity={0.8} onPress={handleAtualizar} disabled={saving}
                    className="bg-primary rounded-full p-4 items-center justify-center flex-row"
                >
                    {saving ? <ActivityIndicator color="#0F172A" /> : <Text className="text-surface font-extrabold text-base">Salvar alterações</Text>}
                </TouchableOpacity>

            </View>
        </KeyboardAvoidingView>
    )
}