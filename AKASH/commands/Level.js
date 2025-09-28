const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

module.exports.config = {
  name: "level",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "Check your level, exp and rank card",
  commandCategory: "rank",
  usages: "/level",
  cooldowns: 5
};

const dbPath = path.join(__dirname, "levelDB.json");

// ডাটাবেস লোড
function loadDB() {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath));
}

// ডাটাবেস সেভ
function saveDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event }) {
  const { senderID, threadID } = event;
  const data = loadDB();

  if (!data[senderID]) {
    data[senderID] = { exp: 0, level: 1 };
  }

  // প্রতি মেসেজে exp বাড়বে
  data[senderID].exp += 1;

  let curExp = data[senderID].exp;
  let curLevel = data[senderID].level;
  let nextExp = curLevel * 10; // প্রতি লেভেলের জন্য প্রয়োজনীয় EXP

  if (curExp >= nextExp) {
    data[senderID].level++;
    data[senderID].exp = 0;
  }

  saveDB(data);

  // Rank বের করা
  const sorted = Object.entries(data).sort(
    (a, b) => b[1].level - a[1].level || b[1].exp - a[1].exp
  );
  const rank = sorted.findIndex(([id]) => id === senderID) + 1;

  // ইউজারের নাম আনা
  let userName = "Unknown User";
  try {
    const userInfo = await api.getUserInfo(senderID);
    userName = userInfo[senderID].name || "Unknown User";
  } catch (e) {
    console.log("getUserInfo error:", e);
  }

  // Canvas card বানানো
  const width = 800,
    height = 200;
  const canvas = Canvas.createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#3a3a3a";
  ctx.fillRect(0, 0, width, height);

  // Profile Picture
  try {
    const userAvt = await Canvas.loadImage(
      `https://graph.facebook.com/${senderID}/picture?width=200&height=200`
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(userAvt, 20, 20, 160, 160);
    ctx.restore();
  } catch (e) {
    console.log("Avatar load failed:", e);
  }

  // Name
  ctx.fillStyle = "#fff";
  ctx.font = "bold 30px Arial";
  ctx.fillText(userName, 220, 60);

  // EXP, Level, Rank
  ctx.font = "20px Arial";
  ctx.fillText(`Exp ${curExp}/${nextExp}`, 220, 100);
  ctx.fillText(`Lv ${data[senderID].level}`, 700, 50);
  ctx.fillText(`#${rank}/${sorted.length}`, 700, 100);

  // Progress Bar
  ctx.fillStyle = "#555";
  ctx.fillRect(220, 120, 400, 30);
  ctx.fillStyle = "#00ff99";
  ctx.fillRect(220, 120, (curExp / nextExp) * 400, 30);

  // ইমেজ সেভ ও পাঠানো
  const imgPath = path.join(__dirname, "rankcard.png");
  fs.writeFileSync(imgPath, canvas.toBuffer());

  return api.sendMessage(
    { body: "", attachment: fs.createReadStream(imgPath) },
    threadID,
    () => {
      fs.unlinkSync(imgPath);
    }
  );
};
