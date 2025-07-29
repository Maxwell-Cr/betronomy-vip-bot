const express = require("express");
const bodyParser = require("body-parser");
const TelegramBot = require("node-telegram-bot-api");
const stripe = require("stripe")("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");
const fs = require("fs");

const app = express();
const bot = new TelegramBot("7659647125:AAF_6pQfQAZw4Ab_1oQVW1niacQqd3IcE9Y", { polling: true });

// ✅ Stripe Webhook Setup (raw body required!)
app.use(
  "/webhook",
  express.raw({ type: "application/json" })
);

// 📁 Fake DB: Bezahlte E-Mails (temporär)
let paidEmails = [];

app.post("/webhook", (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      "whsec_GyBq4cWsVQ7fC3oglrF849uni4eQpWfP"
    );
  } catch (err) {
    console.log("❌ Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Successful payment
  if (event.type === "checkout.session.completed") {
    const email = event.data.object.customer_email.toLowerCase();
    if (!paidEmails.includes(email)) {
      paidEmails.push(email);
      console.log("✅ New paid email added:", email);
    }
  }

  res.json({ received: true });
});

// 🟣 Telegram Bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, `👋 Welcome to Betronomy VIP!\nPlease send the email address you used to pay.`);

  bot.once("message", (emailMsg) => {
    if (emailMsg.chat.id !== chatId) return;

    const email = emailMsg.text.trim().toLowerCase();
    if (paidEmails.includes(email)) {
      bot.sendMessage(chatId, `✅ Payment recognized. Here is your VIP access:\n👉 https://t.me/+wHrW2cF4Z5VmMDM0`);
    } else {
      bot.sendMessage(chatId, `❌ Email not found. Please check or contact @captain_betronomy`);
    }
  });
});

// 🚀 Start Server
app.listen(3000, () => {
  console.log("🔥 Server is running on port 3000");
});