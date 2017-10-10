const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const request = require('request')
const morgan = require('morgan')
const morganDev = morgan('dev')
const ejs = require('ejs')

const app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', path.resolve(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.resolve(__dirname, 'public')))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(morganDev)

app.get('/', function (req, res, next) {
  res.render('index', {
    weather: null,
    error: null
  })
})

app.post('/', function (req, res, next) {
  let city = (req.body.city)
  let state = (req.body.state)
  let key = 'df94bd210c393ab8'
  let url = 'http://api.wunderground.com/api/' + key + '/conditions/q/' + state + '/' + city + '.json'

  request(url, function (err, response, body) {
    if (err) {
      res.render('index', {weather: null, error: 'Woops, something went wrong. Please, try again. '})
    } else {
      const weather = JSON.parse(body)
      if (weather === undefined || req.body.state === '---') {
        res.render('index', {weather: null, error: ' Woops, you must fill out both forms. Please, try again. '})
      } else {
        let iconVar = (weather.current_observation.icon)
        let weatherVar = (weather.current_observation.weather)
        let tempVar = (weather.current_observation.temperature_string)
        let placeVar = (weather.current_observation.display_location.full)

        res.render('index', {
          weather: weatherVar,
          temp: tempVar,
          place: placeVar,
          icon: `https://icons.wxug.com/i/c/h/${iconVar}.gif`,
          error: null
        })
      }
    }
  })
})

app.use(function (req, res, next) {
  res.status(404).send('Something went wrong. go back and try again maybe?')
})

app.use(function (err, req, res, next) {
  res.status(422).send({Error: err.message})
  console.log(err.message)
})

const server = app.listen(app.get('port'), function () {
  console.log('youre now listening to port:' + app.get('port'))
})
