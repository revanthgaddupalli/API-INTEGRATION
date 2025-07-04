const apiKey = 'de67f813ac1a6ddb5fb9f4d60bce1d41';

window.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') getWeather();
});

function getWeather() {
    const city = document.getElementById('city').value.trim();
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const dailyForecastDiv = document.getElementById('daily-forecast');

    const hourlySection = document.getElementById('hourly-forecast-section');
    const dailySection = document.getElementById('daily-forecast-section');

    // Clear previous data
    hourlySection.style.display = 'none';
    dailySection.style.display = 'none';
    tempDivInfo.innerHTML = '';
    weatherInfoDiv.innerHTML = '';
    weatherIcon.style.display = 'none';
    hourlyForecastDiv.innerHTML = '';
    dailyForecastDiv.innerHTML = '';

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
        })
        .catch(() => {
            weatherInfoDiv.innerHTML = `<p>Error fetching weather data.</p>`;
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === "200") {
                displayHourlyForecast(data.list);
                displayDailyForecast(data.list);

                hourlySection.style.display = 'block';
                dailySection.style.display = 'block';
            }
        });
}

function calculateDewPoint(temp, humidity) {
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);
    return Math.round(dewPoint);
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');

    const cityName = `${data.name}, ${data.sys.country}`;
    const temperature = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const visibility = data.visibility / 1000; // km
    const dewPoint = calculateDewPoint(temperature, humidity);
    const description = data.weather[0].description;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;

    weatherInfoDiv.innerHTML = `
        <p><strong>${cityName}</strong></p>
        <p>${description}</p>
        <p><strong>Feels Like:</strong> ${feelsLike}°C</p>
        <p><strong>Wind Speed:</strong> ${windSpeed} m/s</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Dew Point:</strong> ${dewPoint}°C</p>
        <p><strong>Visibility:</strong> ${visibility.toFixed(1)} km</p>
    `;

    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherIcon.onload = () => weatherIcon.style.display = 'block';
    weatherIcon.onerror = () => weatherIcon.style.display = 'none';
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    const next24Hours = hourlyData.slice(0, 8);
    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const hourLabel = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItem = document.createElement('div');
        hourlyItem.classList.add('hourly-item');
        hourlyItem.innerHTML = `
            <span>${hourLabel}</span>
            <img src="${iconUrl}" alt="Icon">
            <span>${temperature}°C</span>
        `;
        hourlyForecastDiv.appendChild(hourlyItem);
    });
}

function displayDailyForecast(hourlyData) {
    const dailyForecastDiv = document.getElementById('daily-forecast');
    dailyForecastDiv.innerHTML = ''; // Clear previous forecast

    const groupedDays = {};

    // Group data points by date
    hourlyData.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        if (!groupedDays[date]) {
            groupedDays[date] = [];
        }
        groupedDays[date].push(item);
    });

    // Get only the first 6 days
    const dayKeys = Object.keys(groupedDays).slice(0, 6);

    dayKeys.forEach(date => {
        const dayItems = groupedDays[date];
        const temps = dayItems.map(d => d.main.temp);
        const avgTemp = Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);

        const iconCode = dayItems[0].weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const dayName = new Date(date).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
        });

        const dayDiv = document.createElement('div');
        dayDiv.classList.add('daily-item');
        dayDiv.innerHTML = `
            <span>${dayName}</span>
            <img src="${iconUrl}" alt="Icon">
            <span>${avgTemp}°C</span>
        `;
        dailyForecastDiv.appendChild(dayDiv);
    });
}

// City Suggestions
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
