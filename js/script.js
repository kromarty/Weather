const favoriteCityForm = document.forms['add-city'];
const refreshButton = document.getElementsByClassName('refresh-geolocation')[0];
const favoriteCitiesList = document.getElementsByClassName('city-list')[0];
const currentCity = document.getElementsByClassName('current-city')[0];
const myStorage = window.localStorage;


favoriteCityForm.addEventListener('submit', function (e) {
    const cityInput = document.getElementById('favorite-city-name');
    addFavoriteCityToUI(cityInput.value);
    cityInput.value = '';
    e.preventDefault();
});

favoriteCitiesList.addEventListener('click', function (event) {
    if (!event.target.className.includes('close-button')) {
        return;
    }

    const cityId = event.target.closest('li').id.split('_')[1];
    const cityName = event.target.closest('li').getElementsByClassName('city-name')[0].textContent;
    deleteFavoriteCityById(cityId);
    myStorage.removeItem(cityName);
});

refreshButton.addEventListener('click', function () {
    setLoaderOnCurrentCity();
    loadCoordinatesFromGeolocationAPI();
});

document.addEventListener('DOMContentLoaded', function () {
    setLoaderOnCurrentCity();
    loadCoordinatesFromGeolocationAPI();
    loadCitiesFromLocalStorage();
});

function loadCoordinatesFromGeolocationAPI() {
    navigator.geolocation.getCurrentPosition(function (position) {
        updateCurrentCityInformation({
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
        });
    }, function (e) {
        updateCurrentCityInformation({
            'latitude': 55.76,
            'longitude': 37.62
        });
        console.warn(`There has been a problem with access to geolocation: ` + e.message)
    });
}

async function updateCurrentCityInformation(coordinates) {
    let weatherData = await getWeatherByCoordinates(coordinates['latitude'], coordinates['longitude'])
    currentCity.removeChild(currentCity.getElementsByClassName('current-city-info')[0]);
    currentCity.innerHTML += renderCurrentCityBriefInformation(weatherData);
    unsetLoaderOnCurrentCity();
}

async function loadCitiesFromLocalStorage() {
    const copiedStorage = {};
    for (let key of Object.keys(myStorage)) {
        copiedStorage[key] = myStorage.getItem(key);
    }
    myStorage.clear();

    for (let key in copiedStorage) {
        await addFavoriteCityToUI(key);
    }
}

async function addFavoriteCityToUI(cityName) {
    var cityId = cityName;
    favoriteCitiesList.innerHTML += renderEmptyFavoriteCity(cityId);

    let weatherData = await getWeatherByCityName(cityName);

    if (weatherData['cod'] !== 200) {
        alert('City name is incorrect or information is missing.');
        deleteFavoriteCityById(cityId);
        return null;
    }

    if (myStorage.getItem(weatherData['name']) !== null) {
        alert('You already have this city in favorites');
        deleteFavoriteCityById(cityId);
        return null;
    }

    myStorage.setItem(weatherData['name'], cityId);
    const cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.innerHTML += renderFavoriteCityBriefInformation(weatherData);
    cityObject.innerHTML += renderFullWeatherInformation(weatherData);
    unsetLoaderOnFavoriteCity(cityId);
}

function deleteFavoriteCityById(cityId) {
    var cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.remove();
}

function renderCurrentCityBriefInformation(weatherData) {
    return `
        <div class="current-city-info">
            <h2 class="city-header">${weatherData['name']}</h2>
            <img src="${getWeatherIcon(weatherData['weather'][0]['icon'])}" class="weather-icon" alt="Иконка погоды">
            <ul class="full-weather-information">
                <li class="weather-info"><div class="key">Температура</div><div class="value">${Math.round(weatherData['main']['temp_min'])}&deg;C</div></li>
                <li class="weather-info"><div class="key">Ветер</div> <div class="value">${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']}</div></li>
                <li class="weather-info"><div class="key">Давление</div> <div class="value">${weatherData['main']['pressure']} hpa</div></li>
            </ul>
        </div> `
}

function renderFavoriteCityBriefInformation(weatherData) {
    return `
        <div class="city-header">
            <h3 class="city-name">${weatherData['name']}</h3>
            <button class="close-button">X</button>
        </div>`
}

function renderFullWeatherInformation(weatherData) {
    return `
        <ul class="full-weather-information">
            <li class="weather-info"><div class="key">Температура</div><div class="value">${Math.round(weatherData['main']['temp_min'])}&deg;C</div></li>
            <li class="weather-info"><div class="key">Ветер</div> <div class="value">${weatherData['wind']['speed']} m/s, ${weatherData['wind']['deg']}</div></li>
            <li class="weather-info"><div class="key">Давление</div> <div class="value">${weatherData['main']['pressure']} hpa</div></li></ul>`
}

function renderEmptyFavoriteCity(cityId) {
    return `
        <li class="loader-on city" id="favorite_${cityId}">
            <div class="city-loader">
                <span>Подождите, данные загружаются</span>
                <div class="loader-icon"></div>
            </div>
        </li>
    `
}

function setLoaderOnCurrentCity() {
    if (!currentCity.classList.contains('loader-on')) {
        currentCity.classList.add('loader-on');
    }
}

function unsetLoaderOnCurrentCity() {
    currentCity.classList.remove('loader-on');
}

function unsetLoaderOnFavoriteCity(cityId) {
    const cityObject = document.getElementById(`favorite_${cityId}`);
    cityObject.classList.remove('loader-on');
}