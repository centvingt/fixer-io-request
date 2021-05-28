const http = require('http')

module.exports = {
  getDataFromApi: (req, res, next) => {
    http
      .get('http://jsonplaceholder.typicode.com/users', (resp) => {
        let data = ''
        console.log('resp.statusCode', resp.statusCode)

        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk
        })

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          // console.log(JSON.parse(data))
          req.data = JSON.parse(data)
          next()
        })
      })
      .on('error', (err) => {
        console.log('Error: ' + err.message)
        req.data = { success: false }
      })
  },
  checkClientAuthorization: (req, res, next) => {
    const { authorizedKeys } = global
    const { key } = req.body
    if (!authorizedKeys.includes(key)) {
      return res.status(401).json({ success: false })
    }
    next()
  },
}
