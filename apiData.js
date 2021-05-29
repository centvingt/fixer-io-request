const mongoose = require('mongoose')
const Schema = mongoose.Schema

const apiDataSchema = new Schema({
  success: Boolean,
  timestamp: Number,
  base: String,
  date: String,
  rates: {
    USD: Number,
  },
})

const APIData = mongoose.model('APIData', apiDataSchema)
module.exports = APIData
