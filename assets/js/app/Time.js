"use strict";

function Time (base, exponent) {

    this.min_exponent = -24;
    this.max_exponent = 39;
  
    this.base = base;
    this.exponent = exponent;

    // Gracefully force exponent to be an integer value
    if (Math.floor(this.exponent) != this.exponent){
        var diff = this.exponent - Math.floor(this.exponent);
        this.exponent = Math.floor(this.exponent);
        this.base += Math.pow(10, diff);
        if (this.base > 10){
            this.base -= 10;
            this.exponent++;
        }
    }

};

Time.prototype.exponent_group = function(){
    if (this.exponent < 0){
        return 3 * Math.ceil( (this.exponent - 2) / 3 );
    } else if (this.exponent > 0){
        return 3 * Math.floor( this.exponent / 3 );
    } else {
        return 0;
    }
};

Time.prototype.exponent_subgroup = function(){
    return this.exponent - this.exponent_group();
};

Time.prototype._prefixes = {
    '-24': "yocto",
    '-21': "zepto",
    '-18': "atto",
    '-15': "femto",
    '-12': "pico",
    '-9':  "nano",
    '-6':  "micro",
    '-3':  "milli",
    '0':   "",
    '3':   "Kilo",
    '6':   "Mega",
    '9':   "Giga",
    '12':  "Tera",
    '15':  "Peta",
    '18':  "Exa",
    '21':  "Zetta",
    '24':  "Yotta",
    // NOTE: SI prefixes end at 24. To proceed we use Jim Blower's proposed extended system
    // Details: http://jimvb.home.mindspring.com/unitsystem.htm
    '27':  "Xona",
    '30':  "Weka",
    '33':  "Vunda",
    '36':  "Uda"
};

Time.prototype._analogies = {
    '-24': [ "{1} quadrillionths of a billionth of[br]a second",
             "{10} quadrillionths of a billionth of[br]a second",
             "{100} quadrillionths of a billionth[br]of a second" ],
    '-21': [ "{1} trillionths of a billionth of a second",
             "{10} trillionths of a billionth of a second",
             "{100} trillionths of a billionth of a second" ],
    '-18': [ "{1} billionth of a billionth of a second",
             "{10} billionths of a billionth of a second,[br]or {1} times the shortest time interval ever[br]directly measured by humans.",
             "{100} billionths of a billionth of a second,[br]or {1} times the speed of the shortest[br]pulses of laser light ever created." ],
    '-15': [ "{1} quadrillionths of a second",
             "{10} quadrillionths of a second, or {1} times[br]the cycle time for UV light, a form of light[br]that's just energic enough to be invisible[br]to human eyes.",
             "{100} quadrillionths of a second, or [br]about as fast as the fastest chemical[br]reactions in nature" ],
    '-12': [ "{1} trillionths of a second",
             "{10} trillionths of a second",
             "{100} trillionths of a second" ],
    '-9':  [ "{1} billionths of a second, or {1} cycles on a[br]1GHz CPU",
             "{10} billionths of a second, or about how[br]long it takes light to travel {10} feet",
             "{100} billionths of a second, or about[br]as fast as the fusion reaction in[br]a hydrogen bomb" ],
    '-6':  [ "{1} millionths of a second, or about how[br]long it takes light to travel {1000} feet",
             "{10} millionths of a second, or about how[br]long it takes a bolt of lightning to[br]travel {200} feet",
             "{100} millionths of a second, or about[br]as fast as the fastest fungal spore[br]launch" ],
    '-3':  [ "{1} thousandths of a second, or about as[br]fast as {1} wing flaps of  a housefly",
             "{1} hundredths of a second, or about as[br]fast as {1} wing flaps of a humminbird",
             "{1} tenths of a second, or about as fast[br]as {1} blinks of a human eye" ],
    '0':   [ "",
             "",
             "" ],
    '3':   [ "",
             "",
             "" ],
    '6':   [ "",
             "",
             "" ],
    '9':   [ "",
             "",
             "About {3,200} years, or {1} times how long[br]ago the Trojan War happened in ancient[br]Greece" ],
    '12':  [ "About {32,000} years, or {1} times how long[br]ago the bow and arrow was invented",
             "About {320,000} years, or {1} times how long[br]ago early pre-humans first began to[br]control fire",
             "About {3.2} million years or {2} times as far[br]back in time as when the first stone tools[br]were made by early pre-humans" ],
    '15':  [ "About {32} million years or {1} times how[br]long ago Antarctica, after breaking away[br]from the other continents, first developed[br]its ice cap",
             "About {320} million years or {1} times how[br]long ago the first reptiles evolved from[br]amphibians",
             "About {3.2} billion years or {1} times how[br]long ago life is thought to have first begun[br]on Earth, which is 4.3 billion years old" ],
    '18':  [ "About {32} billion years or more than {2}[br]times the current age of the universe, which[br]is 13.8 billion years old",
             "About {320} billion years or more than {20}[br]times the current age of the universe",
             "About {3.2} trillion years or more than {200}[br]times the current age of the universe" ],
    '21':  [ "About {32} trillion years or {1} years for[br]every cell in your body",
             "About {320} trillion years or {1} years for[br]every dollar in the U.S. if the every single[br]person in the country had a million dollars",
             "About {3.2} quadrillion years or {1} years[br]for every cell in an elphant's body" ],
    '24':  [ "About {32} quadrillion years or {1} years[br]for every meter between here and the[br]closest star, Proxima Centauri[br](4.2 light years away)",
             "About {320} quadrillion years or (roughly)[br]{1} years for every word in every email[br]ever sent since the invention of email,[br]including spam",
             "About {3.2} quintillion years" ],
    '27':  [ "About {32} quintillion years or {32}[br]billion billion years",
             "About {320} quintillion years or {1} years[br]for every meter between here and the[br]center of the Milky Way Galaxy",
             "About {3.2} sextillion years or {1} years[br]for every molecule of H[sub]2[sub]O in a drop of[br]ordinary water" ],
    '30':  [ "About {32} sextillion years or {1} years[br]for every star in every galaxy the entire[br]observable universe",
             "About {320} sextillion years",
             "About {3.2} septillion years" ],
    '33':  [ "About {32} septillion years",
             "About {320} septillion years",
             "About {3.2} octillion years" ],
    '36':  [ "About {32} octillion years",
             "About {320} octillion years",
             "About {3.2} nonillion years" ]
};

