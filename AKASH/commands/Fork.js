module.exports.config = {
    name: "fork",
    version: "1.0.7",
    hasPermssion: 0,
    credits: "Mohammad Akash",
    description: "Send repository link when 'fork' is mentioned in text",
    commandCategory: "info",
    usages: "fork",
    cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
    const text = (event.body || "").toLowerCase();

    // শব্দের মধ্যে 'fork' আছে কি চেক করা হচ্ছে
    if (/\bfork\b/.test(text)) {
        const message = `
📌 *CHAT-BOT-AKASH V1*

*Repository Link:*  
https://github.com/srovi2007akash-stack/CHAT-BOT-AKASH-V1.git

কোনো সমস্যা বা প্রশ্ন থাকলে যোগাযোগ করুন:  
Messenger: https://m.me/arakashiam

─────────────────
Thank you for supporting the Bot!
─────────────────
`;
        return api.sendMessage(message, event.threadID, event.messageID);
    }
};
