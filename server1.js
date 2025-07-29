const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const bodyParser = require('body-parser');
const stripe = require('stripe')('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'); // ⬅️ Ersetze mit deinem Stripe Secret Key
const endpointSecret = 'whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP'; // ⬅️ Ersetze mit deinem Stripe Webhook Secret

const paidEmails = []; // Temporärer Speicher für E-Mails

const app = express();
app.use(bodyParser.raw({ type: 'application/json' }));

const bot = new TelegramBot('7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y', { polling: true }); // ⬅️ Dein Telegram Bot Token
const inviteLink = 'https://t.me/+wHrW2cF4Z5VmMDM0'; // ⬅️ Dein VIP Telegram Link

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
    const email = session.customer_details.email.toLowerCase();

    if (!paidEmails.includes(email)) {
      paidEmails.push(email);
      console.log(`✅ E-Mail saved: ${email}`);
    }
  }

  res.status(200).end();
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, '👋 Welcome to BETRONOMY VIP!\nPlease send me the email address you used to pay.');

  bot.once('message', (emailMsg) => {
    const email = emailMsg.text.trim().toLowerCase();

    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment recognized. Here is your VIP access:\n👉 ${inviteLink}`);
    } else {
      bot.sendMessage(chatId, `❌ This email was not found.\nPlease check your entry or contact @captain_betronomy.`);
    }
  });
});

app.listen(3000, () => console.log('✅ Webhook-Server läuft auf Port 3000'));