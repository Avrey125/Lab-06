
'use strict';
// started with demo code 

const express = require('express');
require('dotenv').config();
const pg = require('pg');


const cors = require('cors');


const superagent = require('superagent');


const app = express();

// index.html is going to be served from a public folder
app.use(express.static('public'));

// WORST policeman EVER - everyone can connect
app.use(cors());

// declaring our PORT is 3000 from the .env OR 3000
const PORT = process.env.PORT || 3001;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));
// // routes
// app.get('/', (request, response) => {
//   response.status(200).sendStatus('Number 5 is alive!');
// });
// app.get('/add', (request, response) => {
//   let firstName = request.query.first;
//   let lastName = request.query.last;
// })
//save into database
// let sql = 'INSERT INTO people (first_name, last_name) VALUES ($1, $2);';
// let value = [firstName, lastName];
// client.query(sql, value)
//   .then(pgResults => {
//     console.log('our pgResults', pgResults.rows);
//     response.status(200).json(pgResults)
//   })
//   .catch(error => console.log('sql;error', error))




// routes
app.get('/location', searchLatToLong);
app.get('/weather', getWeather);
app.get('/events', getEvents);


// function that gets run when someone visits /location
function searchLatToLong (request, response){

  // this is what the client enters in the search box when they search on the front end
  // this is the city
  let searchQuery = request.query.data;

  // the url is the API url
  let url = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;

  // asking superagent to make an API request to goole maps


  //makes api call
  superagent.get(url)
  .then(superagentResults => {
    // if we are successful, we store the correct data in the variables we need
    let results = superagentResults.body.results[0];

    const formatted_address = results.formatted_address;
    const lat = results.geometry.location.lat;
    const long = results.geometry.location.lng;

      
    let sql = 'INSERT INTO locations (search_query, formatted_address, latitude, longitude) VALUES ($1 , $2, $3, $4);';

    let value = [searchQuery, formatted_address, lat, long];
    client.query(sql, value)
    .then(pgResults => {
      console.log('our pgResults', pgResults);
      response.status(200).json(pgResults);
    })
    // create a new location object instance using the superagent results
    const location = new Location(searchQuery, formatted_address, lat, long);

    // send that data to the front end
    response.send(location);
  })
  // if we fail, we end up here
  .catch(error => handleError(error, response));
  }
  
function locationInfo(request, reponse) {
  // INSERT INTO locations (search_query, formatted_address, latitude, longitude) VALUES ($1 , $2, $3, $4);
  client.query()
}



// our error handler - sends the error to both the front and back end
function handleError(error, response){
  console.error(error);
  const errorObj = {
    status: 500,
    text: 'somthing went wrong'
  }
  response.status(500).send(errorObj);
}

// function gets called when the /weather route gets hit
function getWeather(request, response){
  // this gets the location object from the request
  let locationDataObj = request.query.data;

  // get the lat and long
  let latitude = locationDataObj.latitude;
  let longitude = locationDataObj.longitude;

  // url for DARK SKYS api
  let URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

  // superagent make an API requst to DARK SKYS
  superagent.get(URL)
  .then(data => {
    // if successful, store data in the daily array
    let darkSkyDataArray = data.body.daily.data;
    const dailyArray = darkSkyDataArray.map(day => {
      return new Weather(day);
    })
    // send that array to the front end
    response.send(dailyArray);
  })
  .catch(error => console.log(error));

}

function getEvents(request, response){
  let locationObj = request.query.data;
  console.log(locationObj);
  const url = `https://www.eventbriteapi.com/v3/events/search?token=${process.env.EVENTBRITE_API_KEY}&location.address=${locationObj.formatted_address}`;

  superagent.get(url)
  .then(eventBriteData => {
    const eventBriteInfo = eventBriteData.body.events.map(eventData => {
      const event = new Event(eventData);
      return event;
    })
    response.send(eventBriteInfo);
  })
  .catch(error => handleError(error, response));
}

// contructor functions
function Event(eventBriteStuff){
  this.link = eventBriteStuff.url;
  this.name = eventBriteStuff.name.text;
  this.event_date = new Date(eventBriteStuff.start.local).toDateString();
  this.summary = eventBriteStuff.summary;
}

function Weather(darkSkyData){
  this.time = new Date(darkSkyData.time*1000).toDateString();
  this.forecast = darkSkyData.summary;
}

function Location(searchQuery, address, lat, long){
  this.searchQuery = searchQuery;
  this.formatted_address = address;
  this.latitude = lat;
  this.longitude = long;
}

// turns on the server


app.listen(PORT, () => console.log(`listening on ${PORT}`));