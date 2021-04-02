const express = require('express')
const fetch = require("node-fetch")
const app = express()
const port = 3000
const API_KEY = '6d00d1d4e704068d70191bad2673e0cc';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
}
app.use(allowCrossDomain);

const promise = require('bluebird');

const initOptions = {
    promiseLib: promise
};

let pgp = require("pg-promise")(initOptions);
let db = pgp("postgres://postgres:password@localhost:5432/Weather");

const getWeatherByCityName = (cityName) => {
    return `${API_URL}?q=${cityName}&units=metric&appid=${API_KEY}`;
}

const getWeatherByCoordinates = (lat, lon) => {
    return `${API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
}

app.get('/weather/city', (request, response) => {
    const city = request.query['q'];
    fetch(getWeatherByCityName(encodeURIComponent(city)))
        .then(response => response.json())
        .then(data => {
            response.send(data);
        })
})

app.get('/weather/coordinates', (request, response) => {
    const lat = request.query['lat'];
    const lon = request.query['lon'];
    fetch(getWeatherByCoordinates(lat, lon))
        .then(response => response.json())
        .then(data => {
            response.send(data);
        })
})

app.get('/features', async (request, response) => {
    let cities = await db.any('SELECT city FROM cities');
    response.send(Array.prototype.map.call(cities, el => el['city']));
})

app.post('/features', async (request, response) => {
    let city = request.query['city'];
    let cities = await db.any('SELECT city FROM cities WHERE city=$1', [city]);
    if (cities.length === 0){
        await db.none('INSERT INTO cities(city) VALUES($1)', [city]);
        response.status(200).send(city);
    }
    else {
        response.status(500).send("You have already added this city")
    }
})

app.delete('/features', async (request, response) => {
    let city = request.query['city'];
    if (city) {
        await db.none('DELETE FROM cities WHERE id IN (' +
            'SELECT id FROM cities WHERE city=$1 LIMIT 1)', [city]);
        response.send(city);
    }
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})