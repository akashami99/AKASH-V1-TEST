module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "BY-MOHAMMAD AKASH",
    description: "Notify when someone leaves or is kicked from the group with random gif/photo/video",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const cachePath = join(__dirname, "cache", "leaveGif", "randomgif");
    if (!existsSync(cachePath)) mkdirSync(cachePath, { recursive: true });
};

module.exports.run = async function({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
    const { createReadStream, readdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const { threadID } = event;

    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");

    const data = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const userID = event.logMessageData.leftParticipantFbId;
    const name = global.data.userName.get(userID) || await Users.getNameUser(userID);
    const type = (event.author == userID) ? "leave" : "managed";
    const authorName = await Users.getNameUser(event.author);

    // মেসেজ আলাদা করা Leave/Kick অনুযায়ী
    let msg;
    if (type === "leave") {
        msg = `╭═════⊹⊱✫⊰⊹═════╮
             ⚠️ ঘটনা! ⚠️
╰═════⊹⊱✫⊰⊹═════╯

আজ {name} নিখোঁজ! 😢
— গ্রুপে নেই, কিন্তু হৃদয়ে থাকবেন। ❤️

⏰ {time}
✍️ ফিলিংস শেয়ার করুন: এই বিচ্ছেদে কেমন লাগছে? 💭`;
    } else {
        msg = `╭═════⊹⊱✫⊰⊹═════╮
             ⚠️ বাটলে হার! ⚠️
╰═════⊹⊱✫⊰⊹═════╯

আজ {name} কে গ্রুপ থেকে কিক করা হয়েছে! 😂
— আর ফিরে আসার আশা নেই, RIP 😎

Kicked By : {author}

⏰ {time}
✍️ ফিলিংস শেয়ার করুন: এই কিক দেখে কেমন লাগলো? 💭`;
    }

    // নাম ও টাইম বসানো
    msg = msg.replace(/\{name}/g, name)
             .replace(/\{time}/g, time)
             .replace(/\{author}/g, authorName);

    // Leave/Kick gif/photo directory
    const randomPathDir = join(__dirname, "cache", "leaveGif", "randomgif");
    const randomFiles = readdirSync(randomPathDir);

    // ট্যাগ তৈরি
    let mentions = [{ tag: name, id: userID }];
    if (type === "managed") mentions.push({ tag: authorName, id: event.author });

    // মেসেজ ফর্ম
    let formPush;
    if (randomFiles.length != 0) {
        const pathRandom = join(randomPathDir, `${randomFiles[Math.floor(Math.random() * randomFiles.length)]}`);
        formPush = { body: msg, attachment: createReadStream(pathRandom), mentions };
    } else {
        formPush = { body: msg, mentions };
    }

    return api.sendMessage(formPush, threadID);
};
