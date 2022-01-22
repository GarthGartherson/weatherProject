import { fromUnixTime, differenceInHours } from "date-fns";
import "./style.css";

//
const errorContainer = document.querySelector(".error-container");
const hourlyContainer = document.querySelector(".container_hourly-weather");
const searchData = document.querySelector("#form-data");
const temperatureSelector = document.querySelector("#temperature-selector");
const currentMeasurement = document.querySelectorAll(".temperature-unit");

// Current Time Selectors
const currentTemperature = document.querySelector("#current-temperature");
const currentWeatherCondition = document.querySelector(".current-weather-data");
const currentCity = document.querySelector("#current-city");

// Hourly Selectors
const dailyHigh = document.querySelector("#daily-high");
const dailyLow = document.querySelector("#daily-low");
const currentTime = document.querySelector("#current-time-data");
const sunriseTime = document.querySelector("#sunrise-data");
const sunsetTime = document.querySelector("#sunset-data");

// Other Data
const windData = document.querySelector("#wind-data");
const cloudData = document.querySelector("#cloud-data");
const rainData = document.querySelector("#rain-data");
const humidityData = document.querySelector("#humidity-data");
const windMeasure = document.querySelector("#wind-measure");

// Search Function
document.addEventListener("submit", (e) => {
  errorContainer.classList.remove("active");
  errorContainer.innerText = "";
  if (!searchData.value) {
    return;
  }
  temperatureSelector.checked = false;
  if (temperatureSelector.checked) {
    currentMeasurement.forEach((el) => {
      el.innerText = "℉";
    });
    getHourlyData(searchData.value || "London", "imperial");
  } else {
    getHourlyData(searchData.value || "London");
    currentMeasurement.forEach((el) => {
      el.innerText = "℃";
    });
  }
  getHourlyData(searchData.value);
  e.preventDefault();
});

//event listener for celcius->fahrenheit
temperatureSelector.addEventListener("change", () => {
  if (temperatureSelector.checked) {
    windMeasure.innerText = "miles/hour";
    currentMeasurement.forEach((el) => {
      el.innerText = "℉";
    });
    getHourlyData(searchData.value || "London", "imperial");
  } else {
    windMeasure.innerText = "metre/second";
    getHourlyData(searchData.value || "London");
    currentMeasurement.forEach((el) => {
      el.innerText = "℃";
    });
  }
  // if()
});

// Retrieves coords from api and uses to get hourly data in seperate api
async function getHourlyData(city = "London", unit = "metric") {
  try {
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5f305b97645ec6a6f8b0c56c83df4375`
    );
    if (result.ok) {
      const parsedResult = await result.json();
      let { lon, lat } = parsedResult.coord;
      const oneCallData = await fetch(
        `http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=5f305b97645ec6a6f8b0c56c83df4375&units=${unit}
        `
      );
      if (oneCallData.ok) {
        const parsedOneCAll = await oneCallData.json();
        city = parsedResult.name;
        populateData(parsedOneCAll, city);
      } else {
        throw new Error("Please Enter Correct City Name");
      }
    } else {
      throw new Error("Please Enter Correct City Name");
    }
  } catch (err) {
    errorContainer.classList.add("active");
    errorContainer.innerText = err.message;
  }
}

function fillHourContainer(presentTime, data) {
  let previousElements = document.querySelectorAll(
    ".single-hour-weather-container"
  );
  if (previousElements) {
    previousElements.forEach((element) => {
      element.remove();
    });
  }
  let currentHour = presentTime.slice(0, 3);
  const hoursRemaining = 24 - currentHour;

  for (let i = 0; i <= hoursRemaining; i++) {
    const newHourContainer = document.createElement("div");
    newHourContainer.classList.add("single-hour-weather-container");

    const newHourTime = document.createElement("div");
    newHourTime.classList.add("hourly-weather-time");
    newHourTime.innerText = +currentHour + i + ":00";

    const newHourTemperature = document.createElement("div");
    newHourTemperature.classList.add("hourly-weather-temperature");
    newHourTemperature.innerText = data[i].temp;

    console.log(temperatureSelector.checked);
    const newHourSymbol = document.createElement("span");
    if (temperatureSelector.checked == true) {
      newHourSymbol.innerText = "℉";
    } else {
      newHourSymbol.innerText = "℃";
    }
    newHourSymbol.classList.add("temperature-unit");
    newHourTemperature.append(newHourSymbol);

    newHourContainer.append(newHourTime, newHourTemperature);
    hourlyContainer.append(newHourContainer);
  }
}

function convertUnixToUTC(data) {
  const formattedTime = new Date(fromUnixTime(data))
    .toUTCString()
    .slice(16, -7);
  return formattedTime;
}

function populateData(data, city) {
  currentCity.innerText = city;
  dailyHigh.innerText = data.daily[0].temp.max;
  dailyLow.innerText = data.daily[0].temp.min;
  currentTemperature.innerText = data.current.temp;

  let presentTime = convertUnixToUTC(data.current.dt + data.timezone_offset);

  fillHourContainer(presentTime, data.hourly);

  currentTime.innerText = presentTime;
  sunriseTime.innerText = convertUnixToUTC(
    data.current.sunrise + data.timezone_offset
  );
  sunsetTime.innerText = convertUnixToUTC(
    data.current.sunset + data.timezone_offset
  );

  currentWeatherCondition.innerText = data.current.weather[0].description;
  windData.innerText = data.current.wind_speed;
  cloudData.innerText = data.current.clouds;
  humidityData.innerText = data.current.humidity;
  rainData.innerText = data.daily[0].pop;
}

getHourlyData("London");

// getHourlyData();

// https://api.openweathermap.org/data/2.5/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key} (ALLINONEAPI)
// current.dt Requested time, Unix, UTC
// current.sunrise Sunrise time, Unix, UTC
// current.sunset Sunset time, Unix, UTC
