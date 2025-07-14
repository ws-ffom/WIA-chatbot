import { useState, useRef } from 'react';

export default function AudioRecorder({ onTextReady }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      if (audioBlob.size > 5 * 1024 * 1024) {
        alert('Arquivo de áudio muito grande!');
        return;
      }

      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_HF_TOKEN}`,
              'Content-Type': 'audio/wav',
            },
            body: audioBlob,
          }
        );

        const data = await response.json();

        if (data.error) {
          console.error('Erro da API:', data.error);
          return;
        }

        if (data.text) {
          onTextReady(data.text);
        }
      } catch (err) {
        console.error('Erro na transcrição:', err);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Para automaticamente após 45 segundos
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, 45000); // 45 segundos
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      style={{
        backgroundColor: isRecording ? '#e74c3c' : '#3498db',
        color: 'white',
        border: 'none',
        padding: '6px 10px',
        marginLeft: '6px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
      }}
    >
      {isRecording ? '⏹️ Parar (45s)' : '🎤 Áudio'}
    </button>
  );
}
