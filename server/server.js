let express = require('express')
let path = require('path')
let mongoose = require('mongoose')
let request = require('request')
let math = require('mathjs')
let bodyParser = require('body-parser')

let app = express()
app.use(bodyParser.json())

const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const HARVARD_KEY = process.env.HARVARD_KEY || require('./apikeys.js').HARVARD_KEY

// API calls
app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' })
})

app.get('/api/getRandomPainting', (req, res) => {
  getRandomPainting(req, res)
})

app.post('/api/sendRating', (req, res) => {
  sendRating(req, res)
})

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, './../client/build')))
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './../client/build', 'index.html'))
  })
}

app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`))

//Close connection on exit
process.on('SIGINT', () => {
  mongoose.connection.close( () => {
    console.log('Mongoose disconnected on app termination')
    process.exit(0)
  })
})

const getRandomPainting = (req, res) => {
  var paintingNumParams = {
    apikey: HARVARD_KEY,
    classification: "Paintings",
    size: 0,
    height: '<500'
  }

  //Get number of paintings
  request({url: 'https://api.harvardartmuseums.org/object', qs: paintingNumParams}, (err, response, body) => {

    body = JSON.parse(body)
    var paintNum = body.info.totalrecords

    var randomPaintParams = {
      apikey: HARVARD_KEY,
      classification: "Paintings",
      fields: "id,title,dated,primaryimageurl",
      page: math.randomInt(0, paintNum),
      size: 1,
      height: '<500'
    }
  
    request({url: 'https://api.harvardartmuseums.org/object', qs: randomPaintParams}, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log(body)
      }

      body = JSON.parse(body)
      var randomPainting = body.records[0];
      
      if(!randomPainting.primaryimageurl || !randomPainting.id) {
        getRandomPainting(req, res);
      }
      else {
        randomPainting = JSON.stringify(randomPainting)
        res.send(randomPainting)
      }

    })
  })

}

const sendRating = (req, res) => {
  var rating = req.body.rating
  var id = req.body.id
  var artName = req.body.artName

  console.log(`Adding rating to db: ${rating} stars for ${artName} ID: ${id}`)
  

  res.send('{"Worked": true}')
}