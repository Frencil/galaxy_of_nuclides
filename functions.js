// Mouse event listener functions
function mouseUpListener(evt) {
    if (mouse.over.panel_id){
        panel = panels[mouse.over.panel_id];
        panel.click();
    }
}

function mouseMoveListener(evt) {
		var bounding_rect = canvas.getBoundingClientRect();
		mouse.current_x = (evt.clientX - bounding_rect.left)*(canvas.width/bounding_rect.width);
		mouse.current_y = (evt.clientY - bounding_rect.top)*(canvas.height/bounding_rect.height);	
		renderScreen();
}

// Primary render function
function renderScreen(){

		context.fillStyle = "#000000";
		context.fillRect(0,0,canvas.width,canvas.height);
    
    mouse.style = '';
    for (o in mouse.over){
        mouse.over[o] = null;
    }
        
    canvas.style.cursor = "";
    for (p in panels){
        panel = panels[p];
        panel.setCoords();
        if (panel.a > 0){
            panel.render();
        }
    }

    canvas.style.cursor = mouse.style;

}

// Convert a color object to an hsla() CSS directive
function hsla(color){
    return "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")";
}

// Function to map a value in one range to a corresponding value in anoth
function map_range(value, low1, high1, low2, high2) {
    if (high1 == low1){
        return low2;
    }
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

// Function to read a local CSV file's contents into a string
function loadCSV(filename){
    var rawText = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", 'data/'+filename, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                rawText = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    return rawText;
}

// Function to parse elements.csv into an array of element objects
function parseElements(){

    var elements_csv = loadCSV("elements.csv");
    var lines = elements_csv.split("\n");

    for (i = 0; i < lines.length; i++){

        if (!lines[i].length) continue;
        parts = lines[i].split(",");

        var element = { protons: parseInt(parts[0]),
                        symbol:  parts[1],
                        name:    parts[2],
                        period:  parseInt(parts[3]),
                        group:   parseInt(parts[4]),
                        nuclides: [],
                        min_neutrons: 99999,
                        max_neutrons: 0,
                        stablest_nuclide_idx: 0,
                        stablest_nuclide_is_stable: false,
                        base_color: { h: 0, s: 0, l: 0, a: 0 },
                        setBaseColor: function(){
                            var relative_nuclides = map_range(this.nuclides.length, limits.min_nuclides_per_element, limits.max_nuclides_per_element, 0, 1);
                            this.base_color = palette.getColor(relative_nuclides, 1);
                        }
                      };
        elements[element.protons] = element;

        // Update global data boundaries
        limits.absolute_max_protons = Math.max(limits.absolute_max_protons, element.protons);

    }
}

// Function to parse nuclides.csv into individual nuclide objects stored on each element's nuclides array
function parseNuclides(){

    var nuclides_csv = loadCSV("nuclides.csv");
    var lines = nuclides_csv.split("\n");

    for (i = 0; i < lines.length; i++){

        if (!lines[i].length) continue;
        parts = lines[i].split(",");
        var hl_raw = parts[4];
        var hlb = 0;
        var hle = 0;

        // Break half life values into a base and exponent
        if (hl_raw != "infinity"){
            var hl_match = hl_raw.match("(\\d(.?)+)E((-?)\\d+)");
            if (hl_match != null){
                hlb = parseFloat(hl_match[1]);
                hle = parseInt(hl_match[3]);
            } else {
                hlb = parseFloat(hl_raw);
            }
            var difference_magnitude = Math.floor(Math.log(hlb) / Math.log(10));
            if (difference_magnitude != 0){
                hlb /= Math.pow(10, difference_magnitude);
                hle += difference_magnitude;
            }
            hlb = +hlb.toFixed(4);
        }

        // Create the nuclide and add it to the element
        var protons = parseInt(parts[2]);
        nuclide = { nucleons:      parseInt(parts[0]),
                    protons:       parseInt(parts[2]),
                    neutrons:      parseInt(parts[3]),
                    halflife_base: hlb,
                    halflife_exp:  hle,
                    is_stable:     (hlb == 0 && hle == 0),
                    base_color:    { h: 0, s: 0, l: 0, a: 0 },
                    setBaseColor:  function() {
                        var scale_position = Math.min( (this.halflife_exp + this.halflife_base/10), limits.max_halflife_exp );
                        if (this.is_stable){ scale_position = limits.max_halflife_exp; }
                        var relative_halflife = map_range(scale_position, limits.min_halflife_exp, limits.max_halflife_exp, 0, 1);
                        this.base_color = palette.getColor(relative_halflife, 1);
                    }
                  };
        elements[nuclide.protons].nuclides.push(nuclide);

        // Update local (per-element) data boundaries
        elements[nuclide.protons].min_neutrons = Math.min(elements[nuclide.protons].min_neutrons, nuclide.neutrons);
        elements[nuclide.protons].max_neutrons = Math.max(elements[nuclide.protons].max_neutrons, nuclide.neutrons);
        if (elements[nuclide.protons].nuclides.length == 1){
            if (nuclide.is_stable){
                elements[nuclide.protons].stablest_nuclide_is_stable = true;
            }
        } else if (!elements[nuclide.protons].stablest_nuclide_is_stable) {
            stablest_nuclide = elements[nuclide.protons].nuclides[elements[nuclide.protons].stablest_nuclide_idx];
            if ( (stablest_nuclide.halflife_exp < nuclide.halflife_exp) || nuclide.is_stable ||
                 (stablest_nuclide.halflife_exp == nuclide.halflife_exp && stablest_nuclide.halflife_base < nuclide.halflife_base) ){
                elements[nuclide.protons].stablest_nuclide_idx = elements[nuclide.protons].nuclides.length - 1;
                elements[nuclide.protons].stablest_nuclide_is_stable = nuclide.is_stable;
            }
        }

        // Update global data boundaries
        limits.min_halflife_exp      = Math.min(limits.min_halflife_exp, nuclide.halflife_exp);
        limits.max_halflife_exp      = Math.max(limits.max_halflife_exp, nuclide.halflife_exp);
        limits.absolute_max_neutrons = Math.max(limits.absolute_max_neutrons, nuclide.neutrons);

    }
}