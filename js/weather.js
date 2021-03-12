const API_KEY = 'b0555787759c4e8382148ae636958af2';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

function getWeatherByCityName(cityName) {
    const url = `${API_URL}?q=${cityName}&units=metric&appid=${API_KEY}`;
    return doRequest(url);
}

function getWeatherByCoordinates(lat, lon) {
    const url = `${API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    return doRequest(url);
}

function getWeatherIcon(iconName) {
    return `https://openweathermap.org/img/wn/${iconName}.png`
}

function doRequest(url) {
    return fetch(url).then(response => {
        return response.json();
    }).catch(e => {
        console.warn(`There has been a problem with your fetch operation for resource "${url}": ` + e.message)
    });
}