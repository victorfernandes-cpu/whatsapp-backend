const express = require('express');
const axios = require('axios'); // 🔹 ADICIONADO
const app = express();

app.use(express.json());

// 🔹 VERIFICAÇÃO DO WEBHOOK (GET) — NÃO MEXE
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

// 🔹 RECEBER E RESPONDER MENSAGENS (POST)
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    // Se não for mensagem, ignora
    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const from = message.from;        // número do usuário
    const text = message.text.body;   // texto recebido

    console.log('Mensagem recebida:', text);

    // 🔹 RESPOSTA AUTOMÁTICA
    const resposta = `Olá! Recebi sua mensagem: ${text}`;

    await axios.post(
      `https://graph.facebook.com/v19.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: resposta }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.sendStatus(200);
  } catch (erro) {
    console.error('Erro ao responder:', erro.response?.data || erro.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
