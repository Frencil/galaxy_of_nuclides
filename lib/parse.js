function loadElements() {
    window.elements = new Object();
    window.elements.min_halflife_exp = 0;
    window.elements.max_halflife_exp = 0;
    $.get('data/elements.csv', function(data) {
        if (parseElements(data)){
            parseNuclides();
        };
    });
}

// Parse elements.csv and define all elements
function parseElements(data) {
    elements_csv_parsed = $.csv.toArrays(data);
    for (var i = 0; i < elements_csv_parsed.length; i++) {
        var element_csv_line = elements_csv_parsed[i];
        var protons = parseInt(element_csv_line[0]);
        if (protons >= 0){
            element = new Element(protons, parseInt(element_csv_line[3]), parseInt(element_csv_line[4]));
            element.symbol = element_csv_line[1];
            element.name   = element_csv_line[2];
            window.elements[protons] = element;
            //absolute_max_protons = max(ele_z, absolute_max_protons);
        }
    }
    return true;
}

// Parse nuclides.csv and define all nuclides
function parseNuclides(elements) {
    
    console.log("parsing nuclides...");
    
    jQuery.get('data/nuclides.csv', function(data) {
        nuclides_csv_parsed = $.csv.toArrays(data);
        for (var i = 0; i < nuclides_csv_parsed.length; i++) {
            var nuclides_csv_line = nuclides_csv_parsed[i];
            var protons  = parseInt(nuclides_csv_line[2]);
            // If there's no element defined for this number of protons then continue gracefully
            if (undefined == window.elements[protons]){ continue; }
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
                if (halflife_exp > window.elements.max_halflife_exp) { window.elements.max_halflife_exp = halflife_exp; }
                if (halflife_exp < window.elements.min_halflife_exp) { window.elements.min_halflife_exp = halflife_exp; }
            }
            var nuclide = new Nuclide(protons,neutrons,halflife_base,halflife_exp);
            window.elements[protons].addNuclide(nuclide);
        }
    });

    console.log(window.elements);
    
}
