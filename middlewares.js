const http = require('http')
const { getDate } = require('./helpers')
const APIData = require('./apiData')

module.exports = {
  checkClientAuthorization: (req, res, next) => {
    const { authorizedKeys } = global
    // const { key } = req.body
    const key = req.body.key ? req.body.key : req.query.key
    if (!authorizedKeys.includes(key)) {
      return res.status(401).json({ success: false })
    }
    next()
  },
  getData: async (req, res, next) => {
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

    try {
      const currentDate = getDate(new Date())

      const apiData = await APIData.findOne()

      const timestamp = apiData ? apiData.timestamp : null
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
    } catch (error) {
      return res.status(500).json({ success: false })
    }
  },
  getDataFromApi: (req, res, next) => {
    http
      .get(
        `http://data.fixer.io/api/latest?access_key=${global.fixerKey}&symbols=USD`,
        (resp) => {
          if (resp.statusCode !== 200) {
            return res
              .status(500)
              .json({ success: false, statusCode: resp.statusCode })
          }
          let data = ''

          // A chunk of data has been received.
          resp.on('data', (chunk) => {
            data += chunk
          })

          // The whole response has been received. Print out the result.
          resp.on('end', async () => {
            try {
              const removedData = await APIData.findOneAndRemove()

              const apiData = new APIData(JSON.parse(data))
              const savedApiData = await apiData.save()

              res.data = savedApiData
              next()
            } catch (error) {
              return res.status(500).json({ success: false })
            }
          })
        }
      )
      .on('error', (err) => {
        console.log('Error: ' + err.message)
        res.data = { success: false }
      })
  },
}
