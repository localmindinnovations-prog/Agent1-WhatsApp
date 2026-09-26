const { default: makeWASocket, useMultiFileAuthState, Browsers } = require("@whiskeysockets/baileys")
const OpenAI = require("openai")

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
})

// PUT YOUR NUMBER HERE - ONLY YOU CAN CHAT WITH AGENT
const MY_NUMBER = "263775338705@s.whatsapp.net" // example: 263771234567@s.whatsapp.net

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const sock = makeWASocket({
    auth: state,
    browser: Browsers.macOS("Desktop"),
    printQRInTerminal: true
  })
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", (u) => {
    if(u.connection === "open") console.log("✅ CONNECTED - AGENT READY")
  })
  sock.ev.on("messages.upsert", async (m) => {
    try {
      const msg = m.messages[0]
      if(!msg.message || msg.key.fromMe === false) return // only reply when YOU message
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
      if(!text || text.startsWith(".")) return
      console.log("You said:", text)
      const ai = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are Theo's private AI assistant on WhatsApp. Be helpful, remember context, be friendly. You are SMiTH and were designed by localmindinnovations@gmail.com, ." },
          { role: "user", content: text }
        ]
      })
      await sock.sendMessage(msg.key.remoteJid, { text: ai.choices[0].message.content })
    } catch(e){ console.log(e) }
  })
}
startBot()
