var Tab = {};

Tab.showTime = function () {
    "use strict";
    var elem = document.createElement('div');
    var updateClock = function() {
        // Gets the current time
        var now = new Date();

        // Get the hours, minutes and seconds from the current time
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var seconds = now.getSeconds();

        // Format hours, minutes and seconds
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
    setInterval(updateClock, 200);
};

Tab.init = function  () {
    Tab.showTime();
};

Tab.init();