function getWeather() {
    const apiKey = 'de67f813ac1a6ddb5fb9f4d60bce1d41';
    const city = document.getElementById('city').value.trim();

    if (!city) {
        alert('Please enter a city');
        return;
    }

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            displayWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
            alert('Error fetching hourly forecast data. Please try again.');
        });
}

function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';
    weatherIcon.style.display = 'none';

    if (data.cod === 404 || data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = `<strong>${data.name}, ${data.sys.country}</strong>`;
        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        const temperatureHTML = `<p>${temperature}°C</p>`;
        const weatherHtml = `<p>${cityName}</p><p>${description}</p>`;

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;

        weatherIcon.onload = () => {
            weatherIcon.style.display = 'block';
        };
        weatherIcon.onerror = () => {
            weatherIcon.style.display = 'none';
        };
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
    }
}

function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');

    const next24Hours = hourlyData.slice(0, 8); // Display 3-hour intervals (8 items = 24 hours)

    next24Hours.forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Convert timestamp to milliseconds
        const hourLabel = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${hourLabel}</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

const cityInput = document.getElementById('city');
const suggestionsList = document.getElementById('city-suggestions');
const apiKey = 'de67f813ac1a6ddb5fb9f4d60bce1d41'; // your existing OpenWeather API key

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
            })
            .catch(err => {
                console.error('Error fetching city suggestions:', err);
            });
    }, 300);
});

// Theme Toggle
document.getElementById('mode-toggle').addEventListener('change', function () {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
});

// Get last saved theme on load/refresh
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('mode-toggle').checked = true;
    }
});
