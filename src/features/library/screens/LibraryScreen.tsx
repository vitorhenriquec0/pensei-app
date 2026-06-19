import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, Trash2Icon } from "lucide-react-native";
import { collection, query, orderBy, onSnapshot, QuerySnapshot, doc, deleteDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { db } from "../../../config/firebase";

// interface para definir o formato do caderno
interface Caderno {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacaoFormatada: string;
  flashcardsCount: number;
  progresso: number;
  ultimoAcesso: string;
}

export function LibraryScreen() {
  const router = useRouter();

  // estados para guardar os livros que vem da nuvem e controlar o carregamento
  const [cadernos, setCadernos] = useState<Caderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleted, setDeleted] = useState(false); // estado para controlar exclusão

  // o hook useEffect liga o ouvinte assim que ocrâ abre
  useEffect(() => {
    // aponta para a coleção e ordena do mais recente p/ o mais antigo
    const q = query(collection(db, 'cadernos'), orderBy('dataCriacao', 'desc'));

    // onSnapshot fica à escuta de mudanças
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const listaCadernos: Caderno[] = [];

      QuerySnapshot.forEach((doc) => {
        const data = doc.data();

        // conversao do timestamp para data legivel
        let dataFormatada = 'Data desconhecida';
        if (data.dataCriacao) {
          const dataJS = data.dataCriacao.toDate();
          dataFormatada = `${dataJS.getDate()}/${dataJS.getMonth() + 1}/${dataJS.getFullYear()}`;
        }

        listaCadernos.push({
          id: doc.id,
          titulo: data.titulo || 'Sem título',
          descricao: data.descricao || '',
          dataCriacaoFormatada: dataFormatada,
          flashcardsCount: data.flashcardsCount || 0,
          progresso: data.progresso || 0,
          ultimoAcesso: 'Hoje', // tratar mais tarde
        });
      });

      setCadernos(listaCadernos);
      setLoading(false);
    });

    // limpeza: desliga o radio se sair do ecra
    return () => unsubscribe();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Apagar Caderno",
      "Tem certeza que deseja apagar este caderno permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "cadernos", id));
              setDeleted(true); // Opcional, o onSnapshot já vai atualizar a lista sozinho
              
              Toast.show({
                type: 'success',
                text1: 'Sucesso!',
                text2: 'Caderno apagado com sucesso.',
              });
            } catch (error) {
              console.error("Erro ao apagar caderno:", error);
              Toast.show({
                type: 'error',
                text1: 'Erro',
                text2: 'Não foi possível apagar o caderno.',
              });
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-surface pt-16">
      {/* Cabeçalho fixo */}
      <View className="px-6 mb-4">
        <Text className="text-3xl font-extrabold text-white tracking-tight mb-6">
          Sua Biblioteca
        </Text>

        {/* Barra de pesquisa */}
        <View className="bg-surface-paper flex-row items-center px-4 py-2 rounded-full border border-slate-700 mb-2">
          <Search color="#94a3b8" size={18} />
          <TextInput
            placeholder="Buscar cadernos..."
            placeholderTextColor="#64748B"
            className="flex-1 text-white text-base"
          />
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#EAB308" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-6">
          <Text className="text-slate-400 font-semibold mb-4 uppercase text-xs tracking-wider">
            Todos os Cadernos ({cadernos.length})
          </Text>

          {/* Caso nao tenha nenhum caderno */}
          {cadernos.length === 0 && (
            <View className="items-center justify-center mt-10">
              <Text className="text-slate-500 text-center">Nenhum caderno encontrado. Crie o seu primeiro caderno para começar a estudar!</Text>
            </View>
          )}

          {/* Mapeia os cadernos */}

          {cadernos.map((book) => (
            <TouchableOpacity
              key={book.id}
              activeOpacity={0.7}
              className="bg-surface rounded-2xl p-4 mb-4 border border-slate-700 flex-row items-center shadow-sm"
              onPress={() => {
                  router.push(`/book/${book.id}`);
              }}
            >
              {/* Ícone do PDF */}
              <View className="flex-column">
                <View className="w-20 h-28 bg-surface border border-slate-600 rounded-lg items-center justify-center mr-4 p-2 shadow-inner">
                  <Text className="text-slate-500 font-extrabold text-xs mb-2">
                    PDF
                  </Text>
                  <View className="w-full h-1 bg-slate-700 rounded-full mb-1" />
                  <View className="w-3/4 h-1 bg-slate-700 rounded-full mb-1" />
                  <View className="w-full h-1 bg-slate-700 rounded-full" />
                </View>

                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => handleDelete(book.id)}
                  className="flex-row justify-center items-center mt-2 mr-4 bg-red-400 p-1 rounded-full w-20"
                >
                  <Trash2Icon color="#fff" size={14} />
                  <Text className="text-white font-bold text-[10px] ml-1.5 uppercase">Apagar</Text>
                </TouchableOpacity>
              </View>
              {/* Informações e Metadados */}
              <View className="flex-1">
                  <Text className="text-white font-bold text-base mb-1 leading-tight">
                      {book.titulo}
                  </Text>

                  {book.descricao ? (
                   <Text className="text-slate-400 text-xs mb-2" numberOfLines={1}>{book.descricao}</Text>
                  ) : null}

                  <View className="flex-row items-center mb-1">
                      <Text className="text-primary font-bold text-xs">
                          {book.flashcardsCount} Flashcards
                      </Text>
                      <Text className="text-slate-600 text-xs mx-2">•</Text>
                      <Text className="text-slate-400 text-xs">Criado em {book.dataCriacaoFormatada}</Text>
                  </View>

                  <Text className="text-slate-500 text-xs mb-3">Último acesso: {book.ultimoAcesso}</Text>

                  {/* Barra de progresso de leitura */}
                  <View className="w-full">
                      <View className="flex-row justify-between mb-1">
                          <Text className="text-slate-400 text-[10px] font-semibold uppercase">Progresso</Text>
                          <Text className="text-slate-400 text-[10px] font-bold">{book.progresso}%</Text>
                      </View>
                      <View className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <View
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${book.progresso}%` }}
                          />
                      </View>
                  </View>
              </View>
            </TouchableOpacity>
          ))}
          
          <View className="h-24" />
        </ScrollView>
      )}
        
    </View>
  );
}
