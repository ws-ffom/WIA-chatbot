import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import mammoth from 'mammoth';
import ExcelJS from 'exceljs';

const Uploader = forwardRef(({ onTextReady }, ref) => {
  const [fileName, setFileName] = useState('');
  const [inputKey, setInputKey] = useState(Date.now());
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'pdf') {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:3001/extract-pdf-text', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erro ao extrair texto do PDF no backend.');
        }

        const data = await response.json();
        onTextReady(data.text || 'Nenhum texto encontrado no PDF.');
      } catch (error) {
        console.error('Erro ao enviar PDF para backend:', error);
        onTextReady('Erro ao processar o PDF.');
      }
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = await mammoth.extractRawText({ arrayBuffer: reader.result });
        onTextReady(result.value);
      };
      reader.readAsArrayBuffer(file);
    } else if (ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = async () => {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(reader.result);

        let texto = '';
        workbook.eachSheet((sheet) => {
          sheet.eachRow((row) => {
            texto += row.values.slice(1).join(' | ') + '\n';
          });
        });

        onTextReady(texto);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Formato não suportado. Aceito: PDF, DOCX ou XLSX.');
    }
  };

  const handleClear = () => {
    setFileName('');
    onTextReady('');
    setInputKey(Date.now()); // força reset do input
  };

  useImperativeHandle(ref, () => ({
    clearFile: handleClear,
  }));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <label className="upload-label" style={{ cursor: 'pointer' }}>
        📎
        <input
          key={inputKey}
          type="file"
          accept=".pdf,.docx,.xlsx"
          hidden
          onChange={handleFile}
          ref={inputRef}
        />
        <span style={{ marginLeft: '5px' }}>{fileName}</span>
      </label>

      {fileName && (
        <button
          onClick={handleClear}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'red',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: '1',
            userSelect: 'none',
          }}
          aria-label="Remover arquivo"
        >
          ❌
        </button>
      )}
    </div>
  );
});

export default Uploader;
