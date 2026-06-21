import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftCircleIcon, ArrowRight, XIcon } from 'lucide-react-native';

import { db } from '../../../config/firebase';
import { collection, onSnapshot, query, orderBy, snapshotEqual } from 'firebase/firestore';

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

  // estados para o modal de estudo personalizado
  const [studyModalVisible, setStudyModalVisible] = useState(false);
  const [cadernosDisponiveis, setCadernosDisponiveis] = useState<{id: string, titulo: string}[]>([]);
  const [cadernosSelecionados, setCadernosSelecionados] = useState<string[]>([]);

  // busca apenas os titulos e ids dos cadernos para a lista
  useEffect(() => {
    const q = query(collection(db, 'cadernos'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        titulo: doc.data().titulo || 'Sem Título'
      }));
      setCadernosDisponiveis(lista);
    });
    return () => unsubscribe();
  }, []);

  // marcar/desmarcar caderno na lista de seleção
  const toggleCaderno = (id: string) => {
    setCadernosSelecionados(prev => 
      prev.includes(id)
        ? prev.filter(item => item !== id) // remove se já estiver selecionado
        : [...prev, id] // adiciona se nao estiver
    );
  };

  const close_reset_modal = () => {
    setStudyModalVisible(false);
    setCadernosSelecionados([]);
  };

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

  const fundoSvg = `
  <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H400V400H0V0Z" fill="#FBBF24"/>
    <path d="M200 0C310.457 0 400 89.543 400 200C400 310.457 310.457 400 200 400C89.543 400 0 310.457 0 200C0 89.543 89.543 0 200 0Z" fill="#F59E0B"/>
    <path d="M200 50C270.711 50 330 109.289 330 180C330 250.711 270.711 310 200 310C129.289 310 70 250.711 70 180C70 109.289 129.289 50 200 50Z" fill="#FBBF24"/>
  </svg>
`;

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

      {/* Botão da Sessão Diária */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/study', params: { modo: 'diaria' }})}
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


      {/* Botão da Sessão de Estudos Personalizados */}
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => setStudyModalVisible(true)}
        className="bg-amber-100 rounded-3xl p-6 mb-10 shadow-sm flex-row items-center justify-between"
      >
        <View className='absolute inset-0 z-0 opacity-30 rounded-3xl overflow-hidden'>
              <Image source={require('../../../../assets/images/FundoAmarelo.png')} className="w-full h-full scale-150" />
        </View>
        <View>
          <Text className="text-primary-dark font-semibold mb-1 uppercase tracking-wider text-xs">
            Sessão de Estudo Personalizado
          </Text>
          <Text className="text-primary-dark text-xl font-extrabold">
            Iniciar <Text className="font-serif font-black italic text-xl">Revisão Personalizada</Text>
          </Text>
        </View>
        
        <View className="bg-primary-dark h-12 w-12 rounded-full items-center justify-center">
          <ArrowRight color="#fef3c7" size={24} />
        </View>
      </TouchableOpacity>

      {/* Seção de Cadernos / Leituras */}
      <View className="mb-6 bg-white p-6 rounded-3xl ">
        <View className="flex-row justify-between items-end mb-4">
          <Text className="text-xl font-black text-surface">Leituras recentes</Text>
          <TouchableOpacity onPress={() => { router.push('/library')}} className="bg-surface-paper px-3 py-1 rounded-full border border-slate-700">
            <Text className="text-white font-semibold text-sm">Ver todas</Text>
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
          <Text className="text-white text-lg font-semibold items-center justify-center">
            + Novo Caderno
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal de Sessão de Estudos Personalizados */}
      <Modal
        animationType='fade'
        transparent={true}
        visible={studyModalVisible}
        onRequestClose={() => setStudyModalVisible(false)}
      >
        {/* Fundo escuro que fecha ao clicar fora */}
        <TouchableOpacity
          className='flex-1 bg-black/70 justify-center items-center px-5'
          activeOpacity={1}
          onPress={() => close_reset_modal()}
        >
          {/* Cartão Branco */}
          <View
            className='bg-amber-100 w-full max-h-[80%] rounded-3xl p-6 shadow-2xl'
            onStartShouldSetResponder={() => true} // impede que o toque propague para o fundo
          >
            <View className='absolute inset-0 z-0 opacity-30 rounded-3xl overflow-hidden' pointerEvents='none'>
              <Image source={require('../../../../assets/images/FundoAmarelo.png')}
                className="w-full h-full scale-125" 
                resizeMode='cover'
              />
            </View>
            <View className='flex-column justify-center items-center mb-6 gap-4'>
              <View className='flex justify-center items-center'>
                <Text className='text-primary-dark text-xl font-bold'>Sessão de</Text>
                <Text className='text-primary-dark font-serif font-black italic text-2xl'>Estudos Personalizados</Text>
              </View>
              <Text className='text-primary-dark font-bold uppercase tracking-wider text-xs'>Selecione os cadernos para revisar</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={true} className='mb-6 max-h-[280px] flex-shrink'>
              {cadernosDisponiveis.length === 0 ? (
                <Text className='text-slate-400 text-center mt-4'>Nenhum caderno criado ainda.</Text>
              ) : (
                cadernosDisponiveis.map((caderno) => {
                  const selecionado = cadernosSelecionados.includes(caderno.id);
                  return (
                    <TouchableOpacity
                      key={caderno.id}
                      activeOpacity={0.7}
                      onPress={() => toggleCaderno(caderno.id)}
                      className={`flex-row items-center justify-between p-4 mb-3 rounded-2xl shadow shadow-black-500/30 ${
                        selecionado ? 'bg-green-500 border-green-700' : 'bg-primary border-primary-dark'
                        }`}
                    >
                      <Text className={`font-bold flex-1 pr-4 ${selecionado ? 'text-white' : 'text-primary-light'}`}>
                        {caderno.titulo}
                      </Text>
                      {/* circulo checkbox */}
                      <View className={`h-6 w-6 rounded-full border-1 items-center justify-center flex-shrink ${
                        selecionado ? 'border-green-700 ' : 'border-surface-paper'
                      }`}>
                        {selecionado && <View className='h-2 w-2 bg-surface-paper rounded-full' />}
                      </View>
                    </TouchableOpacity>
                  )
                })
              )}
            </ScrollView>

            {/* Botão de Iniciar Sessão */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={cadernosSelecionados.length === 0}
              onPress={() => {
                setStudyModalVisible(false);
                router.push({
                  pathname: '/study',
                  params: {
                    modo: 'personalizada',
                    cadernosIds: JSON.stringify(cadernosSelecionados)
                  }
                });
                setCadernosSelecionados([]);
              }}
              className={`py-4 rounded-full items-center shadow-lg ${
                cadernosSelecionados.length > 0 ? 'bg-green-500 shadow-green-500/30' : 'bg-primary-dark'
              }`}
            >
              <Text className={`font-black text-lg uppercase tracking-wider ${
                cadernosSelecionados.length > 0 ? 'text-white' : 'text-amber-100'
              }`}>
                Iniciar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}