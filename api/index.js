require('dotenv').config()
const express = require("express")
const app = express()
const usersRoute = require('./routes/customers')
const pricesRoute = require('./routes/prices')
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/customers', usersRoute)
app.use('/prices', pricesRoute)

app.listen(PORT, () => {
  console.log("API running on http://localhost:3000")
})
