// utils/firebaseConhecimento.js
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

export async function buscarConhecimentoRelacionado(novaPergunta) {
  try {
    const baseSnapshot = await getDocs(query(collection(db, 'base_conhecimento')));
    const documentos = baseSnapshot.docs.map(doc => doc.data());

    const entradaLower = novaPergunta.toLowerCase();

    const relacionados = documentos.filter(item => {
      if (!item.contexto || !item.conteudo) return false;

      return (
        item.contexto.toLowerCase().includes(entradaLower) ||
        item.conteudo.toLowerCase().includes(entradaLower)
      );
    });

    return relacionados
      .slice(0, 3)
      .map(item => `Base de Conhecimento - ${item.contexto}:\n${item.conteudo}`)
      .join('\n\n');

  } catch (error) {
    console.error('Erro ao buscar base de conhecimento:', error);
    return '';
  }
}
