require('dotenv').config()
const express = require('express')
const router = express.Router()
const Redis = require("ioredis")
const redis = new Redis()

/** @type {import("@prisma/client").PrismaClient} */
const prisma = require("../../common/prisma")

router.get("/latest", async (req, res) => {
  const prices = await redis.hgetall(process.env.REDIS_LATEST_PRICES_KEYS)
  const result = {}

  for (const s in prices) {
    result[s] = JSON.parse(prices[s])
  }

  res.json(result)
})

.get("/history", async (req, res) => {
  const { symbol, limit = 100 } = req.query

  if (!symbol) {
    return res.status(400).json({ error: "sembol parametresi gerekli." })
  }

  const result = await prisma.priceHistory.findMany({
    where: { symbol },
    orderBy: { timestamp: "desc" },
    take: Number(limit)
  })

  res.json(
    result.map(row => ({
      ...row,
      timestamp: Number(row.timestamp)
    }))
  );
})


module.exports = router