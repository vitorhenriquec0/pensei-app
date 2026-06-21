import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftCircleIcon, ArrowRight, XIcon, Settings, FileText, Plus, BookX } from 'lucide-react-native';

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
    <ScrollView className="flex-1 bg-surface px-6 pt-16" showsVerticalScrollIndicator={false}>
      
      {/* Cabeçalho */}
      <View className="flex-row justify-between items-start mb-8">
        <View className="flex-1 mr-4">
          <Text className="text-3xl font-black text-white tracking-tight">
            Bom dia, Vitor!
          </Text>
          {(cadernos.reduce((acc, caderno) => acc + caderno.flashcardsCount, 0)) === 0 ? (
            <Text className="text-slate-400 mt-1 text-base">
              Nenhum flashcard para hoje.
            </Text>
          ) : (
            <Text className="text-slate-400 mt-1 text-base leading-5">
              Você tem <Text className="text-primary font-bold font-serif">{cadernos.reduce((acc, caderno) => acc + caderno.flashcardsCount, 0)} flashcards</Text> para revisar hoje.
            </Text>
          )}
        </View>
        <TouchableOpacity className="bg-slate-800 p-3 rounded-2xl border border-slate-700">
          <Settings color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Botão da Sessão Diária */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/study', params: { modo: 'diaria' }})}
        className="bg-primary rounded-3xl p-6 mb-4 shadow-xl shadow-yellow-500/20 flex-row items-center justify-between overflow-hidden"
      >
        <View className="flex-1 mr-4">
          <Text className="text-white/80 font-bold mb-1 uppercase tracking-wider text-xs">
            Sessão Diária
          </Text>
          <Text className="text-white text-2xl font-black">
            Começar Revisão
          </Text>
        </View>
        
        <View className="bg-white h-12 w-12 rounded-full items-center justify-center shadow-sm">
          <ArrowRight color="#EAB308" size={24} />
        </View>
      </TouchableOpacity>


      {/* Botão da Sessão de Estudos Personalizados */}
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => setStudyModalVisible(true)}
        className="bg-amber-100 rounded-3xl p-6 mb-10 shadow-sm flex-row items-center justify-between border border-amber-200 overflow-hidden"
      >
        <View className='absolute inset-0 z-0 opacity-20'>
              <Image source={require('../../../../assets/images/FundoAmarelo.png')} className="w-full h-full scale-150" />
        </View>
        <View className="flex-1 mr-4">
          <Text className="text-primary-dark/60 font-bold mb-1 uppercase tracking-wider text-xs">
            Sessão de Estudo Personalizado
          </Text>
          <Text className="text-primary-dark text-xl font-bold">
            Iniciar <Text className="font-serif font-black">Revisão Personalizada</Text> 
          </Text>
        </View>
        
        <View className="bg-primary-dark h-12 w-12 rounded-full items-center justify-center">
          <ArrowRight color="#fef3c7" size={24} />
        </View>
      </TouchableOpacity>


      <View className="mb-10 px-1">
        
        {/* Cabeçalho da Secção */}
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-black text-white tracking-tight">Leituras Recentes</Text>
          <TouchableOpacity 
            onPress={() => router.push('/library')} 
            className="bg-slate-800 px-4 py-2 rounded-full border border-slate-700"
          >
            <Text className="text-slate-300 font-bold text-xs">Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#EAB308" className="my-8" />
        ) : cadernos.length === 0 ? (
          
          <View className="bg-slate-800/30 p-8 rounded-[32px] items-center justify-center mb-4 border border-slate-800 border-dashed">
            <View className="bg-slate-800 p-4 rounded-full mb-4">
              <BookX color="#94a3b8" size={32} />
            </View>
            <Text className="text-white font-bold text-base mb-1">Nenhum caderno aqui</Text>
            <Text className="text-slate-400 text-sm text-center mb-6 px-4">
              A sua biblioteca está vazia. Crie o seu primeiro caderno para começar a estudar.
            </Text>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => router.push('/create-book')}
              className="bg-primary px-6 py-3 rounded-full flex-row items-center"
            >
              <Plus color="#ffffff" size={20} />
              <Text className="text-white font-bold ml-2">Criar Caderno</Text>
            </TouchableOpacity>
          </View>

        ) : (
          <View>
            {/* Lista de Cadernos */}
            {cadernos.slice(0, 3).map((caderno) => (
              <TouchableOpacity 
                activeOpacity={0.8}
                key={caderno.id}
                onPress={() => router.push(`/book/${caderno.id}`)}
                className="bg-slate-800 p-4 rounded-[28px] mb-3 flex-row items-center shadow-lg shadow-black/20"
              >
                {/* Ícone com fundo suave */}
                <View className="bg-red-500/10 h-14 w-14 rounded-2xl items-center justify-center mr-4">
                  <FileText color="#f87171" size={24} />
                </View>
                
                <View className="flex-1 pr-2">
                  <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>
                    {caderno.titulo}
                  </Text>
                  <Text className="text-slate-400 text-xs">
                    {caderno.flashcardsCount} flashcard{caderno.flashcardsCount !== 1 && 's'} • {caderno.ultimoAcesso}
                  </Text>
                </View>

                {/* Pequena seta de indicação de clique */}
                <View className="bg-slate-700/50 p-2 rounded-full">
                  <ArrowRight color="#94a3b8" size={16} />
                </View>
              </TouchableOpacity>
            ))}

            {/* Botão Novo Caderno (Caso já existam cadernos) */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => router.push('/create-book')}
              className="bg-slate-800/50 p-5 rounded-[28px] mt-2 flex-row items-center justify-center border border-slate-700"
            >
              <Plus color="#94a3b8" size={20} />
              <Text className="text-slate-400 font-bold text-sm ml-2 uppercase tracking-wider">
                Novo Caderno
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
                <Text className='text-black/50 font-medium tracking-wider text-center mt-4'>Nenhum caderno criado ainda.</Text>
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