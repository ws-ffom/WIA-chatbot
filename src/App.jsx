import { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/logo.png';
import { perguntarAoChatGPT } from './api';
import Login from './Login';
import { salvarLog, buscarLogsRelacionados } from './utils/firebaseLogs';
import { buscarConhecimentoRelacionado } from './utils/firebaseConhecimento'; // 🔹 IMPORTANTE
import Uploader from './components/Uploader';
import AudioRecorder from './components/AudioRecorder';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content:
        'Olá, sou WIA (Wilson Intelligent Assistant), um assistente virtual simpático e eficiente da empresa Wilson Sons! Como posso te ajudar hoje?',
    },
  ]);
  const [input, setInput] = useState('');
  const [contextoDoc, setContextoDoc] = useState('');

  const messagesEndRef = useRef(null);
  const uploaderRef = useRef(null);

  useEffect(() => {
    const user = localStorage.getItem('usuario');
    if (user) {
      setUsuario(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleChat = () => setChatVisible((prev) => !prev);

  const handleSend = async () => {
    if (!input.trim() && !contextoDoc.trim()) return;

    const userMessage = input.trim()
      ? { role: 'user', content: input }
      : { role: 'user', content: '[Documento enviado sem mensagem]' };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setMessages((prev) => [...prev, { role: 'bot', content: '__PENSANDO__' }]);

    try {
      const contextoLogs = await buscarLogsRelacionados(input);
      const contextoBase = await buscarConhecimentoRelacionado(input);

      const contextoFinal = [contextoLogs, contextoBase].filter(Boolean).join('\n\n');

      const resposta = await perguntarAoChatGPT(input || '', contextoFinal, contextoDoc);

      salvarLog(
        input || '[Documento enviado sem mensagem]',
        resposta,
        contextoDoc,
        usuario.email
      );

      if (uploaderRef.current) {
        uploaderRef.current.clearFile();
      }

      setMessages((prev) => {
        const mensagensSemPensando = [...prev];
        mensagensSemPensando.pop();
        return [...mensagensSemPensando, { role: 'bot', content: resposta }];
      });

      setContextoDoc('');
    } catch (error) {
      console.error(error);
      setMessages((prev) => {
        const mensagensSemPensando = [...prev];
        mensagensSemPensando.pop();
        return [...mensagensSemPensando, { role: 'bot', content: '❌ Erro ao consultar a IA.' }];
      });
    }
  };

  if (!usuario) {
    return <Login onLoginSuccess={() => setUsuario(true)} />;
  }

  return (
    <div className="full-screen">
      <button className="toggle-button" onClick={toggleChat}>
        <img src={logo} alt="Logo" />
      </button>

      {chatVisible && (
        <div className="chat-container">
          <div className="chat-header">💬 WIA Chatbot</div>
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.content === '__PENSANDO__' ? (
                  <img src="/src/assets/navio.gif" alt="Pensando..." className="gif-navio" />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input">
            <Uploader
              ref={uploaderRef}
              onTextReady={(texto) => {
                setContextoDoc(texto);
              }}
            />
            <AudioRecorder
              onTextReady={(textoTranscrito) => {
                setInput(textoTranscrito);
              }}
            />
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend}>Enviar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
