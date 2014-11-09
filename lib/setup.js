// Initialize master data object for all known baryonic matter
matter = new Object();
matter.min_halflife_exp = 0;
matter.max_halflife_exp = 0;
matter.max_neutron_spread    = 0;
matter.absolute_max_neutrons = 0;
matter.max_nuclides_per_element = 0;

function loadElements(callback) {
    d3.csv("data/elements.csv", function(d) {
        return new Element(d.protons, d.period, d.group, d.symbol, d.name);
    }, function(error, rows) {
        if (!error){
            matter.elements = rows;
            callback();
        }
    });
}

function loadNuclides(callback){
    d3.csv("data/nuclides.csv", function(d) {
        return new Nuclide(d.protons, d.neutrons, d.halflife);
    }, function(error, rows) {
        if (!error){
            for (n in rows){
                matter.elements[rows[n].protons].addNuclide(rows[n]);
            }
            callback();
        }
    });
}

function loadGalaxy(){
    loadElements(function(){
        loadNuclides(function(){
            drawGalaxy();
        });
    });
}

function drawGalaxy(){
    var ele_width  = 24;
    var ele_margin = 4;
    var nuc_width  = 8;
    var nuc_margin = 2;
    var galaxy = d3.select("svg");
    galaxy
        .selectAll(".element")
        .data(matter.elements)
        .enter()
        .append("rect")
        .attr("class", "element")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("width", ele_width)
        .attr("height", ele_width)
        .attr("x", function(d){
            if (d.group > 18){ return (d.group - 16) * (ele_width + ele_margin); }
            else if (d.group == 0) { return -1 * (ele_width + ele_margin); }
            else { return d.group * (ele_width + ele_margin); } })
        .attr("y", function(d){
            if (d.group > 18){ return (d.period + 3) * (ele_width + ele_margin); }
            else { return d.period * (ele_width + ele_margin); } })
}