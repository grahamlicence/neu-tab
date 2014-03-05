var Tab = {};

Tab.showTime = function () {
    "use strict";
    var time = document.createElement('p'),
        date = document.createElement('p'),
        updateClock = function() {
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
            time.innerHTML = '<span class="bk hr">' + hours + '</span>:<span class="bk">' + minutes + '</span>:<span class="bk">' + seconds + '</span>';
        },
        showDay = function () {
            var today = new Date(),
                day = today.getDayName(),
                month = today.getMonthName(),
                year = today.getFullYear();
            date.className = 'current-date';
            date.innerHTML = day + ' ' + today.getDate() + ' ' + month + ' ' + year;
            document.getElementsByTagName('body')[0].insertBefore(date);
        };
    
    time.className = 'current-time';
    document.getElementsByTagName('body')[0].insertBefore(time);
    setInterval(updateClock, 500);
    updateClock();
    // show day
    showDay();
};

Tab.locationData = function () {
    "use strict";
    var loc = JSON.parse(localStorage.getItem('location')),
        woeid = localStorage.getItem('woeid'),
        place = document.createElement('p'),
        bodyTag = document.getElementsByTagName('body')[0],
        weather = document.createElement('div'),
        forecast = document.createElement('div');

    // display the name of our current location
    function locationName () {
        place.className = 'current-location';
        document.getElementsByTagName('body')[0].insertBefore(place);
        // place.innerHTML = loc.address_components[1].long_name + ', ' + loc.address_components[2].long_name;
        place.innerHTML = loc.formatted_address;
    }

    // convert km to mph
    function kmTpMph (speed) {
        return Math.round(speed * 0.62137119223733);
    }

    // give a better name to wind direction
    function degToCompass(num) {
        var val = parseInt((num/22.5) + 0.5, 10),
            // arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
            arr = ['Northerly', 'North North Easterly', 'North Easterly', 'East North Easterly', 'Easterly', 'Eeast South Easterly', 'South Easterly', 'South South Easterly', 'Southerly', 'South South Westerly', 'South Westerly', 'West South Westerly', 'Westerly', 'West North Westerly', 'North Westerly', 'North North Westerly'];
        return arr[(val % 16)];
    }

    // display weather forecast on page
    function displayWeather (data) {
        if (data === null) {
            console.log('New forecast, data null');
            fetchWeatherForecast();
            return;
        }
        var results = data.query.results.channel,
            htmlData,
            temp = results.units.temperature,
            htmlForecast;

        weather.className = 'weather-forecast';
        console.log(results)
        htmlData = '<div class="weather-now icon icon-' + results.item.condition.code + '"><p class="weather-temp">' + results.item.condition.temp + '&deg;' +
            results.units.temperature + '</p>' +
            '<p class="type">' + results.item.condition.text + '</p>' +
            '<p class="todays-temp">Today, low: ' + results.item.forecast[0].low + '&deg;' + temp + ', high: ' + results.item.forecast[0].high + '&deg;' + temp + '</p>' +
            '<div class="weather-details">' +
            '<p class="wind-speed" title="Wind speed ' + kmTpMph(results.wind.speed) + 'mph, ' + degToCompass(parseFloat(results.wind.direction)) + '">' +
            '<i class="wind-speed--icon" style="-webkit-transform: rotate(' + (parseFloat(results.wind.direction) + 180) + 'deg);"></i>' +
            '<span class="wind-speed--value">' + kmTpMph(results.wind.speed) + '</p>' +
            '<p class="feels-like">Feels like: ' + results.wind.chill + '&deg;' + temp + '</p>' +
            '<p class="sunrise" title="Sunrise time">' + results.astronomy.sunrise + '</p>' +
            '<p class="sunset" title="Sunset time">' + results.astronomy.sunset + '</p>' +
            '</div></div>';

        // *********************
        // wind direction is position from so arrow would point 180 deg from this
        
        htmlForecast = '<ul class="forecast">';
        // show weekly forecast
        // weather codes http://developer.yahoo.com/weather/#codes
        _.each(results.item.forecast, function(day, index) {
            if (index === 0) {
                return;
            }
            htmlForecast += '<li title="' + day.date + '" class="icon icon-' + day.code + '">' +
                    '<p><strong>' + day.day + '</strong></p>' +
                    '<p>High: ' + day.high + '&deg;' + results.units.temperature + '</p>' +
                    '<p>Low:  ' + day.low +'&deg;' + results.units.temperature + '</p>' +
                    '<p>' + day.text +'</p>';
        });

        weather.innerHTML = htmlData;
        forecast.innerHTML = htmlForecast;
        bodyTag.className = 'load';
    }

    function fetchWeatherForecast () {
        var reqW;

        reqW = new XMLHttpRequest;

        // possibly use this if switching between temp units
        // alternatively calculate value in js
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

        reqW.ontimeout = function () {
            console.log('timeout')
        };

        reqW.send();
            
    }

    var lastChecked = parseInt(localStorage.getItem('weatherUpdate'), 10);
    // check weather every hour
    if (Date.now() - lastChecked > 3600000) {
        console.log('New forecast')
        // console.log(Date.now() - lastChecked + '/' + 7200000)
        fetchWeatherForecast();
    } else {
        displayWeather(JSON.parse(localStorage.getItem('weatherData')));
    }
    bodyTag.insertBefore(weather);
    bodyTag.insertBefore(forecast);
    locationName();

};

