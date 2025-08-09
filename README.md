# Financeiro do Yago

Aplicação de finanças pessoais.

## OCR de Recibos

- Bucket de storage `receipts` com acesso restrito ao dono.
- Função Edge `parse_receipt` usa [Tesseract.js](https://github.com/naptha/tesseract.js) para extrair descrição, valor, data, CNPJ, forma de pagamento e categoria sugerida.
- Logs das extrações são gravados em `receipt_parses` para auditoria.

Em produção podemos substituir o Tesseract.js por serviços como Google Vision ou AWS Textract para maior precisão e performance.
