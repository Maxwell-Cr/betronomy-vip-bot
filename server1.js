const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const stripe = require('stripe')('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'); // ✅ Ersetze mit echtem Key

const endpointSecret = 'whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP'; // ✅ Ersetze mit deinem Stripe Secret
const botToken = '7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y'; // ✅ Ersetze mit deinem Bot-Token
const inviteLink = 'https://t.me/+wHrW2cF4Z5VmMDM0';
const telegramChatId = '-1002519491519';

const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(botToken);
bot.setWebHook('https://betronomy-vip-bot.onrender.com/telegram'); // ✅ Ersetze mit deiner echten Render-URL

const paidEmails = []; // ⏳ Optional: echte Validierung folgt

// 🔁 Stripe Webhook
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const message = `🔥 Thank you for your purchase!\nHere is your VIP access:\n👉 ${inviteLink}`;
    bot.sendMessage(telegramChatId, message);
  }

  res.status(200).send('Received');
});

// 🔁 Telegram Webhook
app.post('/telegram', (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🧠 Telegram Bot-Logik
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Welcome to Betronomy VIP!\nPlease send the email you used to pay.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim().toLowerCase();

    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment found. VIP Access:\n👉 ${inviteLink}`);
    } else {
      bot.sendMessage(chatId, `❌ Email not found. Please check or contact @captain_betronomy`);
    }
  });
});

// 🚀 Server starten
app.listen(3000, () => console.log('Server ready on port 3000'));