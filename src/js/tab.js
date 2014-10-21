var Tab = {};

Tab.showTime = function () {
    "use strict";
    var time = document.createElement('p'),
        date = document.createElement('p'),
        clock = document.createElementNS("http://www.w3.org/2000/svg", 'svg'),
        bodyTag = document.getElementsByTagName('body')[0],
        weatherLoader = document.createElement('div');

    // analogue clock
    function makeClock () {
        var group = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
            hands = [
                { id: 'hour-hand',x: 15.57,y: 9.9,width: 0.85,height: 7.626 },
                { id: 'minute-hand',x: 15.65,y: 6.2,width: 0.7,height: 11.439 },
                { id: 'second-hand',x: 15.88,y: 7.46,width: 0.24,height: 9.83 }
            ],
            els = [],
            markers = document.createElementNS("http://www.w3.org/2000/svg", 'g'),
            lines = [
                { x: 10, y: 10 }
            ];

        _.each(hands, function (hand) {
            var rect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            rect.id = hand.id;
            rect.setAttribute('x', hand.x);
            rect.setAttribute('y', hand.y);
            rect.setAttribute('width', hand.width);
            rect.setAttribute('height', hand.height);
            els.push(rect);
            group.appendChild(rect);
        });

        _.each(lines, function (pos) {
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', pos.x);
            line.setAttribute('y1', pos.y);
            line.setAttribute('x2', pos.x);
            line.setAttribute('y2', 0);
            line.setAttribute('width', 1.7);
            line.setAttribute('height', 10);
            markers.appendChild(line);
        });

        group.id = 'clock-icon';
        clock.appendChild(group);
        clock.appendChild(markers);
        clock.setAttribute('viewBox', '0 0 32 32');
        clock.setAttribute('class', 'clock is-x10');
        bodyTag.appendChild(clock);

        var setTime = function(){
          var date = new Date(),
          MINUTE = 60, HOUR   = 60*MINUTE,
          seconds = date.getSeconds(),
          minutes = (date.getMinutes()*MINUTE) + seconds,
          hours = (date.getHours()*HOUR)+minutes;
     
          els[2].setAttribute('transform', 'rotate('+360*(seconds/MINUTE)+',16,17)');
          els[1].setAttribute('transform', 'rotate('+360*(minutes/HOUR)+',16,17)');
          els[0].setAttribute('transform', 'rotate('+360*(hours/(12*HOUR))+',16,17)');
        };
        setTime();
        var interval = setInterval(setTime,1000);
    }

    // digital clock
    function updateClock () {
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
        time.innerHTML = '<span class="bk hr">' + hours + '</span>:<span class="bk mn">' + minutes + '</span>:<span class="bk sc">' + seconds + '</span>';
        // time.innerHTML = '<span class="bk hr">00</span>:<span class="bk mn">00</span>:<span class="bk sc">00</span>';
    }
    function showDay () {
        var today = new Date(),
            day = today.getDayName(),
            month = today.getMonthName(),
            year = today.getFullYear();
        date.className = 'current-date';
        date.innerHTML = day + ' ' + today.getDate() + ' ' + month + ' ' + year;
        document.getElementsByTagName('body')[0].appendChild(date);
    }
    // add analogue clock
    makeClock();
    time.className = 'current-time';
    bodyTag.appendChild(time);
    setInterval(updateClock, 1000);
    updateClock();

    // show day
    showDay();
    
    bodyTag.className = 'load';
    weatherLoader.className = 'weather-loader'
    bodyTag.appendChild(weatherLoader);
};

Tab.removeOldData = function () {
    var weather = document.getElementsByClassName('weather-wrapper'),
        location = document.getElementsByClassName('current-location'),
        changeForm = document.getElementsByClassName('change-wrapper');
    if (weather.length) {
        weather[0].remove();
        location[0].remove();
    }
    if (changeForm.length) {
        changeForm[0].remove();
    }
};

