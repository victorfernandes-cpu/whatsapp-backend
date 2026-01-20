const express = require('express');
const app = express();

app.use(express.json());

// 🔹 VERIFICAÇÃO DO WEBHOOK (GET)
app.get('/webhook', (req, res) => {
  const verifyToken = process.env.VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verificado');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// 🔹 RECEBER MENSAGENS (POST) — NÃO VALIDAR TOKEN
app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:');
  console.log(JSON.stringify(req.body, null, 2));

  // Sempre responder 200
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
