if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const { PORT, AUTHORIZED_KEYS, FIXER_KEY } = process.env

const port = PORT || 3000

global.authorizedKeys = AUTHORIZED_KEYS.split(' ')
global.fixerKey = FIXER_KEY

const express = require('express')
const helmet = require('helmet')

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
  res.data = {
    ...res.data,
    currentDate: res.currentDate,
    apiDataDate: res.apiDataDate,
  }
  res.status(200).json(res.data)
})
app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
  })
})
app.listen(port, () => {
  console.log(`App started on port ${port}`)
})
