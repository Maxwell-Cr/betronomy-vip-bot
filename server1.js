const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const stripe = require('stripe')('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');
const endpointSecret = 'whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP';
const botToken = '7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y';

const app = express();
const bot = new TelegramBot(botToken);

// 🟢 Telegram Webhook
bot.setWebHook(`https://betronomy-vip-bot.onrender.com/bot${botToken}`);

// 👉 Stripe braucht *rohen* Body
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Stripe Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle Checkout Success
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details.email;

    if (customerEmail) {
      paidEmails.push(customerEmail.toLowerCase());
      bot.sendMessage('-1002519491519', `🔥 VIP bezahlt: ${customerEmail}`);
    }
  }

  res.status(200).end();
});

// 🟢 Alles andere: JSON erlaubt
app.use(bodyParser.json());

// ✅ Telegram-Webhook-Empfang
app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🟢 Telegram /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Welcome to Betronomy VIP!\nPlease send the email address you used to pay.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim().toLowerCase();
    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment recognized. Here is your VIP access:\n👉 https://t.me/+wHrW2cF4Z5VmMDM0`);
    } else {
      bot.sendMessage(chatId, `❌ Email not found. Please check or contact @captain_betronomy`);
    }
  });
});

app.listen(3000, () => console.log('🚀 Server is running on port 3000'));