
'use strict';

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const superagent = require ('superagent');

const app = express();

app.use(express.static('public'));

app.use(cors());

const PORT = process.env.PORT || 3001;



// routes
app.get('/location', searchLatToLong);
app.get('/weather', getWeather);
app.get('/events', getEvents);


// function that gets run when someone visits /location
function searchLatToLong(request, response) {

  //this is what client enters into search box when searching on the front end
  //this is the city
  let searchQuery = request.query.data;


  // used Kyungrae's key
  // the url is the API url
  let URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}` 

  // asking superagent to make an api request to google maps
  superagent.get(URL)
    .then(superagentResult => {
      //if succesfull, we store the correct data in the variables we need 
      let results = superagentResult.body.results[0];
      const formatted_address = results.formatted_address;
      const lat = results.geometry.location.lat;
      const long = results.geometry.location.lng;


     // creating a new location object instance using superagent results
      const location = new Location(searchQuery, formatted_address, lat, long);

      //send that data to the front end
      response.status(200).send(location);

    })
    //if we fail we end up here
    .catch(error => handleError(error, response)
    )
  }

// function gets called when the /weather route gets hit 
function getWeather(request, response) {
    //this gets the location object from the request 
    let locationDataObj = request.query.data;

    //get the lat and long
    let latitude = locationDataObj.latitude;
    let longitude = locationDataObj.longitude;
    

    let URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`
    
    
    superagent.get(URL)
    .then(data =>{
      let darkskyDataArr = data.body.daily.data;
      const dailyArr = darkskyDataArr.map(day=>{
        return new Weather(day);
      })
      response.send(dailyArr);
    })
    .catch(error => console.log(error));

  }



function getEvents(response, request){
  let locationObj = request.query.data;
  const url = `https://www.eventbriteapi.com/v3/events/search?location.longitude=${lng}&location.latitude=${lat}&expand=venue&token=${process.env.EVENT_API_KEY}&location.address=${locationObj.formatted_address}`

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


function Event(eventBriteStuff){
  this.link = eventBriteStuff.url;
  this.name = eventBriteStuff.name.text;
  this.event_date = new Date(eventBriteStuff.start.local).toDateString();
  this.summary = eventBriteStuff.summary;
}


function Location(searchQuery, address, lat, long){
  this.search_query = searchQuery;
  this.formatted_address = address;
  this.latitude = lat;
  this.longitude = long;
}

function Weather(darkSkyData){
  this.forecast = darkSkyData.summary;
  this.time = new Date(darkSkyData.time*1000).toDateString();
}

// our error handler
function handleError(error, response){
  console.error(error);
  const errorObj = {
    status: 500,
    text: 'Sorry, something went wrong'
  }
  response.status(500).send(errorObj);
}

app.listen(PORT, () => console.log(`listening on ${PORT}`));