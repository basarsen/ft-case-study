require('dotenv').config()
const WebSocket = require("ws")
const Redis = require("ioredis")

const { createChannel } = require("../common/amqp")

/** @type {import("@prisma/client").PrismaClient} */
const prisma = require("../common/prisma")

const redis = new Redis()

const historyBuffer = new Map()

async function startSocketServer() {
  const { channel } = await createChannel()
  await channel.assertQueue(process.env.PRICE_QUEUE, { durable: false })

  console.log("Soket RabbitMQ'yu dinliyor.")

  const wss = new WebSocket.Server({ port: 8080 })
  console.log("WebSocket 8080 portunda başlatıldı.")

  wss.on("connection", (ws) => {
    console.log("Client bağlandı")

    ws.on("close", () => {
      console.log("Client bağlantısı koptu")
    })
  })

  channel.consume(process.env.PRICE_QUEUE, async (msg) => {
  if (!msg) return

  const { symbol, price, timestamp } = JSON.parse(
    msg.content.toString()
  )

  await redis.hset(
    process.env.REDIS_LATEST_PRICES_KEYS,
    symbol,
    JSON.stringify({ price, timestamp })
  )

  historyBuffer.set(symbol, {
    symbol,
    price,
    timestamp: BigInt(timestamp)
  })

  channel.ack(msg)
})

  setInterval(async () => {
    const prices = await redis.hgetall(process.env.REDIS_LATEST_PRICES_KEYS)

    if (Object.keys(prices).length === 0) return

    const payload = {}

    for (const symbol in prices) {
      payload[symbol] = JSON.parse(prices[symbol])
    }

    const message = JSON.stringify({
      type: "PRICE_UPDATE",
      data: payload
    })

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }, 500)
}

setInterval(async () => {
  if (historyBuffer.size === 0) return

  const batch = Array.from(historyBuffer.values())

  historyBuffer.clear()

  try {
    await prisma.priceHistory.createMany({
      data: batch
    })

    console.log(`${batch.length} kayıt eklendi.`)
  } catch (err) {
    console.error("Hata", err)
  }
}, 2000)


startSocketServer().catch(console.error)
