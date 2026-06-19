import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

import { db } from '../../../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

// interface para definir o formato do caderno
interface Caderno {
  id: string;
  titulo: string;
  flashcardsCount: number;
  ultimoAcesso: string;
}


export function DashboardScreen() {
  const router = useRouter();

  // estados para guardar os livros que vem da nuvem e controlar o carregamento
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cria uma consulta para a coleção 'cadernos', ordenando pelo último acesso mais recente.
    const q = query(collection(db, 'cadernos'), orderBy('ultimoAcesso', 'desc'));

    // onSnapshot "escuta" as mudanças na consulta em tempo real.
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const listaCadernos: Caderno[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // conversao do timestamp para data legivel
        let dataFormatada = 'Data desconhecida';
        if (data.ultimoAcesso) {
          const dataJS = data.ultimoAcesso.toDate();
          const agora = new Date();
          const diffMs = agora.getTime() - dataJS.getTime();
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          const diffHours = Math.floor(diffMinutes / 60);
          const diffDays = Math.floor(diffHours / 24);

          if (diffHours < 1) {
            dataFormatada = `há ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
          } else if (diffHours < 24) {
            dataFormatada = `há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
          } else if (diffDays < 30) {
            dataFormatada = `há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
          } else {
            dataFormatada = `em ${dataJS.getDate().toString().padStart(2, '0')}/${(dataJS.getMonth() + 1).toString().padStart(2, '0')}/${dataJS.getFullYear()}`;
          }
        }

        listaCadernos.push({
          id: doc.id,
          titulo: data.titulo || 'Sem título',
          flashcardsCount: data.flashcardsCount || 0,
          ultimoAcesso: dataFormatada,
        });
      });

      setCadernos(listaCadernos);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar cadernos em tempo real:', error);
      setLoading(false);
    });

    // Função de limpeza: é executada quando o componente é desmontado.
    // Isso desliga o "ouvinte" para evitar vazamentos de memória.
    return () => unsubscribe();
  }, []); // O array vazio garante que o efeito rode apenas uma vez.

  return (
    <ScrollView className="flex-1 bg-surface px-6 pt-16">
      
      {/* Cabeçalho de Boas-vindas */}
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-white tracking-tight">
          Bom dia, Vitor!
        </Text>

      {(cadernos.reduce((acc, caderno) => acc + caderno.flashcardsCount, 0)) === 0 ? (
        <Text className="text-slate-400 mt-2 text-base">
          Você ainda não tem flashcards para revisar hoje.
        </Text>
      ) : (
        <Text className="text-slate-400 mt-2 text-base">
          Você tem
          <Text className="font-bold text-primary font-serif">  
            {` `}{cadernos.reduce((acc, caderno) => acc + caderno.flashcardsCount, 0)}{(cadernos.reduce((acc, caderno) => acc + caderno.flashcardsCount, 0)) === 1 ? ' flashcard' : ' flashcards'}{` `}
          </Text>
            para revisar hoje.
          </Text>
      )}

        
      </View>

      {/* Botão de Ação Principal */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/study')}
        className="bg-primary rounded-3xl p-6 mb-4 shadow-sm flex-row items-center justify-between"
      >
        <View>
          <Text className="text-white font-semibold mb-1 uppercase tracking-wider text-xs">
            Sessão Diária
          </Text>
          <Text className="text-white text-xl font-extrabold">
            Começar Revisão
          </Text>
        </View>
        
        <View className="bg-white h-12 w-12 rounded-full items-center justify-center">
          <ArrowRight color="#EAB308" size={24} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/study')}
        className="bg-green-500 rounded-3xl p-6 mb-10 shadow-sm flex-row items-center justify-between"
      >
        <View>
          <Text className="text-white font-semibold mb-1 uppercase tracking-wider text-xs">
            sessão de revisão
          </Text>
          <Text className="text-white text-xl font-extrabold">
            Criar rotina de estudos
          </Text>
        </View>
        
        <View className="bg-white h-12 w-12 rounded-full items-center justify-center">
          <ArrowRight color="#22c55e" size={24} />
        </View>
      </TouchableOpacity>

      {/* Seção de Cadernos / Leituras */}
      <View className="mb-6 bg-white p-6 rounded-3xl ">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-xl font-black text-surface">Leituras recentes</Text>
          <TouchableOpacity onPress={() => { router.push('/library')}} className="bg-surface-paper px-3 py-1 rounded-full border border-slate-700">
            <Text className="text-white font-semibold">Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View className="flex-1 items-center justify-center mt-4 mb-6">
            <ActivityIndicator size="large" color="#EAB308" />
          </View>
        )}

        {cadernos.length === 0 && !loading ? (
          <View className="items-center justify-center mt-6 mb-8">
            <Text className="text-slate-400 text-center">Nenhum caderno encontrado. Crie o seu primeiro caderno para começar a estudar!</Text>
          </View>
        ) : (
          cadernos.slice(0, 3).map((caderno) => (
            <TouchableOpacity 
              activeOpacity={0.7}
              className="bg-surface-paper p-5 rounded-2xl  shadow-sm mb-3 flex-row items-center"
              key={caderno.id}
              onPress={() => router.push(`/book/${caderno.id}`)}
            >
              {/* Ícone do PDF adaptado para o modo escuro */}
              <View className="bg-red-500/10 h-12 w-12 rounded-xl items-center justify-center mr-4 border border-red-500/20">
                <Text className="text-red-400 font-bold text-xs uppercase">PDF</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base" numberOfLines={1}>
                  {caderno.titulo}
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  {caderno.flashcardsCount === 0 ? 'Nenhum flashcard' : caderno.flashcardsCount === 1 ? '1 flashcard' : `${caderno.flashcardsCount} flashcards`} • Acesso {caderno.ultimoAcesso}
                </Text>
              </View>
          </TouchableOpacity>
          )
        ))}
      
        {/* Placeholder de um Caderno/PDF existente */}
        

        {/* Botão de Adicionar Novo Arquivo */}
        <TouchableOpacity 
          activeOpacity={0.7}
          onPress={() => router.push('/create-book')}
          className="bg-surface-paper p-2 rounded-full border-slate-700 mb-6 items-center justify-center py-4"
        >
          <Text className="text-white text-xl font-semibold items-center justify-center">
            + Novo Caderno
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}