const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".not-foundsection-message");
const searchSection = document.querySelector(".search-city");
const weatherSection = document.querySelector(".weather-info");

const apiKey = '8cfc3f0b1018a1400756a90e50939a0e';

// Search city by button
searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

// Search city by Enter key
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value);
    cityInput.value = '';
    cityInput.blur();
  }
});

async function getFetchData(endPoint, city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric`;
  const response = await fetch(apiUrl);
  return response.json();
}

async function updateWeatherInfo(city) {
  const weatherData = await getFetchData('weather', city);
  const forecastData = await getFetchData('forecast', city);

  if (weatherData.cod != 200 || forecastData.cod != "200") {
    showErrorSection();
    return;
  }

  // Show weather section, hide others
  weatherSection.style.display = "block";
  notFoundSection.style.display = "none";
  searchSection.style.display = "none";

  // Current Weather
  document.querySelector(".country-txt").textContent = weatherData.name;
  document.querySelector(".temp-txt").textContent = `${Math.round(weatherData.main.temp)} °C`;
  document.querySelector(".condition-txt").textContent = weatherData.weather[0].main;
  document.querySelector(".humidity-value-txt").textContent = `${weatherData.main.humidity}%`;
  document.querySelector(".wind-value-txt").textContent = `${weatherData.wind.speed} M/s`;
  document.querySelector(".weather-summary-img").src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  const today = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'long' };
  document.querySelector(".current-date-txt").textContent = today.toLocaleDateString('en-US', options);

  // Forecast (4 days)
  const forecastItems = getFourDayForecast(forecastData.list);
  const forecastContainer = document.querySelector(".forecast-item-container");

  forecastContainer.innerHTML = forecastItems.map(item => {
    return `
      <div class="forecast-item">
        <h5 class="forecast-item-date regular-txt">${item.date}</h5>
        <img src="https://openweathermap.org/img/wn/${item.icon}@2x.png" class="forecast-item-img" width="80" alt="forecast">
        <h5 class="forecast-item-temp">${item.temp} °C</h5>
      </div>
    `;
  }).join('');
}

function showErrorSection() {
  weatherSection.style.display = "none";
  notFoundSection.style.display = "block";
  searchSection.style.display = "none";
}

// Helper: Extract 4-day forecast from 3-hour data
function getFourDayForecast(forecastList) {
  const forecastMap = {};

  forecastList.forEach(item => {
    const date = item.dt_txt.split(" ")[0];
    const hour = item.dt_txt.split(" ")[1];

   

    // Pick forecast near 12:00 PM
    if (hour === "12:00:00" && !forecastMap[date]) {
      forecastMap[date] = {
        date: formatForecastDate(new Date(item.dt_txt)),
        temp: Math.round(item.main.temp),
        icon: item.weather[0].icon
      };
    }
  });

  // Return only the next 4 days (skip today)
  return Object.values(forecastMap).slice(1, 5);
}

function formatForecastDate(date) {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('en-US', options);
}


