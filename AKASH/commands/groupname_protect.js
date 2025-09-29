/**
 * groupname_protect.js
 * Auto-save & auto-restore group name when changed.
 * Styled messages version with Admin/Bot exclusion.
 *
 * Usage:
 * 1) Bot must have admin rights in the group (so it can setTitle).
 * 2) Place this file in your modules folder and restart the bot.
 */

const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "groupname_protect",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Mohammad Akash",
  description: "Auto-save & restore group name (exclude Admin/Bot), styled messages",
  commandCategory: "admin",
  usages: "auto (no prefix needed — Auto-Save & Restore)",
  cooldowns: 3
};

const DATA_DIR = path.resolve(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "groupNames.json");

function ensureDB() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}), "utf8");
}

function readDB() {
  ensureDB();
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    console.error("Error reading groupNames DB:", e);
    return {};
  }
}

function writeDB(db) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function styledMessage(type, groupName = "") {
  switch(type) {
    case "autoSave":
      return `╭─━━━━━━━━━━━━─╮
✅ 𝐀𝐮𝐭𝐨𝐦𝐚𝐭𝐢𝐜 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞 𝐒𝐚𝐯𝐞𝐝
╰─━━━━━━━━━━━━─╯

📌 আগে থেকে কোন নাম ছিল না, তাই বর্তমান নাম সেভ করা হলো:
💬 ${groupName}

🛡️ এখন থেকে নাম পরিবর্তন হলে বট স্বয়ংক্রিয়ভাবে আগের নাম রিস্টোর করবে.`;
    case "restore":
      return `╭─━━━━━━━━━━━━─╮
⚠️ 𝐆𝐫𝐨𝐮𝐩 𝐍𝐚𝐦𝐞 𝐑𝐞𝐬𝐭𝐨𝐫𝐞𝐝
╰─━━━━━━━━━━━━─╯

📌 নাম পরিবর্তিত হয়েছিল, তাই আগের নাম ফিরিয়ে দেওয়া হলো:
💬 ${groupName}

🛡️ দয়া করে গ্রুপের নাম পরিবর্তন করবেন না। 
অ্যাডমিনের অনুমতি ছাড়া নাম বদলাবেন না.`;
    default: return groupName;
  }
}

module.exports.run = async ({ api, event }) => {
  const { threadID } = event;
  const db = readDB();

  try {
    const info = await new Promise((res, rej) => api.getThreadInfo(threadID, (err, d) => err ? rej(err) : res(d)));
    db[threadID] = db[threadID] || {};
    if (!db[threadID].name && info.threadName) {
      db[threadID].name = info.threadName;
      writeDB(db);
      return api.sendMessage(styledMessage("autoSave", info.threadName), threadID);
    }
  } catch(e) {
    return api.sendMessage("❌ এরর: গ্রুপ ইনফো নেয়া যায়নি।", threadID);
  }
};

module.exports.handleEvent = async ({ api, event }) => {
  try {
    const { threadID, logMessageType, logMessageData } = event;
    if (logMessageType && logMessageType !== "log:thread-name") return;

    const db = readDB();
    const entry = db[threadID];
    if (!entry || !entry.name) {
      try {
        const info = await new Promise((res, rej) => api.getThreadInfo(threadID, (err, d) => err ? rej(err) : res(d)));
        db[threadID] = db[threadID] || {};
        if (!db[threadID].name && info.threadName) {
          db[threadID].name = info.threadName;
          writeDB(db);
          return api.sendMessage(styledMessage("autoSave", info.threadName), threadID);
        }
      } catch(e){}
      return;
    }

    const savedName = entry.name;
    let info;
    try {
      info = await new Promise((res, rej) => api.getThreadInfo(threadID, (err, d) => err ? rej(err) : res(d)));
    } catch(e){ return; }

    const currentName = info.threadName || "";
    if (currentName === savedName) return;

    // চেঞ্জ কারা করেছে
    const changerID = logMessageData?.author || logMessageData?.adminID;
    const botID = api.getCurrentUserID();

    // সকল অ্যাডমিন IDs
    const threadAdmins = info.adminIDs?.map(a => a.id) || [];

    // যদি যিনি চেঞ্জ করেছেন তারা বট বা অ্যাডমিন হয়, রিস্টোর না করা
    if (changerID === botID || threadAdmins.includes(changerID)) return;

    // অন্যরা চেঞ্জ করলে রিস্টোর
    api.setTitle(savedName, threadID, (err) => {
      if (err) {
        console.error("Failed to restore group name:", err);
        return api.sendMessage("❌ *𝐄𝐫𝐫𝐨𝐫:* নাম রিস্টোর করতে পারছি না — বটকে অ্যাডমিন করা আছে কি দেখো।", threadID);
      }
      api.sendMessage(styledMessage("restore", savedName), threadID);
    });

  } catch(e) {
    console.error("handleEvent error:", e);
  }
};
