const express = require('express')
const router = express.Router()
/** @type {import("@prisma/client").PrismaClient} */
const prisma = require("../../common/prisma")

router.post("/", async (req, res) => {
  const result = await prisma.customer.create({
    data: req.body
  })

  res.json(result)
})

.get("/", async (req, res) => {
  const result = await prisma.customer.findMany()

  res.json(result)
})

.get("/:id", async (req, res) => {
  const result = await prisma.customer.findFirst({
    where: {
      id: Number(req.params.id)
    }
  })
  if(!result) return res.status(404).send()

  res.json(result)
})

.put("/:id", async (req, res) => {
  const result = await prisma.customer.update({
    data: req.body,
    where: {
      id: Number(req.params.id)
    }
  })

  res.json(result)
})

.delete("/:id", async (req, res) => {
  const result = await prisma.customer.delete({
    where: {
      id: Number(req.params.id)
    }
  })
  
  res.json(result)
})

module.exports = router