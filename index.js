const fs = require("fs");
const ws3 = require("ws3-fca");
const login = typeof ws3 === "function" ? ws3 : (ws3.default || ws3.login || ws3);
const appstate = require("./appstate.json");

login({ appState: appstate }, (err, api) => {
  if (err) return console.error("❌ Login Failed:", err);

  console.log("✅ Bot chal raha hai, gali dene ko ready...");

  const filePath = "./comment.txt";
  let lastContent = "";

  // Delay utility
  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  async function checkAndGali() {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, "utf-8").trim();

    if (content && content !== lastContent) {
      const regex = /(.*)\s*\((.*?)\)/; // Format: Name (UID)
      const match = content.match(regex);

      if (match) {
        const name = match[1].trim();
        const uid = match[2].trim();

        const message = {
          body: `Abey ${name}, dimag thikane laga le chomu! 🤡`,
          mentions: [{ tag: name, id: uid }]
        };

        const threadID = "YOUR_THREAD_ID_HERE"; // <-- Replace this

        // Wait 35 sec before sending
        console.log(`⌛ 35 second ruk raha hu fir gali dunga -> ${name}`);
        await delay(35000);

        api.sendMessage(message, threadID, (err) => {
          if (err) console.error("❌ Gali nahi gayi:", err);
          else console.log(`✅ Gali de di -> ${name}`);
        });

        lastContent = content;
      }
    }
  }

  // Run every 10 sec to check for file update
  setInterval(checkAndGali, 10000);

  // 💤 Anti-sleep childish ping system (runs every 4.5 minutes)
  setInterval(() => {
    const jokes = [
      "😴 Abhi nahi so raha hu...",
      "👀 Zinda hu bhai, chill kar!",
      "💤 Sleep mode hata diya gaya.",
      "😎 Bot active hai jaise Anurag ka gussa!",
      "😂 Server ko ullu bana raha hu abhi."
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    console.log(`[ANTI-SLEEP] ${joke}`);
  }, 270000); // 4.5 minutes (in ms)
});
