var Tab = {};

Tab.showTime = function () {
    "use strict";
    var elem = document.createElement('p');
    var updateClock = function() {
        // Gets the current time
        var now = new Date(),
            hours = now.getHours(),
            minutes = now.getMinutes(),
            seconds = now.getSeconds();

        // Format display
        if (hours < 10) {
            hours = '0' + hours;
        }
        if (minutes < 10) {
            minutes = '0' + minutes;
        }
        if (seconds < 10) {
            seconds = '0' + seconds;
        }
        elem.innerHTML = '<span class="bk">' + hours + '</span>:<span class="bk">' + minutes + '</span>:<span class="bk">' + seconds + '</span>';
    };
    elem.className = 'current-time';
    document.getElementsByTagName('body')[0].insertBefore(elem);
    setInterval(updateClock, 500);
    updateClock();
};

Tab.locationData = function () {
    "use strict";
    var loc = JSON.parse(localStorage.getItem('location')),
        woeid = localStorage.getItem('woeid'),
        place = document.createElement('p'),
        weather = document.createElement('div');
    console.log(loc);

    function locationName () {
        place.className = 'current-location';
        document.getElementsByTagName('body')[0].insertBefore(place);
        place.innerHTML = loc.address_components[1].long_name + ', ' + loc.address_components[2].long_name;
    }

    function displayWeather (data) {
        if (data.query === null) {
            weatherForecast();
            return;
        }
        var results = data.query.results.channel,
            html;

        weather.className = 'weather-forecast';
        document.getElementsByTagName('body')[0].insertBefore(weather);
        console.log(results)
        html = '<p>Sunset: ' + results.astronomy.sunset + '</p>';
        html += '<p class="weather-now">' + results.item.condition.temp + '&deg;' + results.units.temperature + ' ' + results.item.condition.text + '</p>';
        html += '<ul class="forecast">';
        // show weekly forecast
        // weather codes http://developer.yahoo.com/weather/#codes
        _.each(results.item.forecast, function(day) {
          html +=   '<li title="' + day.date + '">' +
                    '<p>' + day.day + '</p>' +
                    '<p>High: ' + day.high + '&deg;' + results.units.temperature + '</p>' +
                    '<p>Low:  ' + day.low +'&deg;' + results.units.temperature + '</p>' +
                    '<p>' + day.text +'</p>';
        });

        weather.innerHTML = html;
    }

    function weatherForecast () {
        var reqW;

        reqW = new XMLHttpRequest;

        // possibly use this if switching between temp units
        var hasC = '%20AND%20u%3D\'c\'';
        
        reqW.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D' + woeid + hasC + '&format=json&diagnostics=true&callback=', true);

        reqW.onload = function() {
          if (reqW.status >= 200 && reqW.status < 400) {
            var data = JSON.parse(reqW.responseText);
            localStorage.setItem('weatherUpdate', Date.now());
            localStorage.setItem('weatherData', JSON.stringify(data));
            displayWeather(data)
          } else {
            // error
            console.log('error on load')
          }
        };

        reqW.onerror = function() {
            console.log('connection error')
        };

        reqW.send();
            
    }

    locationName();
    var lastChecked = parseInt(localStorage.getItem('weatherUpdate'), 10);
    // check weather every two hours
    if (Date.now() - lastChecked > 7200000) {
        weatherForecast();
    } else {
        displayWeather(JSON.parse(localStorage.getItem('weatherData')));
    }

};

Tab.getLocation = function () {
    "use strict";
    if ('geolocation' in navigator === false) {
        // TODO: display message
        return;
    }
    var lat = parseFloat(localStorage.getItem('lat')).toFixed(3),
        lon = parseFloat(localStorage.getItem('lon')).toFixed(3),
        request;

    navigator.geolocation.getCurrentPosition(function(position) {
        // check if still in same location and have location details
        // using toFixed as specifity of values changes
        if (lat === position.coords.latitude.toFixed(3) && lon === position.coords.longitude.toFixed(3) && localStorage.getItem('location')) {
            Tab.locationData();
            return;
        }
        // store current location
        localStorage.setItem('lat', position.coords.latitude);
        localStorage.setItem('lon', position.coords.longitude);
        // Reverse geo lookup
        request = new XMLHttpRequest;
        request.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true', true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            // find the town name from the post code field and store
            var town = _.find(data.results, function (ac) { return ac.types[0] == 'postal_code'; });
            localStorage.setItem('location', JSON.stringify(town));
            // get WOEID
            Tab.getWoeid(town.address_components[1].long_name.replace(/ /g, '%20') + '%20' + town.address_components[town.address_components.length - 1].long_name);
          } else {
            // error
            console.log('error status')
          }
        };

        request.onerror = function() {
            console.log('error')
          // There was a connection error of some sort
        };

        request.send();

        // TODO: just use yahoo??
        //http://where.yahooapis.com/geocode?location=37.42,-122.12&flags=J&gflags=R&appid=zHgnBS4m
    });
};

Tab.getWoeid = function (place) {
    "use strict";
    var request, data;
    // get the WOEID needed for yahoo weather lookups
    navigator.geolocation.getCurrentPosition(function(position) {

        request = new XMLHttpRequest;

        request.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22' + place + '%22&format=json', true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400){
            data = JSON.parse(request.responseText);
            // console.log(data.query.results.place[0].woeid)
            localStorage.setItem('woeid', data.query.results.place[0].woeid);
            // TODO: update weather when location changed
            Tab.locationData();

          } else {
            // error
            console.log('error status')
          }
        };

        request.onerror = function() {
            console.log('error')
          // There was a connection error of some sort
        };

        request.send();
        
    });
};

Tab.init = function  () {
    Tab.showTime();
    Tab.getLocation();
};

Tab.init();
