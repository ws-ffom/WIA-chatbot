// src/utils/firebaseLogs.js
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase';

export async function salvarLog(pergunta, resposta, documento, usuario) {
  try {
    await addDoc(collection(db, 'logs'), {
      pergunta,
      resposta,
      documento,
      usuario,
      data: serverTimestamp()
    });
  } catch (e) {
    console.error('Erro ao salvar log no Firestore:', e);
  }
}

export async function buscarLogsRelacionados(novaPergunta) {
  try {
    const logsSnapshot = await getDocs(query(collection(db, 'logs')));
    const todosLogs = logsSnapshot.docs.map(doc => doc.data());

    const relacionados = todosLogs.filter(log =>
      novaPergunta.toLowerCase().includes(log.pergunta.toLowerCase()) ||
      log.pergunta.toLowerCase().includes(novaPergunta.toLowerCase())
    );

    // Retorna até 3 respostas anteriores
    return relacionados.slice(-3).map(log => `Pergunta anterior: ${log.pergunta}\nResposta: ${log.resposta}`).join('\n\n');
  } catch (error) {
    console.error('Erro ao buscar logs relacionados:', error);
    return '';
  }
}