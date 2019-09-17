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


function Location(searchQuery, geoDataResults){
  this.searchQuery = searchQuery;
  this.formatted_query = geoDataResults.results[0].formatted_address;
  this.latitude = geoDataResults.results[0].geometry.location.lat;
  this.longitude = geoDataResults.results[0].geometry.location.lng;
}


app.use('*', (request, response) => {
  response.status(404).send('huh?');
})



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`listening on ${PORT}`));