Tab.locationData = function (usingPrevious) {
    "use strict";
    // remove any previous data
    Tab.removeOldData();
    var loc = JSON.parse(localStorage.getItem('location')),
        woeid = localStorage.getItem('woeid'),
        place = document.createElement('p'),
        bodyTag = document.getElementsByTagName('body')[0],
        weather = document.createElement('div'),
        forecast = document.createElement('div'),
        wrapper = document.createElement('div'),
        changeLink = document.createElement('a');

    // display the name of our current location
    function locationName () {
        place.className = 'current-location';
        document.getElementsByTagName('body')[0].appendChild(place);
        // place.innerHTML = loc.address_components[1].long_name + ', ' + loc.address_components[2].long_name;
        // check for errors and using previous manual location
        if (usingPrevious) {
            changeLink.innerText = 'change';
            changeLink.href = '#';
            changeLink.className = 'last-known';
            changeLink.addEventListener('click', function (e) {
                e.preventDefault();
                Tab.changeLocation();
            });
            place.innerHTML = loc.formatted_address +
                '<span class="last-known">Using last known location</span> ';
            place.appendChild(changeLink);
            // console.log(changeLink)
            // TODO: add change location here
        } else {
            place.innerHTML = loc.formatted_address;
        }
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
            htmlForecast = document.createElement('ul'),
            htmlForecastData = document.createElement('p'),
            forcastItem;

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
        htmlForecastData.innerHTML = '&nbsp;';
        htmlForecastData.className = 'forecast-summary';

        // *********************
        // wind direction is position from so arrow would point 180 deg from this
        
        // show weekly forecast
        // weather codes http://developer.yahoo.com/weather/#codes
        htmlForecast.className = 'forecast';

        forecast.appendChild(htmlForecast);
        forecast.appendChild(htmlForecastData);

        _.each(results.item.forecast, function(day, index) {
            if (index === 0) {
                return;
            }
            forcastItem = document.createElement('li');
            forcastItem.details = day.date + ' - ' + day.text;
            forcastItem.className = 'icon icon-' + day.code;

            forcastItem.innerHTML = '<p class="day"><strong>' + day.day + '</strong></p>' +
                    '<p><span class="high">' + day.high + '&deg;' + results.units.temperature + '</span>' +
                    '<span class="low">' +  day.low +'&deg;</span>' + results.units.temperature + '</p>';

            htmlForecast.appendChild(forcastItem);

            function hoverDay () {
                htmlForecastData.innerHTML = this.details;
                htmlForecastData.className += ' shown';
            }
            function hoverOffDay () {
                // htmlForecastData.innerHTML = '&nbsp;';
                htmlForecastData.className = 'forecast-summary';
            }
            forcastItem.addEventListener('mouseover', hoverDay);
            forcastItem.addEventListener('mouseout', hoverOffDay);
            
            // animate in the item
            function shown (el) {
                // console.log(el)
                setTimeout(function () {
                    el.className += ' shown';
                }, 75 * index);
            }
            shown(forcastItem);
        });

        weather.innerHTML = htmlData;
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
    // add content to page
    wrapper.className = 'weather-wrapper';
    //remove loader and replace with weather content
    document.getElementsByClassName('weather-loader')[0].remove();
    bodyTag.appendChild(wrapper);
    wrapper.appendChild(weather);
    wrapper.appendChild(forecast);
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
        // console.log(error)
        // ooh interesting error here, seems Chrome location only works on wifi devices
        // https://code.google.com/p/chromium/issues/detail?id=41001
        console.log('Failed to get location');
        // check if previous location added
        if (localStorage.getItem('location')) {
            Tab.locationData(true);
            return;
        }
        var p = document.createElement('p'),
            bodyTag = document.getElementsByTagName('body')[0];
        
        p.className = 'error-message';
        bodyTag.appendChild(p);
        
        if (navigator.onLine) {
            p.innerText = 'Unable to get location';
            Tab.changeLocation();
        } else {
            p.innerText = 'Unable to connect to internet or get location';
        }
        bodyTag.className = 'load';
    },
    // change default timeout for location to 3 seconds
    {timeout: 3000});
};

// add form to change location
Tab.changeLocation = function () {
    var label = document.createElement('label'),
        changeDiv = document.createElement('div'),
        input = document.createElement('input'),
        btn = document.createElement('button'),
        bodyTag = document.getElementsByTagName('body')[0],
        manualData;

    changeDiv.className = 'change-wrapper';
    input.type = 'text';
    input.id = 'location';
    label.htmlFor = 'location';
    label.innerText = 'Set location';
    label.className = 'change-location';
    btn.innerText = 'Enter';
    input.placeholder = 'eg London';
    bodyTag.appendChild(changeDiv);
    changeDiv.appendChild(label);
    changeDiv.appendChild(input);
    changeDiv.appendChild(btn);

    btn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log(input.value);
            console.log(input.value.length)
        if (input.value.length) {
            manualData = { "formatted_address" : input.value }
            localStorage.setItem('location', JSON.stringify(manualData));
            Tab.getWoeid(input.value.replace(/ /g, '%20'));
        }
    });
};

Tab.getWoeid = function (place) {
    "use strict";
    var request, data;
    // get the WOEID needed for yahoo weather lookups

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
};

// store current version and update all settings on new release
Tab.versionUpdate = function () {
    var version = '0.1.4';
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
};

Tab.init();
