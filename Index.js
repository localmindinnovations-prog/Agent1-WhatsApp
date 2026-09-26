const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys")
const OpenAI = require("openai")

const groq = new OpenAI({
  apiKey: process.env.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,
  baseURL: "https://api.groq.com/openai/v1"
})

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.macOS("Desktop"),
    printQRInTerminal: true
  })
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", async (u) => {
    console.log(u)
    if(u.connection === "open") console.log("✅ WHATSAPP LINKED - BOT IS LIVE 24/7")
  })
  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0]
      if(!msg.message || msg.key.fromMe) return
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
      if(!text) return
      console.log("User:", text)
      const ai = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are a helpful WhatsApp AI assistant. Be friendly, helpful, answer in Shona/English mix if user speaks Shona." },
          { role: "user", content: text }
        ]
      })
      await sock.sendMessage(msg.key.remoteJid, { text: ai.choices[0].message.content })
    } catch(e){ console.log(e) }
  })
}
startBot()
