const fs = require("fs");
const path = __dirname + "/coinxbalance.json";

// coinxbalance.json না থাকলে বানানো
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// ব্যালেন্স পড়া
function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  if (data[userID]?.balance != null) return data[userID].balance;

  if (userID === "100078049308655") return 50000000; // তুমি 50M$
  return 100; // অন্যরা 100$
}

// ব্যালেন্স আপডেট
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { balance };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// ব্যালেন্স ফরম্যাটিং
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2).replace(/\.00$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(2).replace(/\.00$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(2).replace(/\.00$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(2).replace(/\.00$/, '') + "k$";
  return num + "$";
}

// --- k/m/b ফরম্যাট হ্যান্ডলার ---
function parseBet(input) {
  input = input.toLowerCase().replace(/,/g, '').trim();
  let multiplier = 1;

  if (input.endsWith('k')) multiplier = 1000;
  else if (input.endsWith('m')) multiplier = 1000000;
  else if (input.endsWith('b')) multiplier = 1000000000;

  if (multiplier !== 1) input = input.slice(0, -1);

  let number = parseFloat(input);
  if (isNaN(number) || number <= 0) return null;

  return number * multiplier;
}

// --- আউটপুট ডিজাইন ফাংশন ---
function createBetMessage(win, betAmount, multiplier, newBalance) {
  let header = "🎲  BET RESULT  🎲";
  let borderTop = "╭─" + header + "─╮";
  let borderBottom = "╰─────────────────╯";
  let lines = [""];

  if (win) {
    lines.push(`│ 🎉 You won the bet!`);
    lines.push(`│ 💰 Bet: ${formatBalance(betAmount)}`);
    lines.push(`│ ⚡ Multiplier: ${multiplier}x`);
    lines.push(`│ 📌 New Balance: ${formatBalance(newBalance)}`);
  } else {
    lines.push(`│ ❌ You lost the bet!`);
    lines.push(`│ 💰 Bet: ${formatBalance(betAmount)}`);
    lines.push(`│ 📌 New Balance: ${formatBalance(newBalance)}`);
  }

  return [borderTop, ...lines, borderBottom].join("\n");
}

module.exports.config = {
  name: "bet",
  version: "1.3.0",
  hasPermssion: 0,
  credits: "Akash × ChatGPT",
  description: "Place a bet: win 3x,4x,8x,20x,50x coins!",
  commandCategory: "Economy",
  usages: "bet <amount>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { senderID, threadID, messageID } = event;
  let balance = getBalance(senderID);

  if (!args[0]) return api.sendMessage("❌ Please enter a bet amount.", threadID, messageID);

  let betAmount = parseBet(args[0]);
  if (!betAmount) return api.sendMessage("❌ Please enter a valid bet amount.", threadID, messageID);
  if (betAmount > balance) return api.sendMessage("❌ You don't have enough Coins to bet that amount.", threadID, messageID);

  const multipliers = [3, 4, 8, 20, 50];
  const chosenMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];

  const win = Math.random() < 0.5; // 50% chance

  if (win) {
    const winAmount = betAmount * chosenMultiplier;
    balance += winAmount;
    setBalance(senderID, balance);
    return api.sendMessage(
      createBetMessage(true, betAmount, chosenMultiplier, balance),
      threadID,
      messageID
    );
  } else {
    balance -= betAmount;
    if (balance < 0) balance = 0;
    setBalance(senderID, balance);
    return api.sendMessage(
      createBetMessage(false, betAmount, chosenMultiplier, balance),
      threadID,
      messageID
    );
  }
};
