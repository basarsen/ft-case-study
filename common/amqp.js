require('dotenv').config()
const amqp = require("amqplib")

async function createChannel() {
  const connection = await amqp.connect(process.env.AMQP_URL)
  const channel = await connection.createChannel()
  return { connection, channel }
}

module.exports = { createChannel }
