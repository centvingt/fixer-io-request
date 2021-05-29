const http = require('http')
const { getDate } = require('./helpers')

let apiData = null

module.exports = {
  checkClientAuthorization: (req, res, next) => {
    const { authorizedKeys } = global
    const { key } = req.body
    if (!authorizedKeys.includes(key)) {
      return res.status(401).json({ success: false })
    }
    next()
  },
  getData: (req, res, next) => {
    // let options = {
    //     timeZone: 'Europe/London',
    //     year: 'numeric',
    //     month: 'numeric',
    //     day: 'numeric',
    //     hour: 'numeric',
    //   },
    //   formatter = new Intl.DateTimeFormat([], options)

    // console.log(formatter.format(new Date()))
    // console.log(formatter.formatToParts(new Date()))

    // const parts = formatter.formatToParts(new Date())
    // const londonDate = `${parts[4].value}-${parts[2].value}-${parts[0].value}`

    // const currentDate = getDate(new Date(londonDate))

    const currentDate = getDate(new Date())

    const timestamp = apiData?.timestamp || null
    let apiDataDate = getDate(new Date(timestamp * 1000))

    console.log('currentDate', currentDate)
    console.log('apiDataDate', apiDataDate)
    res.currentDate = currentDate
    res.apiDataDate = apiDataDate

    if (currentDate > apiDataDate) {
      return module.exports.getDataFromApi(req, res, next)
    }

    res.data = apiData

    next()
  },
  getDataFromApi: (req, res, next) => {
    http
      .get(
        `http://data.fixer.io/api/latest?access_key=${global.fixerKey}&symbols=USD`,
        (resp) => {
          let data = ''

          // A chunk of data has been received.
          resp.on('data', (chunk) => {
            data += chunk
          })

          // The whole response has been received. Print out the result.
          resp.on('end', () => {
            apiData = JSON.parse(data)
            res.data = apiData
            next()
          })
        }
      )
      .on('error', (err) => {
        console.log('Error: ' + err.message)
        res.data = { success: false }
      })
  },
}
