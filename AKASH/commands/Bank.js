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

  // ডিফল্ট ব্যালেন্স
  if (userID === "100078049308655") return 50000000;
  return 100;
}

// ব্যালেন্স আপডেট
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  if (!data[userID]) data[userID] = {};
  data[userID].balance = balance;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// ব্যাংক পড়া
function getBank(userID) {
  const data = JSON.parse(fs.readFileSync(path));
  return data[userID]?.bank || 0;
}

// ব্যাংক আপডেট
function setBank(userID, bank) {
  const data = JSON.parse(fs.readFileSync(path));
  if (!data[userID]) data[userID] = {};
  data[userID].bank = bank;
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

// ব্যালেন্স ফরম্যাটিং
function formatBalance(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(1).replace(/\.0$/, '') + "T$";
  if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + "B$";
  if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + "M$";
  if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + "k$";
  return num + "$";
}

module.exports.config = {
  name: "bank",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Akash × ChatGPT",
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
    return api.sendMessage(
      `✅ Deposited ${formatBalance(amount)} to your bank.\n💰 Balance: ${formatBalance(balance)}\n🏦 Bank: ${formatBalance(bank)}`,
      threadID,
      messageID
    );
  }

  if (action === "withdraw") {
    if (bank < amount) return api.sendMessage("❌ You don't have enough coins in your bank.", threadID, messageID);
    bank -= amount;
    balance += amount;
    setBalance(senderID, balance);
    setBank(senderID, bank);
    return api.sendMessage(
      `✅ Withdrew ${formatBalance(amount)} from your bank.\n💰 Balance: ${formatBalance(balance)}\n🏦 Bank: ${formatBalance(bank)}`,
      threadID,
      messageID
    );
  }
};
