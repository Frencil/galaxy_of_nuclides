function loadElements() {
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
    console.log("done parsing elements");
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
            if (undefined == $('#galaxy').data("elements")[protons]){ continue; }
            var neutrons = parseInt(nuclides_csv_line[3]);
            var halflife_raw = parseInt(nuclides_csv_line[4]);
            var halflife = null;
            if (halflife_raw == "infinity"){
                halflife = new Time(0,0);
            } else {
                var matches = halflife_raw.toString().match("(\\d(.?)+)E((-?)\\d+)");
                if (matches != null){
                    halflife = new Time(parseFloat(halflife_breakdown[1]), parseInt(halflife_breakdown[3]));
                } else {
                    halflife = new Time(parseFloat(halflife_raw), 0);
                }
                // Normalize half life to one digit left of the decimal place for the base
                /*
                  int difference_magnitude = floor(log(halflife_base) / log(10));
                  if (difference_magnitude != 0){
                  halflife_base /= pow(10, difference_magnitude);
                  halflife_exp  += difference_magnitude;
                  }
                  if (halflife_exp > max_halflife_exp) { max_halflife_exp = halflife_exp; }
                  if (halflife_exp < min_halflife_exp) { min_halflife_exp = halflife_exp; }
                */
            }
            var nuclide = new Nuclide(protons,neutrons,halflife.base,halflife.exponent);
            window.elements[protons].addNuclide(nuclide);
        }
    });

    console.log(window.elements);
    
}

/*
  String nuc_lines[] = loadStrings(path);
  
  int max_exp = 0;
  int min_exp = 0;
  
  for (int i=0; i < nuc_lines.length; i++) {
    if (!nuc_halflife.equals("infinity")){
      String[] halflife_breakdown = match(nuc_halflife, "(\\d(.?)+)E((-?)\\d+)");
      if (halflife_breakdown != null){
        halflife_base = PApplet.parseFloat(halflife_breakdown[1]);
        halflife_exp  = PApplet.parseInt(halflife_breakdown[3]);
      } else {
        halflife_base = PApplet.parseFloat(nuc_halflife);
        halflife_exp  = 0;
      }
      // Normalize half life to one digit left of the decimal place for the base
      int difference_magnitude = floor(log(halflife_base) / log(10));
      if (difference_magnitude != 0){
        halflife_base /= pow(10, difference_magnitude);
        halflife_exp  += difference_magnitude;
      }
      if (halflife_exp > max_halflife_exp) { max_halflife_exp = halflife_exp; }
      if (halflife_exp < min_halflife_exp) { min_halflife_exp = halflife_exp; }
    } else {
      //println(protons+","+neutrons);
    }
    elements[protons].addNuclide(neutrons, halflife_base, halflife_exp);
  }
  
}
*/