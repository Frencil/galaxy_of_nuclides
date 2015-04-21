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
        '-24': [ "A quadrillionth of a billionth of[br]a second",
                 "Ten quadrillionths of a billionth of[br]a second",
                 "One hundred quadrillionths of a billionth[br]of a second" ],
        '-21': [ "A trillionth of a billionth of a second",
                 "Ten trillionths of a billionth of a second.[br]This is the cycle time of gamma rays,[br]the most energetic form of light.",
                 "One hundred trillionths of a billionth of a[br]second. This is the cycle time of x-rays,[br] a very energetic form of light." ],
        '-18': [ "A billionth of a billionth of a second",
                 "Ten billionths of a billionth of a second.[br]This is the shortest time interval ever[br]directly measured by humans.",
                 "One hundred billionths of a billionth of a[br]second. This is the speed of the shortest[br]pulses of laser light ever created." ],
        '-15': [ "A quadrillionth of a second",
                 "Ten quadrillionths of a second. This is the[br]cycle time for ultraviolet light, a form of light[br]that's just energic enough to be invisible[br]to human eyes.",
                 "One hundred quadrillionths of a second.[br]This is as fast as the fastest chemical[br]reactions in nature" ],
        '-12': [ "A trillionth of a second",
                 "Ten trillionths of a second",
                 "One hundred trillionths of a second" ],
        '-9':  [ "A billionth of a second, or one cycle on a[br]1GHz CPU",
                 "Ten billionths of a second, or about how[br]long it takes light to travel ten feet",
                 "One hundred billionths of a second, or[br]about as fast as the fusion reaction in[br]a hydrogen bomb" ],
        '-6':  [ "One millionth of a second, or about how[br]long it takes light to travel 1000ft",
                 "Ten millionths of a second, or about how[br]long it takes a bolt of lightning to[br]travel 200ft",
                 "One hundred millionths of a second, or[br]about as fast as the fastest fungal[br]spore launch" ],
        '-3':  [ "One thousandth of a second, or about as[br]fast as a housefly's wing flap",
                 "One hundredth of a second, or about as[br]fast as a hummingbird's wing flap",
                 "One tenth of a second, or about as fast[br]as the blink of a human eye" ],
        '0':   [ "",
                 "",
                 "About a minute and a half" ],
        '3':   [ "About 17 minutes",
                 "About 3 hours",
                 "About 27 hours" ],
        '6':   [ "About 11.5 days",
                 "About 4 months",
                 "About 3 years" ],
        '9':   [ "About 32 years",
                 "About 320 years",
                 "About 3,200 years" ],
        '12':  [ "About 32,000 years",
                 "About 320,000 years",
                 "About 3.2 million years" ],
        '15':  [ "About 32 million years",
                 "About 320 million years",
                 "About 3.2 billion years" ],
        '18':  [ "About 32 billion years",
                 "About 320 billion years",
                 "About 3.2 trillion years" ],
        '21':  [ "About 32 trillion years",
                 "About 320 trillion years",
                 "About 3.2 quadrillion years" ],
        '24':  [ "About 32 quadrillion years",
                 "About 320 quadrillion years",
                 "About 3.2 quintillion years" ],
        '27':  [ "About 32 quintillion years",
                 "About 320 quintillion years",
                 "About 3.2 sextillion years" ],
        '30':  [ "About 32 sextillion years",
                 "About 320 sextillion years",
                 "About 3.2 septillion years" ],
        '33':  [ "About 32 septillion years",
                 "About 320 septillion years",
                 "About 3.2 octillion years" ],
        '36':  [ "About 32 octillion years",
                 "About 320 octillion years",
                 "About 3.2 nonillion years" ]
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