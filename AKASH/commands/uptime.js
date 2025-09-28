const os = require('os');
const startTime = new Date();

module.exports = {
 config: {
 name: "uptime",
 version: "2.0.2",
 hasPermssion: 0,
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Show system info and uptime with loading animation",
 commandCategory: "system",
 usages: "uptime",
 prefix: false,
 cooldowns: 5
 },
 run: async function ({ api, event }) {
 const { threadID } = event;
 
 try {
 let msg = await api.sendMessage("🔵 𝙎𝙔𝙎𝙏𝙀𝙈 𝙎𝙏𝘼𝙏𝙐𝙎: Initializing...\n\n[█▒▒▒▒▒▒▒▒▒]", threadID);
 await new Promise(r => setTimeout(r, 1000));
 await api.unsendMessage(msg.messageID);
 
 msg = await api.sendMessage("🟣 𝙎𝙔𝙎𝙏𝙀𝙈 𝙎𝙏𝘼𝙏𝙐𝙎: Processing...\n\n[████▒▒▒▒▒▒]", threadID);
 await new Promise(r => setTimeout(r, 1000));
 await api.unsendMessage(msg.messageID);
 
 msg = await api.sendMessage("🟢 𝙎𝙔𝙎𝙏𝙀𝙈 𝙎𝙏𝘼𝙏𝙐𝙎: Almost Done...\n\n[██████████]", threadID);
 await new Promise(r => setTimeout(r, 1000));
 await api.unsendMessage(msg.messageID);
 
 const uptimeSec = (new Date() - startTime) / 1000;
 const days = Math.floor(uptimeSec / 86400);
 const hours = Math.floor((uptimeSec % 86400) / 3600);
 const minutes = Math.floor((uptimeSec % 3600) / 60);
 const seconds = Math.floor(uptimeSec % 60);
 const uptimeFormatted = `${days}d ${hours}h ${minutes}m ${seconds}s`;
 
 const cpuUsage = os.cpus().map(c => c.times.user).reduce((a, b) => a + b) / os.cpus().length;
 const totalMem = os.totalmem() / 1073741824;
 const freeMem = os.freemem() / 1073741824;
 const usedMem = totalMem - freeMem;
 
 const now = new Date();
 const date = now.toLocaleDateString("en-US");
 const time = now.toLocaleTimeString("en-US", { timeZone: "Asia/Kolkata", hour12: true });
 const ping = Math.floor(Math.random() * 100);
 const status = ping < 1000 ? "✅ Smooth System" : "⛔ Bad System";
 
 const finalMsg = `♡ ∩_∩
（„• ֊ •„)♡
╭─∪∪────────────⟡
│ CYBER ☢️ 𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
│ ⏰ RUNTIME
│ ${uptimeFormatted}
├───────────────⟡
│ 👑 SYSTEM INFO
│ OS: ${os.type()} ${os.arch()}
│ LANG VER: ${process.version}
│ CPU MODEL: ${os.cpus()[0].model}
│ STORAGE: ${usedMem.toFixed(2)} GB / ${totalMem.toFixed(2)} GB
│ CPU USAGE: ${cpuUsage.toFixed(1)}%
│ RAM USAGE: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
├───────────────⟡
│ ✅ OTHER INFO
│ DATE: ${date}
│ TIME: ${time}
│ PING: ${ping}ms
│ STATUS: ${status}
╰───────────────⟡`;
 
 await api.sendMessage(finalMsg, threadID);
 } catch (error) {
 console.error("Uptime command error:", error);
 await api.sendMessage("❌ Failed to load uptime info.", threadID);
 }
 }
};