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

  // যদি তুমি হও (owner), ডিফল্ট 50M, অন্যরা 100
  if (userID === "100078049308655") return 50000000;
  return 100;
}

// ব্যালেন্স আপডেট
function setBalance(userID, balance) {
  const data = JSON.parse(fs.readFileSync(path));
  data[userID] = { balance };
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
  name: "send",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Akash × ChatGPT",
  description: "Send money to another user",
  commandCategory: "Economy",
  usages: "/send Money <amount> @user",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID, messageID, mentions } = event;

  if (!args[0] || args[0].toLowerCase() !== "money")
    return api.sendMessage("❌ Usage: /send Money <amount> @user", threadID, messageID);

  if (!args[1] || isNaN(args[1]))
    return api.sendMessage("❌ Please enter a valid amount.", threadID, messageID);

  if (!mentions || Object.keys(mentions).length === 0)
    return api.sendMessage("❌ Please tag a user to send money.", threadID, messageID);

  const targetID = Object.keys(mentions)[0];
  const amount = parseInt(args[1]);

  if (amount <= 0) return api.sendMessage("❌ Invalid amount.", threadID, messageID);

  let senderBalance = getBalance(senderID);
  if (senderBalance < amount)
    return api.sendMessage("❌ You don't have enough balance.", threadID, messageID);

  let receiverBalance = getBalance(targetID);

  senderBalance -= amount;
  receiverBalance += amount;

  setBalance(senderID, senderBalance);
  setBalance(targetID, receiverBalance);

  const senderName = await Users.getNameUser(senderID);
  const receiverName = await Users.getNameUser(targetID);

  return api.sendMessage(
    `✅ Transaction Successful!\n\n👤 ${senderName} sent ${formatBalance(amount)} to ${receiverName}.\n📌 Your New Balance: ${formatBalance(senderBalance)}`,
    threadID,
    messageID
  );
};
