var Tab = {};

Tab.showTime = function () {
    "use strict";
    var elem = document.createElement('div');
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
        elem.innerHTML = hours + ':' + minutes + ':' + seconds;
    };
    elem.className = 'current-time';
    document.getElementsByTagName('body')[0].insertBefore(elem);
    setInterval(updateClock, 500);
};

Tab.locationData = function () {
    var loc = JSON.parse(localStorage.getItem('location')),
        woeid = localStorage.getItem('woeid'),
        place = document.createElement('div'),
        weather = document.createElement('div');
    console.log(loc);

    function locationName () {
        place.className = 'current-location';
        document.getElementsByTagName('body')[0].insertBefore(place);
        place.innerHTML = loc.address_components[1].long_name + ', ' + loc.address_components[2].long_name;
    }

    function weatherForecast () {
        var reqW;
        weather.className = 'weather-forecast';
        document.getElementsByTagName('body')[0].insertBefore(weather);

        reqW = new XMLHttpRequest;

        var hasC = '%20AND%20u%3D\'c\''; 
        
        reqW.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D' + 20089556 + hasC + '&format=json&diagnostics=true&callback=', true);

        reqW.onload = function() {
          if (reqW.status >= 200 && reqW.status < 400) {
            // console.log(reqW.responseText)
            // return;
            data = JSON.parse(reqW.responseText);
            var results = data.query.results.channel;
            console.log(data)
            var html = '<p>Sunset: ' + results.astronomy.sunset + '</p>';

            weather.innerHTML = html;
          } else {
            // error
            console.log('error status')
          }
        };

        reqW.onerror = function() {
            console.log('error')
          // There was a connection error of some sort
        };

        reqW.send();
            
    }

    locationName();
    weatherForecast();

};

Tab.getLocation = function () {
    if ('geolocation' in navigator === false) {
        return;
    }
    if (localStorage.getItem('location')) {
        Tab.locationData();
        return;
    } else {
        navigator.geolocation.getCurrentPosition(function(position) {
            // do_something(position.coords.latitude, position.coords.longitude);

            request = new XMLHttpRequest;
            request.open('GET', 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + position.coords.latitude + ',' + position.coords.longitude + '&sensor=true', true);


            request.onload = function() {
              if (request.status >= 200 && request.status < 400){
                // Success!
                data = JSON.parse(request.responseText);
                console.log(data)
                var town = _.find(data.results, function (ac) { return ac.types[0] == 'postal_code' });
                localStorage.setItem('location', JSON.stringify(town));
                // get WOEID
                //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22Canary%20Wharf%20London%22&format=json
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

            // just use yahoo??
            //http://where.yahooapis.com/geocode?location=37.42,-122.12&flags=J&gflags=R&appid=zHgnBS4m
        });
    }
};

Tab.init = function  () {
    Tab.showTime();
    Tab.getLocation();
};

Tab.init();

Tab.getWoeid = function (place) {
    var request;
    navigator.geolocation.getCurrentPosition(function(position) {

        request = new XMLHttpRequest;
                    //
        // request.open('GET', 'http://where.yahooapis.com/geocode?location=' + position.coords.latitude + ',' + position.coords.longitude + '&flags=J&gflags=R&appid=zHgnBS4m', true);
        request.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22' + place + '%22&format=json', true);


        request.onload = function() {
          if (request.status >= 200 && request.status < 400){
            // Success!
            data = JSON.parse(request.responseText);
            console.log(data.query.results.place[0].woeid)
            // var town = _.find(data.results, function (ac) { return ac.types[0] == 'postal_code' });
            // localStorage.setItem('location', JSON.stringify(town));
            // get WOEID
            //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22Canary%20Wharf%20London%22&format=xml
            // Tab.locationData();
            localStorage.setItem('woeid', data.query.results.place[0].woeid);
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

// this is prolly fine in chrome
 function weatherForecast () {
        var reqW;

        reqW = new XMLHttpRequest;
                    //

        // reqW.open('GET', 'http://weather.yahooapis.com/forecastrss?w=' + 20089556 + '&u=c', true);
        var hasC = '%20AND%20u%3D\'c\''
        
        reqW.open('GET', 'http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%3D' + 20089556 + hasC + '&format=json&diagnostics=true&callback=', true);


        reqW.onload = function() {
          if (reqW.status >= 200 && reqW.status < 400) {
            // console.log(reqW.responseText)
            // return;
            data = JSON.parse(reqW.responseText);
            console.log(data)

          } else {
            // error
            console.log('error status')
          }
        };

        reqW.onerror = function() {
            console.log('error')
          // There was a connection error of some sort
        };

        reqW.send();
            
    }

    // weatherForecast();