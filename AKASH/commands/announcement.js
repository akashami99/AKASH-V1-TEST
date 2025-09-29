const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "announcement",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Mohammad Akash",
  description: "সকল গ্রুপে Announcement পাঠান (টেক্সট, ইমেজ, ভিডিও, অডিও, ফাইল সহ)",
  commandCategory: "Admin",
  usages: "/announcement <টেক্সট> বা রিপ্লাই দিয়ে মেসেজ দিন",
  cooldowns: 5,
};

const boldText = (text) => {
  const map = {
    "A":"𝐀","B":"𝐁","C":"𝐂","D":"𝐃","E":"𝐄","F":"𝐅","G":"𝐆","H":"𝐇",
    "I":"𝐈","J":"𝐉","K":"𝐊","L":"𝐋","M":"𝐌","N":"𝐍","O":"𝐎","P":"𝐏",
    "Q":"𝐐","R":"𝐑","S":"𝐒","T":"𝐓","U":"𝐔","V":"𝐕","W":"𝐖","X":"𝐗",
    "Y":"𝐘","Z":"𝐙","a":"𝐚","b":"𝐛","c":"𝐜","d":"𝐝","e":"𝐞","f":"𝐟",
    "g":"𝐠","h":"𝐡","i":"𝐢","j":"𝐣","k":"𝐤","l":"𝐥","m":"𝐦","n":"𝐧",
    "o":"𝐨","p":"𝐩","q":"𝐪","r":"𝐫","s":"𝐬","t":"𝐭","u":"𝐮","v":"𝐯",
    "w":"𝐰","x":"𝐱","y":"𝐲","z":"𝐳"
  };
  return text.split("").map(c => map[c] || c).join("");
};

module.exports.run = async ({ api, event, args, Users }) => {
  try {
    const allThreads = global.data.allThreadID || [];
    const senderName = boldText(await Users.getNameUser(event.senderID));
    let successCount = 0;
    let failedCount = 0;

    const sendText = (text) => `╭─━━━━━━━━━━━━─╮\n   📢 𝐀𝐧𝐧𝐨𝐮𝐧𝐜𝐞𝐝 By: ${senderName}\n╰─━━━━━━━━━━━━─╯\n\n💬 ${text}`;

    if (event.type === "message_reply") {
      const replyMsg = event.messageReply;
      const attachments = replyMsg.attachments || [];

      for (const attachment of attachments) {
        const fileUrl = attachment.url;
        const fileName = path.basename(fileUrl);
        const filePath = path.join(__dirname, `cache/${fileName}`);

        try {
          const response = await axios.get(fileUrl, { responseType: "arraybuffer" });
          await fs.writeFile(filePath, Buffer.from(response.data, "binary"));

          for (const threadID of allThreads) {
            if (threadID != event.threadID) {
              try {
                await api.sendMessage(
                  { body: sendText(replyMsg.body || args.join(" ")), attachment: fs.createReadStream(filePath) },
                  threadID
                );
                successCount++;
              } catch (error) {
                failedCount++;
                console.error(`Failed to send to ${threadID}:`, error);
              }
              await new Promise((resolve) => setTimeout(resolve, 1000));
            }
          }

          await fs.unlink(filePath);
        } catch (error) {
          console.error("File download/send error:", error);
          api.sendMessage("❌ ফাইল পাঠানোতে সমস্যা হয়েছে!", event.threadID);
        }
      }
    } else if (args.length > 0) {
      const noticeText = args.join(" ");
      for (const threadID of allThreads) {
        if (threadID != event.threadID) {
          try {
            await api.sendMessage(sendText(noticeText), threadID);
            successCount++;
          } catch (error) {
            failedCount++;
            console.error(`Failed to send to ${threadID}:`, error);
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
    } else {
      return api.sendMessage(
        "ℹ️ ব্যবহার:\n• `/announcement <টেক্সট>`\n• বা কোনো মেসেজ রিপ্লাই দিয়ে `/announcement` লিখুন",
        event.threadID
      );
    }

    api.sendMessage(`✅ ${successCount} টি গ্রুপে Announcement পাঠানো হয়েছে!\n❌ ${failedCount} টি গ্রুপে পাঠানো যায়নি।`, event.threadID);
  } catch (error) {
    console.error("Global error:", error);
    api.sendMessage("❌ Announcement পাঠাতে সমস্যা হয়েছে!", event.threadID);
  }
};
