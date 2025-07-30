const fs = require("fs");
const { spawn } = require("child_process");
const ws3 = require("ws3-fca");
const login = typeof ws3 === "function" ? ws3 : (ws3.default || ws3.login || ws3);
const appstatePath = "./appstate.json";

const ADMIN_UID = "61578924387878";
const PREFIX = "/startgali";
let isInsulting = false;

// 🛡️ A-Z Protection Layer
const protection = {
  headers: {
    'user-agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Mobile Safari/537.36',
    'x-fb-connection-type': 'WIFI',
    'x-fb-sim-hni': '40400',
    'x-fb-net-hni': '40410',
    'x-fb-connection-quality': 'EXCELLENT',
    'x-fb-http-engine': 'Liger'
  }
};

// ✅ Check appstate
if (!fs.existsSync(appstatePath)) {
  console.error("❌ appstate.json file missing. Exiting...");
  process.exit(1);
}

const appstate = require(appstatePath);

login({ appState: appstate, selfListen: false, autoMarkRead: true, forceLogin: true, userAgent: protection.headers['user-agent'] }, async (err, api) => {
  if (err) return console.error("❌ Login Failed:", err);

  console.log("✅ Bot chal raha hai, gali dene ko ready...");

  const filePath = "./comment.txt";
  const threadFile = "./thread.txt";
  let lastContent = "";

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  async function checkAndGali() {
    if (!isInsulting) return; // 🔐 Only when started

    if (!fs.existsSync(filePath) || !fs.existsSync(threadFile)) return;

    const content = fs.readFileSync(filePath, "utf-8").trim();
    const threads = fs.readFileSync(threadFile, "utf-8").split("\n").map(t => t.trim()).filter(t => t);

    if (content && content !== lastContent) {
      const regex = /(.*)\s*\((.*?)\)/;
      const match = content.match(regex);

      if (match) {
        const name = match[1].trim();
        const uid = match[2].trim();

        const message = {
          body: `Abey ${name}, dimag thikane laga le chomu! 🤡`,
          mentions: [{ tag: name, id: uid }]
        };

        console.log(`⌛ 35 second ruk raha hu fir gali dunga -> ${name}`);
        await delay(35000);

        threads.forEach(threadID => {
          api.sendMessage(message, threadID, (err) => {
            if (err) console.error("❌ Gali nahi gayi:", err);
            else console.log(`✅ Gali de di -> ${name} in ${threadID}`);
          });
        });

        lastContent = content;
      }
    }
  }

  setInterval(checkAndGali, 10000); // Every 10 seconds

  // 🧠 Listen for commands
  api.listenMqtt((err, event) => {
    if (err || !event || event.type !== "message" || !event.body) return;

    const sender = event.senderID;
    const body = event.body.trim();

    if (body.toLowerCase() === PREFIX) {
      if (sender === ADMIN_UID) {
        if (!isInsulting) {
          isInsulting = true;
          api.sendMessage("🟢 Gali mode active ho gaya bhadwe!", event.threadID);
        } else {
          api.sendMessage("😈 Gali already chal rahi hai!", event.threadID);
        }
      } else {
        api.sendMessage("MAA KI CHUT TERI 💥 SIRF MERE MALIK KA BOT HU JISKA NAAM HAI RUDRA THAKUR UID 61578924387878", event.threadID);
      }
    }
  });
});

// 🔁 Anti-sleep Child Process Loop
setInterval(() => {
  spawn("node", ["-e", `console.log('💤 Alive at ' + new Date().toLocaleTimeString())`]);
}, 1000 * 60 * 9); // every 9 minutes
