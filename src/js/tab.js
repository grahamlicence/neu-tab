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
        place = document.createElement('div');
    console.log(loc);
    place.className = 'current-location';
    document.getElementsByTagName('body')[0].insertBefore(place);
    place.innerHTML = loc.address_components[1].long_name + ', ' + loc.address_components[2].long_name;

    //http://weather.yahooapis.com/forecastrss?w=20089556&u=c
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
                //http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20geo.places%20where%20text%3D%22Canary%20Wharf%20London%22&format=xml
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
    }
};

Tab.init = function  () {
    Tab.showTime();
    Tab.getLocation();
};

Tab.init();