const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.json({
    message: 'Servidor funcionando!',
    port: port,
    url: `http://localhost:${port}`
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});