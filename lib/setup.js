matter = new Object();

function loadElements(callback) {
    matter.min_halflife_exp = 0;
    matter.max_halflife_exp = 0;
    matter.max_neutron_spread    = 0;
    matter.absolute_max_neutrons = 0;
    matter.max_nuclides_per_element = 0;
    d3.csv("data/elements.csv", function(d) {
        return new Element(d.protons, d.period, d.group, d.symbol, d.name);
    }, function(error, rows) {
        console.log(rows);
        if (!error){
            matter.elements = rows;
            callback();
        }
    });
}


// Parse nuclides.csv and define all nuclides
function parseNuclides(elements) {
    
    jQuery.get('data/nuclides.csv', function(data) {
        nuclides_csv_parsed = $.csv.toArrays(data);
        for (var i = 0; i < nuclides_csv_parsed.length; i++) {
            var nuclides_csv_line = nuclides_csv_parsed[i];
            var protons  = parseInt(nuclides_csv_line[2]);
            // If there's no element defined for this number of protons then continue gracefully
            if (undefined == window.matter.elements[protons]){ continue; }
            var neutrons = parseInt(nuclides_csv_line[3]);
            var halflife_raw = nuclides_csv_line[4];
            var halflife_base = 0;
            var halflife_exp  = 0;
            if (halflife_raw != "infinity"){
                var halflife_breakdown = halflife_raw.toString().match("(\\d(.?)+)E((-?)\\d+)");
                if (halflife_breakdown != null){
                    halflife_base = parseFloat(halflife_breakdown[1]);
                    halflife_exp  = parseInt(halflife_breakdown[3]);
                } else {
                    halflife_base = parseFloat(halflife_raw);
                    halflife_exp  = 0;
                }
                // Normalize half life to one digit left of the decimal place for the base
                var difference_magnitude = Math.floor(Math.log(halflife_base) / Math.log(10));
                if (difference_magnitude != 0){
                    halflife_base /= Math.pow(10, difference_magnitude);
                    halflife_exp  += difference_magnitude;
                }
                if (halflife_exp > window.matter.max_halflife_exp) { window.matter.max_halflife_exp = halflife_exp; }
                if (halflife_exp < window.matter.min_halflife_exp) { window.matter.min_halflife_exp = halflife_exp; }
            }
            var nuclide = new Nuclide(protons,neutrons,halflife_base,halflife_exp);
            window.matter.elements[protons].addNuclide(nuclide);
        }
    });
    
}
