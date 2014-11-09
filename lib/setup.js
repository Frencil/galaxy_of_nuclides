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

    var galaxy = d3.select("svg");

    // Purge any previously drawn elements (all top-level <g>)
    galaxy.selectAll("g").remove();

    // Draw control elements (WIP)
    galaxy.append("g")
        .attr("id", "controls")
        .attr("class", "controls");
    galaxy.select("#controls")
        .append("text")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .text("Click me")
        .on("click", function(d, i){
            console.log(d);
            console.log(i);
        });

    // Draw all of the elements, fading them in as we go
    galaxy.append("g")
        .attr("id", "periodic_table")
        .attr("class", "element_group")
        .attr("transform", function(){
            var margin = Math.floor( (getTotalWidth() - (getElementWidth() * 18 + getElementMargin() * 17)) / 2 );
            return "translate("+margin+","+margin+")";
        });

    periodic_table = galaxy.select("#periodic_table").selectAll(".element_shell")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("class", "element_shell")
        .attr("transform", function(d){
            var x = null; var y = null;
            if (d.group > 18){
                x = (d.group - 17) * (getElementWidth() + getElementMargin());
                y = (d.period + 2) * (getElementWidth() + getElementMargin());
            } else if (d.group == 0) {
                x = 0; //-2 * getElementWidth();
                y = 0; //-2 * getElementWidth();
            } else {
                x = (d.group - 1) * (getElementWidth() + getElementMargin());
                y = (d.period - 1) * (getElementWidth() + getElementMargin());
            }
            return "translate("+x+","+y+")";
        }).each(function(d, i) {
            var display_id = 'element_' + d.protons + '_display';
            galaxy.select("#"+this.id)
                .append("g")
                .attr("id", function(d){ return display_id; })
                .attr("class", "element_display");
            galaxy.select("#"+display_id)
                .append("rect")
                .attr("class", "element_display")
                .attr("width", getElementWidth())
                .attr("height", getElementWidth())
                .style("opacity", 0)
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
            galaxy.select("#"+display_id)
                .append("text")
                .attr("class", "element_display")
                .attr("x", 3)
                .attr("y", 5)
                .attr("dy", ".8em")
                .style("opacity", 0)
                .text(function(d) { return d.symbol; })
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
        });

    // For each element draw all of its nuclides
    periodic_table.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclides'; })
        .attr("class", "nuclide_group")
        .each(function(d, i) {
            galaxy.select("#"+this.id).selectAll(".nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("g")
                .attr("class", "nuclide_shell")
                .attr("id", function(d){ return 'element_' + d.protons + '_nuclides_' + d.neutrons; });
        });

}
