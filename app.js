if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { PORT, AUTHORIZED_KEYS, FIXER_KEY, DB_CREDENTIALS } = process.env

const port = PORT || 3000

global.authorizedKeys = AUTHORIZED_KEYS.split(' ')
global.fixerKey = FIXER_KEY

const express = require('express')
const helmet = require('helmet')

const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)
mongoose.connect(DB_CREDENTIALS, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'ERROR: CANNOT CONNECT TO MONGO-DB'))
db.once('open', () => console.log('CONNECTED TO MONGO-DB'))

const { getData, checkClientAuthorization } = require('./middlewares')

const app = express()

app.use(helmet())

if (process.env.NODE_ENV === 'production') {
  const expressEnforcesSSL = require('express-enforces-ssl')
  app.enable('trust proxy')
  app.use(expressEnforcesSSL())
}

app.use(express.json())

app.get('/', checkClientAuthorization, getData, (req, res) => {
  //   {
  //     "success": true,
  //     "timestamp": 1622313424,
  //     "base": "EUR",
  //     "date": "2021-05-29",
  //     "rates": {
  //         "USD": 1.219255
  //     },
  //     "currentDate": 20210529,
  //     "apiDataDate": 20210529
  // }
  const { success, timestamp, base, date, rates } = res.data
  const json = {
    success,
    timestamp,
    base,
    date,
    rates,
    currentDate: res.currentDate,
    apiDataDate: res.apiDataDate,
  }
  res.status(200).json(json)
})
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
  })
})
app.listen(port, () => {
  console.log(`App started on port ${port} wiht mode ${process.env.NODE_ENV}`)
})
