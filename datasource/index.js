require('dotenv').config()
const { createChannel } = require("../common/amqp")
const symbols = require("../common/symbols")

function randomPrice(base = 100) {
  const change = (Math.random() - 0.5) * 2
  return +(base + change).toFixed(2)
}

function randomDelay() {
  return Math.floor(Math.random() * 400) + 100
}

async function startProducer() {
  const { channel } = await createChannel()
  await channel.assertQueue(process.env.PRICE_QUEUE, { durable: false })

  console.log("Datasource başlatıldı.")

  function publish() {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]

    const message = {
      symbol,
      price: randomPrice(),
      timestamp: Date.now()
    }

    channel.sendToQueue(
      process.env.PRICE_QUEUE,
      Buffer.from(JSON.stringify(message))
    )

    console.log("Gönderildi:", message)

    setTimeout(publish, randomDelay())
  }

  publish()
}

startProducer().catch(console.error)
