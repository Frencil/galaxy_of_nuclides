"use strict";

function Time (base, exponent) {
  
    this.base     = base;
    this.exponent = exponent;
 
    this.humanReadable = function(include_comparison) {
    
        var metric_exponent = 0;
        var base_exponent   = 0;
        metric_exponent = 3 * Math.floor( (this.exponent-(this.exponent > 0 ? 0 : 2)) / 3 );
        base_exponent   = this.exponent - metric_exponent;
        
        var prefix     = "";
        var comparison = "";
        switch (metric_exponent){
        case -24:
            prefix = "yocto";
            switch (base_exponent){
            case 0: comparison = "a quadrillionth of a billionth of a second"; break;
            case 1: comparison = ""; break;
            case 2: comparison = ""; break; }
            break;
        case -21:
            prefix = "zepto";
            switch (base_exponent){
            case 0: comparison = "a trillionth of a billionth of a second"; break;
            case 1: comparison = "cycle time of gamma rays"; break;
            case 2: comparison = "cycle time of x-rays"; break; }
            break;
        case -18:
            prefix = "atto";
            switch (base_exponent){
            case 0: comparison = "a billionth of a billionth of a second"; break;
            case 1: comparison = "shortest time interval ever directly measured"; break;
            case 2: comparison = "shortest pulses of laser light ever created"; break; }
            break;
        case -15:
            prefix = "femto";
            switch (base_exponent){
            case 0: comparison = "a quadrillionth of a second"; break;
            case 1: comparison = "cycle time for ultraviolet light"; break;
            case 2: comparison = "the fastest chemical reactions in nature"; break; }
            break;
        case -12:
            prefix = "pico";
            switch (base_exponent){
            case 0: comparison = "a trillionth of a second"; break;
            case 1: comparison = ""; break;
            case 2: comparison = ""; break; }
            break;
        case -9:
            prefix = "nano";
            switch (base_exponent){
            case 0: comparison = "one cycle on a 1GHz CPU"; break;
            case 1: comparison = "about how long it takes light to travel ten feet"; break;
            case 2: comparison = "time of fusion reaction in a hydrogen bomb"; break; }
            break;
        case -6:
            prefix = "micro";
            switch (base_exponent){
            case 0: comparison = "about how long it takes light to travel 1000ft"; break;
            case 1: comparison = "about how long it takes lightning to travel 200ft"; break;
            case 2: comparison = "speed of the fastest fungal spores"; break; }
            break;
        case -3:
            prefix = "milli";
            switch (base_exponent){
            case 0: comparison = "a housefly's wing flap"; break;
            case 1: comparison = "a hummingbird's wing flap"; break;
            case 2: comparison = "the blink of an eye"; break; }
            break;
        case 0:
            switch (base_exponent){
            case 0: comparison = ""; break;
            case 1: comparison = ""; break;
            case 2: comparison = "about a minute and a half"; break; }
            break;
        case 3:
            prefix = "Kilo";
            switch (base_exponent){
            case 0: comparison = "about 17 minutes"; break;
            case 1: comparison = "about 3 hours"; break;
            case 2: comparison = "about 27 hours"; break; }
            break;
        case 6:
            prefix = "Mega";
            switch (base_exponent){
            case 0: comparison = "about 11.5 days"; break;
            case 1: comparison = "about 4 months"; break;
            case 2: comparison = "about 3 years"; break; }
            break;
        case 9:
            prefix = "Giga";
            switch (base_exponent){
            case 0: comparison = "about 32 years"; break;
            case 1: comparison = "about 320 years"; break;
            case 2: comparison = "about 3,200 years"; break; }
            break;
        case 12:
            prefix = "Tera";
            switch (base_exponent){
            case 0: comparison = "about 32,000 years"; break;
            case 1: comparison = "about 320,000 years"; break;
            case 2: comparison = "about 3.2 million years"; break; }
            break;
        case 15:
            prefix = "Peta";
            switch (base_exponent){
            case 0: comparison = "about 32 million years"; break;
            case 1: comparison = "about 320 million years"; break;
            case 2: comparison = "about 3.2 billion years"; break; }
            break;
        case 18:
            prefix = "Exa";
            switch (base_exponent){
            case 0: comparison = "about 32 billion years"; break;
            case 1: comparison = "about 320 billion years"; break;
            case 2: comparison = "about 3.2 trillion years"; break; }
            break;
        case 21:
            prefix = "Zetta";
            switch (base_exponent){
            case 0: comparison = "about 32 trillion years"; break;
            case 1: comparison = "about 320 trillion years"; break;
            case 2: comparison = "about 3.2 quadrillion years"; break; }
            break;
        case 24:
            prefix = "Yotta";
            switch (base_exponent){
            case 0: comparison = "about 32 quadrillion years"; break;
            case 1: comparison = "about 320 quadrillion years"; break;
            case 2: comparison = "about 3.2 quintillion years"; break; }
            break;
            // NOTE: SI prefixes end at 24. To proceed we use Jim Blower's proposed extended system
            // Details: http://jimvb.home.mindspring.com/unitsystem.htm
        case 27:
            prefix = "Xona";
            switch (base_exponent){
            case 0: comparison = "about 32 quintillion years"; break;
            case 1: comparison = "about 320 quintillion years"; break;
            case 2: comparison = "about 3.2 sextillion years"; break; }
            break;
        case 30:
            prefix = "Weka";
            switch (base_exponent){
            case 0: comparison = "about 32 sextillion years"; break;
            case 1: comparison = "about 320 sextillion years"; break;
            case 2: comparison = "about 3.2 septillion years"; break; }
            break;
        case 33:
            prefix = "Vunda";
            switch (base_exponent){
            case 0: comparison = "about 32 septillion years"; break;
            case 1: comparison = "about 320 septillion years"; break;
            case 2: comparison = "about 3.2 octillion years"; break; }
            break;
        case 36:
            prefix = "Uda";
            switch (base_exponent){
            case 0: comparison = "about 32 octillion years"; break;
            case 1: comparison = "about 320 octillion years"; break;
            case 2: comparison = "about 3.2 nonillion years"; break; }
            break;
        }
        
        var label = "";
        if (this.exponent <= -32){
            label = "Infinitesimally small";
        } else if (this.exponent >= 32 || (this.exponent == 0 && this.base == 0)){
            label = "Infinity (Stable)";
        } else {
            if (this.exponent > -4 && this.exponent < 4){
                var base_string = (this.base * Math.pow(10, this.exponent)).toString();
                if (base_string.length > 6){ base_string = base_string.slice(0,6); }
                label = base_string + " seconds";
            } else {
                var base_string = (Math.round(this.base * 1000)/1000).toString();
                label = this.base + " x 10" + this.unicodeExponent(this.exponent) + " seconds";
            }
            if (include_comparison){
                label += (comparison.length > 0 ? " ..." + comparison : "");
            }
        }
        
        return label;
        
    }
    
    this.unicodeExponent = function(exponent){
        var result = '';
        if (exponent < 0){ result += '⁻'; }
        var supers = ['⁰','ⁱ','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
        var e = Math.abs(exponent).toString();
        for (var d in e){ result += supers[parseInt(e[d])]; }
        return result;
    }
  
}