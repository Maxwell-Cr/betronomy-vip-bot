const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// Stripe Webhook (raw body nötig!)
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Stripe Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details?.email || 'unknown';
    const message = `🔥 Thank you for your purchase!\nDanke ${email}!\nHere is your VIP access:\n👉 https://t.me/+wHrW2cF4Z5VmMDM0`;

    const bot = new TelegramBot(process.env.'7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y', { polling: false });
    bot.sendMessage(process.env.'-1002519491519', message);
  }

  res.status(200).end();
});

app.listen(3000, () => console.log('✅ Server läuft auf Port 3000'));