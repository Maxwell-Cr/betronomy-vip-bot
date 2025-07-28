const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Nur für Stripe Webhook: rohen Body verwenden!
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || 'Unbekannt';

    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
    const message = `🔥 Zahlung erfolgreich!\nDanke ${email}!\nHier ist dein VIP-Zugang:\n👉 https://t.me/+wHrW2cF4Z5VmMDM0`;

    bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message);
  }

  res.status(200).end();
});

app.listen(3000, () => console.log('✅ Server läuft auf Port 3000'));
