require('dotenv').config()
const WebSocket = require("ws")


function clearConsole() {
  process.stdout.write("\x1Bc")
}

function renderPrices(prices) {
  console.log("BIST30 Fiyatlar\n")

  for (const symbol in prices) {
    const { price, timestamp } = prices[symbol]
    const time = new Date(timestamp).toLocaleTimeString()

    console.log(`${symbol.padEnd(6)} | ${price.toFixed(2)} | ${time}`)
  }
}

function startClient() {
  const ws = new WebSocket(process.env.WS_URL)

  ws.on("open", () => {
    console.log("Soket bağlandı.")
  })

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString())

    if (message.type === "PRICE_UPDATE") {
      clearConsole()
      renderPrices(message.data)
    }
  })

  ws.on("close", () => {
    console.log("Soket bağlantısı koptu.")
  })

  ws.on("error", (err) => {
    console.error("Soket hatası:", err.message)
  })
}

startClient()
