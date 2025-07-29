const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const stripe = require('stripe')('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');
const endpointSecret = 'whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP';

const app = express();
app.use(bodyParser.raw({ type: 'application/json' }));

// In-memory storage (you can later switch to DB or file)
const paidEmails = [];

// Telegram setup
const bot = new TelegramBot('7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y', { polling: true });
const inviteLink = 'https://t.me/+wHrW2cF4Z5VmMDM0';

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;

    if (customerEmail) {
      const emailLower = customerEmail.toLowerCase();
      paidEmails.push(emailLower);
      console.log(`✅ Payment from: ${emailLower}`);
    }

    const message = `🔥 Thank you for your purchase!\nHere is your VIP access:\n👉 ${inviteLink}`;
    bot.sendMessage('-1002519491519', message);
  }

  res.status(200).end();
});

// Telegram Bot /start logic
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '👋 Welcome to Betronomy VIP!\nPlease send the email you used to pay.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim().toLowerCase();

    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment recognized. Here is your VIP access:\n👉 ${inviteLink}`);
    } else {
      bot.sendMessage(chatId, `❌ Email not found. Please check or contact @captain_betronomy`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));