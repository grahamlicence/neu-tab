// create human readable day and month names
Date.prototype.getMonthName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names[this.getMonth()];
};

Date.prototype.getMonthNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].month_names_short[this.getMonth()];
};

Date.prototype.getDayName = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names[this.getDay()];
};

Date.prototype.getDayNameShort = function(lang) {
    lang = lang && (lang in Date.locale) ? lang : 'en';
    return Date.locale[lang].day_names_short[this.getDay()];
};

Date.locale = {
    en: {
       month_names: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
       month_names_short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
       day_names: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
       day_names_short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
};