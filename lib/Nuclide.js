function Nuclide (protons, neutrons, halflife){

    this.protons  = parseInt(protons);
    this.neutrons = parseInt(neutrons);

    this.index = null;

    // generate a unique identifier
    this.id = "element_" + this.protons + "_nuclide_" + this.neutrons;

    var halflife_base = 0;
    var halflife_exp  = 0;
    if (halflife != "infinity"){
        var halflife_breakdown = halflife.toString().match("(\\d(.?)+)E((-?)\\d+)");
        if (halflife_breakdown != null){
            halflife_base = parseFloat(halflife_breakdown[1]);
            halflife_exp  = parseInt(halflife_breakdown[3]);
        } else {
            halflife_base = parseFloat(halflife);
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
    }

    this.halflife = new Time(halflife_base, halflife_exp);
    
    this.parentElement = null;
    
    this.isStable = false;
    if (this.halflife.base == this.halflife.exponent && this.halflife.base == 0){
        this.isStable = true;
    }

}