Tab.getLocation = function () {
    "use strict";
    if ('geolocation' in navigator === false) {
        // TODO: display message
        return;
    }
    // check if online
    if (!navigator.onLine) {
        document.getElementsByTagName('body')[0].className = 'load';
        console.log('No connection');
        return;
    }
    // error checking
    if (localStorage.getItem('location') === 'undefined') {
        localStorage.removeItem('lat');
        localStorage.removeItem('location');
        localStorage.removeItem('lon');
        Tab.getLocation();
        return;
    }

    var lat = parseFloat(localStorage.getItem('lat')).toFixed(3),
        lon = parseFloat(localStorage.getItem('lon')).toFixed(3),
        request;

    function locRangeCheck (num, match) {
        var low = num - 0.002,
            high = num + 0.002;
        return match > low && match < high;
    }
    navigator.geolocation.getCurrentPosition(function(position) {
        // check if still in same location and have location details
        // using toFixed as specifity of values changes
        if (locRangeCheck(lat, position.coords.latitude.toFixed(3)) && locRangeCheck(lon, position.coords.longitude.toFixed(3)) && localStorage.getItem('location')) {
            Tab.locationData();
            return;
        }
        // debug, log why getting location
        console.log('New location request')
        console.log('lat: ' + lat + '/' + position.coords.latitude.toFixed(3))
        console.log('lon: ' + lon + '/' + position.coords.longitude.toFixed(3))
        console.log(locRangeCheck(lat, position.coords.latitude.toFixed(3)))
        console.log(locRangeCheck(lon, position.coords.longitude.toFixed(3)))
        console.log('loc: ' + localStorage.getItem('location'))
        // store current location
        localStorage.setItem('lat', position.coords.latitude);
        localStorage.setItem('lon', position.coords.longitude);
        // Reverse geo lookup
        request = new XMLHttpRequest;
        request.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true', true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            var data = JSON.parse(request.responseText);
            console.log(data.results)
            // find the town name from the post code field and store
            var town = _.find(data.results, function (ac) { return ac.types[0] == 'neighborhood'; });
            if (!town) {
                town = _.find(data.results, function (ac) { return ac.types[0] == 'postal_code'; });
                Tab.getWoeid(town.address_components[1].long_name.replace(/ /g, '%20'));
            } else {
                Tab.getWoeid(town.address_components[1].long_name.replace(/ /g, '%20') + '%20' + town.address_components[town.address_components.length - 1].long_name);
            }
            localStorage.setItem('location', JSON.stringify(town));
            // get WOEID
          } else {
            // error
            console.log('error status')
          }
        };

        request.onerror = function() {
            console.log('error');
            document.getElementsByTagName('body')[0].className = 'load';
            // TODO: show error message
          // There was a connection error of some sort
        };

        request.send();

        // TODO: just use yahoo??
        //http://where.yahooapis.com/geocode?location=37.42,-122.12&flags=J&gflags=R&appid=zHgnBS4m
    }, 
    // check if connected to internet
    function (error) {
        console.log('Failed to get location')
        var p = document.createElement('p'),
        bodyTag = document.getElementsByTagName('body')[0];
        p.className = 'error-message';
        p.innerText = 'Unable to connect to internet or get location';
        bodyTag.insertBefore(p);
        bodyTag.className = 'load';
    },
    // change default timeout for location to 3 seconds
    {timeout: 3000});
};

Tab.getWoeid = function (place) {
    "use strict";
    var request, data;
    // get the WOEID needed for yahoo weather lookups
    navigator.geolocation.getCurrentPosition(function(position) {

        console.log('New WOEID request')

        request = new XMLHttpRequest;

        request.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22' + place + '%22&format=json', true);

        request.onload = function() {
          if (request.status >= 200 && request.status < 400) {
            data = JSON.parse(request.responseText);
            console.log(data)
            var dubs;
            // sometimes this comes back as an array
            if (data.query.results.place.woeid) {
                dubs = data.query.results.place.woeid;
            } else {
                dubs = data.query.results.place[0].woeid;                
            }
            localStorage.setItem('woeid', dubs);
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

// simple jsonp script
var jsonp = function (url) {
    var script = document.createElement('SCRIPT');
        script.src = url;
    document.body.appendChild(script);
};

// var callback;
Tab.getNews = function () {
    var feed = document.createElement('div');
    
    // var request = new XMLHttpRequest;

    // request.open('GET', 'http://feeds.bbci.co.uk/news/rss.xml', true);

    // request.onload = function() {
    //   if (request.status >= 200 && request.status < 400){
    //     // console.log(request.responseText)
    //     // return;
    //     var data = JSON.parse(request.responseText);
    //     console.log(data)

    //   } else {
    //     // error
    //     console.log('error status')
    //   }
    // };

    // request.onerror = function() {
    //     console.log('error')
    //   // There was a connection error of some sort
    // };

    // request.send();
};
    // var callback = function (response) {
    //     console.log('yup')
    //     console.log(response)
    // }
    // jsonp('//api.ihackernews.com/page?format=jsonp&callback=callback');
    // jsonp('//feeds.bbci.co.uk/news/rss.xml&callback=callback');

// store current version and update all settings on new release
Tab.versionUpdate = function () {
    var version = '0.1.3';
        current = localStorage.getItem('version');
    if (current !== version) {
        console.log('New version')
        localStorage.setItem('version', version);
        localStorage.removeItem('lat');
        localStorage.removeItem('lon');
    }
};

Tab.init = function  () {
    Tab.versionUpdate();
    Tab.showTime();
    Tab.getLocation();
    // Tab.getNews();
};

Tab.init();


// news feeds view-source:http://www.richmondandtwickenhamtimes.co.uk/news/rss/
// http://feeds.bbci.co.uk/news/rss.xml


