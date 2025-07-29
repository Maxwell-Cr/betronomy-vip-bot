const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const stripe = require('stripe')('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'); // ⛔️ Ersetze mit deinem echten Stripe Secret Key
const endpointSecret = 'whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP'; // ⛔️ Stripe Webhook Secret
const botToken = '7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y'; // ⛔️ Dein Bot-Token

const inviteLink = 'https://t.me/+wHrW2cF4Z5VmMDM0';
const telegramChatId = '-1002519491519';

const paidEmails = []; // Diese Liste wird von Stripe befüllt

const app = express();
const bot = new TelegramBot(botToken);

// ✅ Telegram Webhook Setup
bot.setWebHook(`https://betronomy-vip-bot.onrender.com/bot${botToken}`);

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/json' })); // Für Stripe

// ✅ Telegram Webhook Endpoint
app.post(`/bot${botToken}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ✅ Stripe Webhook Endpoint
app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details.email;

    if (customerEmail) {
      paidEmails.push(customerEmail.toLowerCase());
      const msg = `🔥 Thank you for your purchase!\nHere is your VIP access:\n👉 ${inviteLink}`;
      bot.sendMessage(telegramChatId, msg);
    }
  }

  res.status(200).end();
});

// ✅ Bot /start Command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, '👋 Welcome to Betronomy VIP!\nPlease send the email address you used to pay.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim().toLowerCase();
    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment recognized. Here is your VIP access:\n👉 ${inviteLink}`);
    } else {
      bot.sendMessage(chatId, `❌ Email not found. Please check or contact @captain_betronomy`);
    }
  });
});

// ✅ Start Server
app.listen(3000, () => console.log('✅ Server running on port 3000'));