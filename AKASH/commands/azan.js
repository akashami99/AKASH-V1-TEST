// azan.js
// Auto Azan notification in ALL groups (Manual time version)
// File: modules/commands/azan.js

const schedule = require("node-schedule");

module.exports.config = {
  name: "azan",
  version: "3.0.5",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "প্রতিদিন আজানের সময় সব গ্রুপে অটো নোটিফিকেশন পাঠাবে",
  commandCategory: "Islamic",
  usages: "অটো রান",
  cooldowns: 5
};

let jobs = [];

module.exports.onLoad = async function({ api }) {
  // আজানের টাইম (বাংলাদেশ স্ট্যান্ডার্ড টাইম)
  const prayerTimes = {
    "ফজর": { time: "04:30", emoji: "🌅" },
    "যোহর": { time: "13:00", emoji: "🌞" },
    "আসর": { time: "16:15", emoji: "🌤" },
    "মাগরিব": { time: "18:05", emoji: "🌇" },
    "এশা": { time: "20:30", emoji: "🌙" }
  };

  for (let [prayer, data] of Object.entries(prayerTimes)) {
    const [hour, minute] = data.time.split(":").map(Number);

    const job = schedule.scheduleJob({ hour, minute, tz: "Asia/Dhaka" }, function () {
      const msg = `✦──────────────────✦
   🕌 আল্লাহু আকবার 🕌
✦──────────────────✦

${data.emoji} এখন ${prayer} এর আজান শুরু হয়েছে!
🧼 ওযু করে নামাজের জন্য প্রস্তুত হও 🤲

━━━━━━━━━━━━━━━
🤖 𝗯𝗼𝘁 𝗼𝘄𝗻𝗲𝗿:
            𝗠𝗼𝗵𝗮𝗺𝗺𝗮𝗱 𝗔𝗸𝗮𝘀𝗵`;

      // সব গ্রুপে পাঠাবে
      for (const threadID of global.data.allThreadID) {
        api.sendMessage(msg, threadID);
      }
    });

    jobs.push(job);
  }

  console.log("✅ আজান নোটিফিকেশন সিস্টেম চালু হয়েছে (সব গ্রুপে)।");
};

module.exports.run = async function() {
  // কোনো কমান্ড দরকার নেই, অটো চলবে
};
