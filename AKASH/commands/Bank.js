const fs = require("fs");
const path = __dirname + "/coinxbalance.json";

// coinxbalance.json না থাকলে বানানো
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({}, null, 2));
}

// ব্যালেন্স ফাংশন
function getBalance(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  return data[userID]?.balance || 0;
}

// ব্যাংক ফাংশন
function getBank(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  return data[userID]?.bank || 0;
}

// ব্যালেন্স আপডেট
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { ...data[userID], balance };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// ব্যাংক আপডেট
function setBank(userID, bank) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { ...data[userID], bank };
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// ফরম্যাটিং ফাংশন
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + "k$";
  return num + "$";
}

module.exports.config = {
  name: "bank",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MOHAMMAD AKASH",
  description: "Deposit or withdraw coins to/from your bank",
  commandCategory: "Economy",
  usages: "bank deposit <amount> | bank withdraw <amount>",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users }) {
  const { threadID, senderID, messageID } = event;
  const userName = await Users.getNameUser(senderID);

  if (!args[0] || !["deposit", "withdraw"].includes(args[0].toLowerCase())) {
    return api.sendMessage("❌ Use: bank deposit <amount> or bank withdraw <amount>", threadID, messageID);
  }

  const action = args[0].toLowerCase();
  const amount = parseInt(args[1]);

  if (!amount || amount <= 0) {
    return api.sendMessage("❌ Please provide a valid amount.", threadID, messageID);
  }

  let balance = getBalance(senderID);
  let bank = getBank(senderID);

  if (action === "deposit") {
    if (balance < amount) return api.sendMessage("❌ You don't have enough coins in your balance.", threadID, messageID);
    balance -= amount;
    bank += amount;
    setBalance(senderID, balance);
    setBank(senderID, bank);
    return api.sendMessage(`✅ Deposited ${formatBalance(amount)} to your bank.\n💰 Balance: ${formatBalance(balance)}\n🏦 Bank: ${formatBalance(bank)}`, threadID, messageID);
  }

  if (action === "withdraw") {
    if (bank < amount) return api.sendMessage("❌ You don't have enough coins in your bank.", threadID, messageID);
    bank -= amount;
    balance += amount;
    setBalance(senderID, balance);
    setBank(senderID, bank);
    return api.sendMessage(`✅ Withdrew ${formatBalance(amount)} from your bank.\n💰 Balance: ${formatBalance(balance)}\n🏦 Bank: ${formatBalance(bank)}`, threadID, messageID);
  }
};
