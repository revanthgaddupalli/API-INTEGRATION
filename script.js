const apiKey = 'de67f813ac1a6ddb5fb9f4d60bce1d41';
let weatherLoaded = false;

window.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') 
        getWeather();
});

window.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.flip-container');
    container.addEventListener('click', function (e) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') return;
        if (!weatherLoaded) return;
        container.classList.toggle('flipped');
    });
});

function getWeather() {
    const city = document.getElementById('city').value.trim();
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastGrid = document.getElementById('hourly-forecast-grid');

    // Clear previous data
    tempDivInfo.innerHTML = '';
    weatherInfoDiv.innerHTML = '';
    weatherIcon.style.display = 'none';
    hourlyForecastGrid.innerHTML = '';
    weatherLoaded = false;

    if (!city) {
        weatherInfoDiv.innerHTML = `<p>Please enter a city name.</p>`;
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                weatherInfoDiv.innerHTML = `<p>${data.message || 'City not found'}</p>`;
                return;
            }
            displayWeather(data);
            weatherLoaded = true;
        })
        .catch(error => {
            weatherInfoDiv.innerHTML = `<p>Error fetching weather data.</p>`;
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") return;
            displayHourlyForecast(data.list);
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    const cityName = `<strong>${data.name}, ${data.sys.country}</strong>`;
    const temperature = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    const feelsLike = data.main.feels_like;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    const visibility = data.visibility / 1000; // km
    const dewPoint = calculateDewPoint(temperature, humidity);

    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;

    weatherInfoDiv.innerHTML = `
    <p>${cityName}</p>
    <p>${description}</p>
    <p><strong>Feels Like:</strong> ${Math.round(feelsLike)}°C</p>
    <p><strong>Wind Speed:</strong> ${wind} m/s</p>
    <p><strong>Humidity:</strong> ${humidity}%</p>
    <p><strong>Dew Point:</strong> ${dewPoint}°C</p>
    <p><strong>Visibility:</strong> ${visibility} km</p>
  `;

    weatherIcon.onload = () => weatherIcon.style.display = 'block';
    weatherIcon.onerror = () => weatherIcon.style.display = 'none';
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastGrid = document.getElementById('hourly-forecast-grid');
    hourlyForecastGrid.innerHTML = '';

    const next24Hours = hourlyData.slice(0, 8);
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hourLabel = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-grid-item');
        hourlyItem.innerHTML = `
            <span>${hourLabel}</span><br>
            <img src="${iconUrl}" alt="Icon"><br>
            <span>${temperature}°C</span>
        `;

        hourlyForecastGrid.appendChild(hourlyItem);
    });
}

// City Suggestions Feature
const cityInput = document.getElementById('city');
const suggestionsList = document.getElementById('city-suggestions');
let debounceTimeout;

cityInput.addEventListener('input', function () {
    clearTimeout(debounceTimeout);
    const query = cityInput.value.trim();

    if (query.length < 2) {
        suggestionsList.innerHTML = '';
        return;
    }

    debounceTimeout = setTimeout(() => {
        fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`)
            .then(res => res.json())
            .then(data => {
                suggestionsList.innerHTML = '';
                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = `${location.name}, ${location.country}`;
                    suggestionsList.appendChild(option);
                });
            });
    }, 300);
});
