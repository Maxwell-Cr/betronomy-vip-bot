const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const TelegramBot = require('node-telegram-bot-api');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const telegramGroup = process.env.TELEGRAM_GROUP_ID;

const bot = new TelegramBot(telegramToken, { polling: false });

// 🔥 Optional: Root-Route anzeigen
app.get('/', (req, res) => {
  res.send('🔥 Betronomy VIP Bot is running!');
});

// 🔐 RAW Body für Stripe Webhook
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Nur bei erfolgreichem Kauf
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    bot.sendMessage(telegramGroup, `✅ Neue VIP Anmeldung: ${email}`);
  }

  res.sendStatus(200);
});

// ✅ Server starten
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));
