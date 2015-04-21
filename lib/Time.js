"use strict";

function Time (base, exponent) {

    this.min_exponent = -24;
    this.max_exponent = 39;
  
    this.base     = base;
    this.exponent = exponent;

    this.exponent_group = function(){
        if (this.exponent < 0){
            return 3 * Math.ceil( (this.exponent - 2) / 3 );
        } else if (this.exponent > 0){
            return 3 * Math.floor( this.exponent / 3 );
        } else {
            return 0;
        }
    };
    this.exponent_subgroup = function(){
        return this.exponent - this.exponent_group();
    };

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

    this.analogies = {
        '-24': [ "a quadrillionth of a billionth of a second",
                 "",
                 "" ],
        '-21': [ "a trillionth of a billionth of a second",
                 "the cycle time of gamma rays",
                 "the cycle time of x-rays" ],
        '-18': [ "a billionth of a billionth of a second",
                 "shortest time interval ever directly measured",
                 "shortest pulses of laser light ever created" ],
        '-15': [ "a quadrillionth of a second",
                 "the cycle time for ultraviolet light",
                 "as long as the fastest chemical reactions in[br]nature" ],
        '-12': [ "a trillionth of a second",
                 "",
                 "" ],
        '-9':  [ "a billionth of a second, or one cycle[br]on a 1GHz CPU",
                 "about how long it takes light to travel ten feet",
                 "about the time of the fusion reaction in a[br]hydrogen bomb" ],
        '-6':  [ "about how long it takes light to travel 1000ft",
                 "about how long it takes a bolt of lightning to[br]travel 200ft",
                 "about the time for the fastest fungal spore[br]launch" ],
        '-3':  [ "about the time of a housefly's wing flap",
                 "a hummingbird's wing flap",
                 "the blink of a human eye" ],
        '0':   [ "",
                 "",
                 "about a minute and a half" ],
        '3':   [ "about 17 minutes",
                 "about 3 hours",
                 "about 27 hours" ],
        '6':   [ "about 11.5 days",
                 "about 4 months",
                 "about 3 years" ],
        '9':   [ "about 32 years",
                 "about 320 years",
                 "about 3,200 years" ],
        '12':  [ "about 32,000 years",
                 "about 320,000 years",
                 "about 3.2 million years" ],
        '15':  [ "about 32 million years",
                 "about 320 million years",
                 "about 3.2 billion years" ],
        '18':  [ "about 32 billion years",
                 "about 320 billion years",
                 "about 3.2 trillion years" ],
        '21':  [ "about 32 trillion years",
                 "about 320 trillion years",
                 "about 3.2 quadrillion years" ],
        '24':  [ "about 32 quadrillion years",
                 "about 320 quadrillion years",
                 "about 3.2 quintillion years" ],
        '27':  [ "about 32 quintillion years",
                 "about 320 quintillion years",
                 "about 3.2 sextillion years" ],
        '30':  [ "about 32 sextillion years",
                 "about 320 sextillion years",
                 "about 3.2 septillion years" ],
        '33':  [ "about 32 septillion years",
                 "about 320 septillion years",
                 "about 3.2 octillion years" ],
        '36':  [ "about 32 octillion years",
                 "about 320 octillion years",
                 "about 3.2 nonillion years" ]
    };

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
                rep = base_string + " x 10[sup]" + this.exponent + "[sup] seconds";
            }
        }
        return rep;
    };

    // Represent the value as a number of seconds with an SI prefix
    this.repPrefixed = function() {
        var rep = "";
        if (  !(this.exponent == 0 && this.base == 0)
            && (this.exponent < -3 || this.exponent > 3)
            && (typeof this.prefixes[this.exponent_group()] != "undefined") ){
            var base = Math.round(this.base * Math.pow(10, this.exponent_subgroup()));
            var plural = (base == 1 ? "" : "s");
            rep = base.toString() + " " + this.prefixes[this.exponent_group()] + "second" + plural;
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
        if (typeof this.analogies[this.exponent_group()] != "undefined"){
            if (typeof this.analogies[this.exponent_group()][this.exponent_subgroup()] != "undefined"){
                rep = this.analogies[this.exponent_group()][this.exponent_subgroup()];
            }
        }
        return rep;
    };

}