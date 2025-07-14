import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import cors from 'cors';

const app = express();
const upload = multer(); // buffer em memória (não grava em disco)

app.use(cors()); // permite requisições de qualquer origem (você pode limitar se quiser)

// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('Servidor backend PDF ativo!');
});

// Rota principal: recebe um arquivo e retorna o texto extraído
app.post('/extract-pdf-text', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const dataBuffer = req.file.buffer;

    // Extração de texto com pdf-parse
    const data = await pdfParse(dataBuffer);

    // Retorna apenas o texto extraído
    res.json({ text: data.text });

  } catch (err) {
    console.error('Erro ao processar PDF:', err);
    res.status(500).json({ error: 'Erro interno ao processar o PDF.' });
  }
});

// Inicia o servidor na porta 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor backend rodando em http://localhost:${PORT}`);
});
