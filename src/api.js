export async function perguntarAoChatGPT(mensagemUsuario, contexto = '', contextoDoc = '') {
  function limitarTexto(texto, limite = 10000) {
    if (!texto) return '';
    return texto.length > limite
      ? texto.slice(0, limite) + '\n\n[Texto cortado por limite de tamanho]'
      : texto;
  }

  const logsLimitados = limitarTexto(contexto, 8000);
  const docLimitado = limitarTexto(contextoDoc, 10000);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'ChatWS',
    },
    body: JSON.stringify({
      model: 'mistralai/mistral-small-3.2-24b-instruct:free',
      messages: [
        {
          role: 'system',
          content: `Você é o WIA (Wilson Intelligent Assistant), um assistente virtual simpático e eficiente da empresa Wilson Sons.

🧠 Seu papel é:
- Auxiliar colaboradores com dúvidas internas da empresa
- Ajudar na abertura de chamados
- Orientar os analistas no tratamento e resolução de chamados
- Usar a base de conhecimento corporativa como referência

⚠️ Atenção máxima:
- Você **NUNCA** deve usar informações que não estejam estritamente relacionadas à Wilson Sons.
- Se o conteúdo fornecido no documento não for da Wilson Sons, **ignore completamente** e informe ao usuário que não pode responder por falta de contexto.
- Não faça suposições, nem fale sobre documentos genéricos.
- Se for enviado apenas um documento, avalie o conteúdo e explique, caso tenha relação com à Wilson Sons.


📚 Abaixo está um contexto extraído de interações anteriores (logs), para enriquecer sua resposta:

${logsLimitados || '(Sem contexto fornecido no momento)'}

📎 Abaixo está um conteúdo extraído de um documento enviado pelo usuário:

${docLimitado || '(Nenhum documento enviado)'}
`
        },
        {
          role: 'user',
          content: mensagemUsuario
        }
      ]
    })
  });

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Erro ${response.status}: ${erro}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
