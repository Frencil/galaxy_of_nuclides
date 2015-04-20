"use strict";

function Time (base, exponent) {

    this.min_exponent = -24;
    this.max_exponent = 39;
  
    this.base     = base;
    this.exponent = exponent;

    this.metric_exponent = function(){ return 3 * Math.floor( (this.exponent-(this.exponent > 0 ? 0 : 2)) / 3 ); };
    this.base_exponent   = function(){ return this.exponent - this.metric_exponent(); };

    this.prefixes = {
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

    this.analolgies = {
        '-24': [ "a quadrillionth of a billionth of a second",
                 "",
                 "" ],
        '-21': [ "a trillionth of a billionth of a second",
                 "cycle time of gamma rays",
                 "cycle time of x-rays" ],
        '-18': [ "a billionth of a billionth of a second",
                 "shortest time interval ever directly measured",
                 "shortest pulses of laser light ever created" ],
        '-15': [ "a quadrillionth of a second",
                 "cycle time for ultraviolet light",
                 "the fastest chemical reactions in nature" ],
        '-12': [ "a trillionth of a second",
                 "",
                 "" ],
        '-9':  [ "one cycle on a 1GHz CPU",
                 "about how long it takes light to travel ten feet",
                 "time of fusion reaction in a hydrogen bomb" ],
        '-6':  [ "about how long it takes light to travel 1000ft",
                 "about how long it takes lightning to travel 200ft",
                 "speed of the fastest fungal spores" ],
        '-3':  [ "a housefly's wing flap",
                 "a hummingbird's wing flap",
                 "the blink of a human eye" ],
        '0':   [ "",
                 "",
                 "a minute and a half" ],
        '3':   [ "17 minutes",
                 "3 hours",
                 "27 hours" ],
        '6':   [ "11.5 days",
                 "4 months",
                 "3 years" ],
        '9':   [ "32 years",
                 "320 years",
                 "3,200 years" ],
        '12':  [ "32,000 years",
                 "320,000 years",
                 "3.2 million years" ],
        '15':  [ "32 million years",
                 "320 million years",
                 "3.2 billion years" ],
        '18':  [ "32 billion years",
                 "320 billion years",
                 "3.2 trillion years" ],
        '21':  [ "32 trillion years",
                 "320 trillion years",
                 "3.2 quadrillion years" ],
        '24':  [ "32 quadrillion years",
                 "320 quadrillion years",
                 "3.2 quintillion years" ],
        '27':  [ "32 quintillion years",
                 "320 quintillion years",
                 "3.2 sextillion years" ],
        '30':  [ "32 sextillion years",
                 "320 sextillion years",
                 "3.2 septillion years" ],
        '33':  [ "32 septillion years",
                 "320 septillion years",
                 "3.2 octillion years" ],
        '36':  [ "32 octillion years",
                 "320 octillion years",
                 "3.2 nonillion years" ]
    };

    // Generic method for getting the unicode exponent character for a given exponential value
    // Unicode chars are perferred to formatting since display tends to be in SVG text (hard to do superscripting gracefully)
    this.unicodeExponent = function(exponent){
        var result = '';
        if (exponent < 0){ result += '⁻'; }
        var supers = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
        var e = Math.abs(exponent).toString();
        for (var d in e){ result += supers[parseInt(e[d])]; }
        return result;
    }

    // Represent the value as a number of seconds in scientific notation
    this.repNumerical = function() {
        var rep = "Infinity (Stable)";
        if (!(this.exponent == 0 && this.base == 0)){
            if (this.exponent > -4 && this.exponent < 4){
                var base_string = (this.base * Math.pow(10, this.exponent)).toString();
                if (base_string.length > 6){ base_string = base_string.slice(0,6); }
                rep = base_string + " seconds";
            } else {
                var base_string = (Math.round(this.base * 1000)/1000).toString();
                rep = base_string + " x 10" + this.unicodeExponent(this.exponent) + " seconds";
            }
        }
        return rep;
    };

    // Represent the value as an approximation of arbitrary scale (but still using discrete units of time like minutes or years)
    this.repApproximate = function() {
        // wip
    };

    // Represent the value as an analogy to a thing in the world that takes about as long
    this.repAnalogy = function() {
        var rep = "";
        if (typeof this.analogies[this.metric_exponent()] !== undefined){
            if (typeof this.analogies[this.metric_exponent()][this.base_exponent()] !== undefined){
                rep = this.analogies[this.metric_exponent()][this.base_exponent()];
            }
        }
        return rep;
    };

}