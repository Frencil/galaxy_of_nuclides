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

function getTotalWidth(){
    return window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
}
function getElementWidth(){
    return Math.max(Math.floor(getTotalWidth() / 24), 20);
}
function getElementMargin(){
    return Math.max(Math.floor(getElementWidth() / 10), 2);
}

function drawGalaxy(){

    //d3.select("svg").append("rect").attr("stroke","#E0E0E0").attr("width",1000).attr("height",700);

    var galaxy = d3.select("svg");

    // Purge any previously drawn elements
    galaxy.selectAll("g").remove();

    // Draw all of the elements
    galaxy.append("g")
        .attr("id", "periodic_table")
        .attr("transform", function(){
            var margin = Math.floor( (getTotalWidth() - (getElementWidth() * 18 + getElementMargin() * 17)) / 2 );
            return "translate("+margin+","+margin+")";
        });

    periodic_table = galaxy.select("#periodic_table").selectAll(".element")
        .data(matter.elements)
        .enter().append("g")
        .attr("class", "element")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("transform", function(d){
            var x = null; var y = null;
            if (d.group > 18){
                x = (d.group - 17) * (getElementWidth() + getElementMargin());
                y = (d.period + 2) * (getElementWidth() + getElementMargin());
            } else if (d.group == 0) {
                x = -2 * getElementWidth();
                y = -2 * getElementWidth();
            } else {
                x = (d.group - 1) * (getElementWidth() + getElementMargin());
                y = (d.period - 1) * (getElementWidth() + getElementMargin());
            }
            return "translate("+x+","+y+")";
        });
    periodic_table.append("rect")
        .attr("class", "element")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("width", getElementWidth())
        .attr("height", getElementWidth());
    periodic_table.append("text")
        .attr("x", 3)
        .attr("y", 5)
        .attr("dy", ".8em")
        .text(function(d) { return d.symbol; });

    // For each element draw all of its nuclides
    periodic_table.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclides'; })
        .attr("class", "nuclides_group");
    for (e in matter.elements){
        element = matter.elements[e];
        nuclides = galaxy.select('#element_' + element.protons + '_nuclides').selectAll(".nuclide")
            .data( Object.keys(element.nuclides).map(function (key) {return element.nuclides[key]}) )
            .enter().append("g")
            .attr("class", "nuclide")
            .attr("id", function(d){ return 'element_' + d.protons + '_nuclides_' + d.neutrons; });
    }

}

// d3.select("#element_112").transition().attr("x",800).duration(1000).delay(100).ease("elastic");
// http://blog.visual.ly/creating-animations-and-transitions-with-d3-js/