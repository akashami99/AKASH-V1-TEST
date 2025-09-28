// =========================
// Express server for UptimeRobot
// =========================
const express = require("express");
const app = express();

// Root route for UptimeRobot ping
app.get("/", (req, res) => {
  res.send("Bot is running!");
});

// Port from environment (Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// =========================
// Discord Bot code start
// =========================
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Client setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Event: ready
client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

// Example command handling (Main.js / index.js code merged)
const prefix = "!"; // অথবা তোমার মূল prefix
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.reply("Pong! 🏓");
  }

  // এখানে তোমার অন্য মূল কমান্ডগুলো add করো
});

// Login with bot token
client.login(process.env.TOKEN);
// =========================
// Discord Bot code end
// =========================
