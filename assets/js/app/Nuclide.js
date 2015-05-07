"use strict";

var Nuclide = function(){
    this.index = null;
    this.protons = null;
    this.neutrons = null;
    this.halflife = null;
    this.isStable = null;
    this.parentElement = null;
};

Nuclide.prototype.setProtons = function(value){
    this.protons = parseInt(value);
    return this;
}

Nuclide.prototype.setNeutrons = function(value){
    this.neutrons = parseInt(value);
    return this;
}

Nuclide.prototype.setHalflife = function(value){
    var halflife_base = 0;
    var halflife_exp  = 0;
    if (value != "infinity"){
        this.isStable = false;
        var halflife_breakdown = value.toString().match("(\\d(.?)+)E((-?)\\d+)");
        if (halflife_breakdown != null){
            halflife_base = parseFloat(halflife_breakdown[1]);
            halflife_exp  = parseInt(halflife_breakdown[3]);
        } else {
            halflife_base = parseFloat(value);
            halflife_exp  = 0;
        }
        // Normalize half life to one digit left of the decimal place for the base
        var difference_magnitude = Math.floor(Math.log(halflife_base) / Math.log(10));
        if (difference_magnitude != 0){
            halflife_base /= Math.pow(10, difference_magnitude);
            halflife_exp  += difference_magnitude;
        }
        if (halflife_exp > matter.max_halflife_exp) { matter.max_halflife_exp = halflife_exp; }
        if (halflife_exp < matter.min_halflife_exp) { matter.min_halflife_exp = halflife_exp; }
    } else {
        this.isStable = true;
    }
    this.halflife = new Time(halflife_base, halflife_exp);
    return this;
}
