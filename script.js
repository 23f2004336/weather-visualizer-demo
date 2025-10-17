// WARNING: For a production application, storing API keys directly in client-side code is NOT recommended.
// Consider using a backend proxy or serverless function to make API requests securely.
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your actual OpenWeatherMap API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get references to DOM elements
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherResultsDiv = document.getElementById('weather-results');

/**
 * Fetches weather data for a given city from the OpenWeatherMap API.
 * @param {string} cityName - The name of the city.
 * @returns {Promise<object|null>} - A promise that resolves to the weather data object or null on error.
 */
async function fetchWeatherData(cityName) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        displayErrorMessage('Please replace "YOUR_OPENWEATHERMAP_API_KEY" in script.js with your actual API key.');
        return null;
    }

    const url = `${BASE_URL}?q=${cityName}&appid=${API_KEY}&units=metric`; // units=metric for Celsius

    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Handle HTTP errors (e.g., 404 for city not found, 401 for invalid API key)
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        displayErrorMessage(`Failed to fetch weather data: ${error.message}`);
        return null;
    }
}

/**
 * Displays the fetched weather data in the DOM.
 * @param {object} weatherData - The weather data object from the API.
 */
function displayWeather(weatherData) {
    if (!weatherData) {
        weatherResultsDiv.innerHTML = '<p class="text-danger">Could not retrieve weather data.</p>';
        return;
    }

    const { name, main, weather, wind } = weatherData;
    const temperature = main.temp;
    const feelsLike = main.feels_like;
    const humidity = main.humidity;
    const description = weather[0] ? weather[0].description : 'N/A';
    const iconCode = weather[0] ? weather[0].icon : '';
    const windSpeed = wind.speed; // meters/second

    // Convert wind speed to km/h for better readability (1 m/s = 3.6 km/h)
    const windSpeedKmh = (windSpeed * 3.6).toFixed(1);

    weatherResultsDiv.innerHTML = `
        <h2 class="mb-3">${name}</h2>
        <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" class="weather-icon">
        <p><strong>Temperature:</strong> ${temperature}°C (Feels like: ${feelsLike}°C)</p>
        <p><strong>Description:</strong> ${description.charAt(0).toUpperCase() + description.slice(1)}</p>
        <p><strong>Humidity:</strong> ${humidity}%</p>
        <p><strong>Wind Speed:</strong> ${windSpeedKmh} km/h</p>
    `;
}

/**
 * Displays an error message in the weather results div.
 * @param {string} message - The error message to display.
 */
function displayErrorMessage(message) {
    weatherResultsDiv.innerHTML = `<p class="text-danger">${message}</p>`;
}

// Event listener for form submission
weatherForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent default form submission and page reload

    const cityName = cityInput.value.trim(); // Get city name and remove whitespace
    if (cityName) {
        weatherResultsDiv.innerHTML = '<p>Fetching weather...</p>'; // Show loading message
        const data = await fetchWeatherData(cityName);
        displayWeather(data);
    } else {
        displayErrorMessage('Please enter a city name.');
    }
});

// Optional: Uncomment the following to fetch weather for a default city on page load
// window.addEventListener('load', () => {
//     cityInput.value = 'London'; // Set a default city
//     weatherForm.dispatchEvent(new Event('submit')); // Programmatically submit the form
// });
