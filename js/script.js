function updateByCoords(updater) {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;
            ans = `http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}`;
            update(ans, updater, document.querySelector('div.mainMargin'));
        },
        function (err) {
            ans = `http://localhost:3000/weather/city?q=Москва`;
            update(ans, updater, document.querySelector('div.mainMargin'));
        });
}

const getByCityName = (city) => {
    return `http://localhost:3000/weather/city?q=${city}`
}

async function update(selector, updater, el = null) {
    let result = 0;

    try {
        await fetch(selector)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    updater(data);
                    result = 200;
                } else {
                    result = 404;
                }
            });
    } catch (err) {
        if (el) {
            setLoader(el);
        }
        result = -1;
    }
    return result;
}

function firstLetterCapital(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateCurrentCity(data) {
    document.querySelector('div.mainMargin h2').textContent = data.name;
    document.querySelector('div.mainMargin div.mainTemp').textContent = Math.round(data.main.temp) + "℃";
    document.querySelector('div.mainMargin ul li div.wind').textContent = data.wind.speed + " м/с";
    document.querySelector('div.mainMargin ul li div.clouds').textContent = firstLetterCapital(data.weather[0].description);
    document.querySelector('div.mainMargin ul li div.pressure').textContent = data.main.pressure + " мм рт. ст.";
    document.querySelector('div.mainMargin img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
}

function updateCities(el, data, city) {
    el.querySelector('h3').textContent = data.name;
    el.querySelector('span.temp').textContent = Math.round(data.main.temp) + "℃";
    el.querySelector('div.wind').textContent = data.wind.speed + " м/с";
    el.querySelector('div.clouds').textContent = firstLetterCapital(data.weather[0].description);
    el.querySelector('div.pressure').textContent = data.main.pressure + " мм рт. ст.";
    el.querySelector('img').src = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png";
    el.querySelector('button.close').addEventListener('click', () => removeCity(el, city));
}

function setLoader(el) {
    var header = el.querySelector('h2');
    if (header) {
        header.textContent = "Ошибка загрузки";
    }

    header = el.querySelector('h3');
    if (header) {
        header.textContent = "Ошибка загрузки";
    }
}

async function getCityList() {
    let cities;
    await fetch("http://localhost:3000/features")
        .then(response => response.json())
        .then(data => {
            cities = data;
        })
    return cities;
}

async function addCityToUI() {
    var inputBox = document.querySelector('div.inputBox input');
    var city = inputBox.value.toLowerCase();

    if (!city) {
        alert("Название города не может быть пустым");
        return;
    }

    inputBox.value = '';
    let req = await fetch('http://localhost:3000/features?city=' + city,
        {
            method: 'POST'
        })
    if (req.status === 200) {
        const res = await placeCity(city);
        if (res) {
            req;
        }
    }
    else if (req.status === 500){
        alert("Вы уже добавили этот город")
    }
}

async function placeCity(city, loader = true) {
    var el = document.querySelector('#tableElement').content.cloneNode(true);
    console.log(el);
    document.querySelector('main').append(el);
    el = document.querySelector('main').lastElementChild;

    let prevDisplay = el.style.display;
    if (!loader) {
        el.style.display = 'none';
    }
    var res = await update(getByCityName(city), (data) => updateCities(el, data, city));

    if (res === 200) {
        if (!loader) {
            el.style.display = prevDisplay;
        }
        return true;
    } else if (res === 404) {
        el.remove();
        alert("Такой город не найден");
    } else if (res === -1) {
        setLoader(el);
    }

    return false;
}

async function removeCity(el, city) {
    el.querySelector('button').disabled = true;
    city = city.toLowerCase();

    try {
        await fetch('http://localhost:3000/features?city=' + city,
            {
                method: 'DELETE'
            })
            .then(res => {
                if (res.status === 200) {
                    el.remove();
                }
            })
    } catch (err) {
        el.querySelector('button').disabled = false;
    }
}

async function updateCityList() {
    let cities = await getCityList();
    if (cities) {
        for (let city of cities) {
            placeCity(city);
        }
    }
}

function init() {
    document.querySelector('form.addCity').addEventListener('submit', (event) => {
        event.preventDefault();
        addCityToUI();
    });
    document.querySelector('button.plus').addEventListener('click', addCityToUI);
    document.querySelector('button.geo').addEventListener('click',
        () => updateByCoords(updateCurrentCity));
    updateByCoords(updateCurrentCity);
    updateCityList();
}

window.addEventListener('load', init);

function getWeatherIcon(weatherData) {
    return `https://openweathermap.org/img/wn/${weatherData['weather'][0]['icon']}.png`
}
