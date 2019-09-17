'use strict'

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

require('dotenv').config();

app.get('/location', (request, response) => {
  try{
    let searchQuery = request.query.data;
    const geoDataResults = require('./data/geo.json');
  

    const location = new Location(searchQuery, geoDataResults);
    response.status(200).send(location);

  }
  catch(err){
    response.status(500).send("Sorry, something went wrong")
    console.error(err);
  }
});

app.get('/weather', (request, response) => {
  try {
    // const searchQuery = request.query.data;
    const darkSkyDataResults = require('./data/darksky.json');
    const weathers = darkSkyDataResults.daily.data.map(el => {
      const forecast = el.summary;
      const date = new Date(el.time);
      
      let weekday;
      let month;

      // Get weekday
      switch (date.getDay()) {
      case 0:
        weekday = 'Sun';
        break;
      case 1:
        weekday = 'Mon';
        break;
      case 2:
        weekday = 'Tue';
        break;
      case 3:
        weekday = 'Wed';
        break;
      case 4:
        weekday = 'Thu';
        break;
      case 5:
        weekday = 'Fri';
        break;
      case 6:
        weekday = 'Sat';
        break;
      default:
        break;
      }
      // Get month
      switch (date.getMonth()) {
      case 0:
        month = 'Jan';
        break;
      case 1:
        month = 'Feb';
        break;
      case 2:
        month = 'Mar';
        break;
      case 3:
        month = 'Apr';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'Jun';
        break;
      case 6:
        month = 'Jul';
        break;
      case 7:
        month = 'Aug';
        break;
      case 8:
        month = 'Sep';
        break;
      case 9:
        month = 'Oct';
        break;
      case 10:
        month = 'Nov';
        break;
      case 11:
        month = 'Dec';
        break;
      }

      const time = `${weekday} ${month} ${date.getDate()}, ${date.getFullYear()}`;

      return {
        forecast: forecast,
        time: time
      };
    });

    response.status(200).send(weathers);
  } catch (err) {
    console.error(err);
  }
});

function Location(searchQuery, geoDataResults){
  this.searchQuery = searchQuery;
  this.formatted_query = geoDataResults.results[0].formatted_address;
  this.latitude = geoDataResults.results[0].geometry.location.lat;
  this.longitude = geoDataResults.results[0].geometry.location.lng;
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}

app.use('*', (request, response) => {
  response.status(404).send('huh?');
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on ${PORT}`));