// Represent the value as a number of seconds in scientific notation
Time.prototype.repNumerical = function() {
    var rep = "Infinity (Stable)";
    if (!(this.exponent == 0 && this.base == 0)){
        if (this.exponent > -4 && this.exponent < 4){
            var base_string = (this.base * Math.pow(10, this.exponent)).toString();
            if (base_string.length > 6){ base_string = base_string.slice(0,6); }
            rep = base_string + " seconds";
        } else {
            var base_string = (Math.round(this.base * 1000)/1000).toString();
            rep = base_string + " x 10[sup]" + this.exponent + "[sup] seconds";
        }
    }
    return rep;
};

// Represent the value as a number of seconds with an SI prefix
Time.prototype.repPrefixed = function() {
    var rep = "";
    if (  !(this.exponent == 0 && this.base == 0)
          && (this.exponent < -3 || this.exponent > 3)
          && (typeof this._prefixes[this.exponent_group()] != "undefined") ){
        var base = Math.round(this.base * Math.pow(10, this.exponent_subgroup()));
        var plural = (base == 1 ? "" : "s");
        rep = base.toString() + " " + this._prefixes[this.exponent_group()] + "second" + plural;
    }
    return rep;
};

// Represent the value as an approximation of arbitrary scale (but still using discrete units of time like minutes or years)
// Only designed to work for values of 1 second or greater. Smaller values default to repNumerical().
Time.prototype.repApproximate = function() {
    if (this.exponent < 0 || (this.exponent == 0 && this.base == 0)){ return this.repNumerical(); }
    var thresholds = [ [ 1, "seconds" ],
                       [ 60, "minutes" ],
                       [ 3600, "hours" ],
                       [ 86400, "days" ],
                       [ 604800, "weeks" ],
                       [ 2592000, "months" ],
                       [ 31536000, "years" ]
                     ];
    var units = "seconds", multiplier = 1;
    for (var t in thresholds){
        if ((this.base * Math.pow(10, this.exponent)) >= thresholds[t][0]){
            units = thresholds[t][1];
            multiplier = 1 / thresholds[t][0];
        }
    }
    var value = (this.base * Math.pow(10, this.exponent)) * multiplier;
    return this.format(value) + " " + units;
};

// Represent the value as an analogy to a thing in the world that takes about as long
Time.prototype.repAnalogy = function() {
    var rep = "";
    if (typeof this._analogies[this.exponent_group()] != "undefined"){
        if (typeof this._analogies[this.exponent_group()][this.exponent_subgroup()] != "undefined"){
            rep = this._analogies[this.exponent_group()][this.exponent_subgroup()];
        }
    }
    if (rep.length == 0){
        rep = "About " + this.repApproximate();
    } else if (rep.indexOf("{") != -1){
        var values = rep.match(/\{[0-9.,]+\}/g);
        for (var v in values){
            var num = parseFloat(values[v].slice(1,-1).replace(",",""));
            if (isNaN(num)){ continue; }
            rep = rep.replace(values[v], this.format(num * this.base));
        }
    }
    return rep;
};

Time.prototype.format = function(value){
    if (value < 10){
        return (Math.round(value * 10) / 10).toString();
    } else if (value > 1000) {
        return Math.floor(value / 1000).toString() + "," + Math.round(value - (Math.floor(value / 1000)*1000) + 1000).toString().slice(1);
    } else {
        return Math.round(value).toString();
    }
}