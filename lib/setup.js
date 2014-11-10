// Initialize master data object for all known baryonic matter
matter = {
    min_halflife_exp:         0,
    max_halflife_exp:         0,
    max_neutron_spread:       0,
    absolute_max_neutrons:    0,
    max_nuclides_per_element: 0
};

// Initialize master data object for display variables
display = {
    total_width:         0,
    total_height:        0,
    element_width:       0,
    element_margin:      0,
    nuclides_per_row:    0,
    table_nuclide_width: 0, // size of a nuclide rect when mapped to the periodic table
    chart_nuclide_width: 0  // size of a nuclide rect when shown in the chart of nuclides
};

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

function setDisplayVars(){
    display.total_width = window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;
    display.total_height = window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;
    display.element_width       = Math.max(Math.floor(display.total_width / 24), 24);
    display.element_margin      = Math.max(Math.floor(display.element_width / 10), 2);
    display.nuclides_per_row    = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));
    display.table_nuclide_width = Math.max(Math.floor(display.element_width / display.nuclides_per_row) - 2, 2);
    display.chart_nuclide_width = Math.max(Math.floor(display.total_width / matter.absolute_max_neutrons), 8);
}

function drawGalaxy(){

    // Generate display variables for the current display area size
    setDisplayVars();

    // Purge any previously drawn elements (all top-level <g>)
    d3.selectAll("g").remove();

    // Draw control elements (WIP)
    d3.select("svg").append("g")
        .attr("id", "controls")
        .attr("class", "controls");
    d3.select("#controls")
        .append("text")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .text("Click me")
        .on("click", function(d, i){
            tableToChart();
        });

    // Draw all of the elements, fading them in as we go
    d3.select("svg").append("g")
        .attr("id", "periodic_table")
        .attr("class", "element_group")
        .attr("transform", function(){
            var margin = Math.floor( (display.total_width - (display.element_width * 18 + display.element_margin * 17)) / 2 );
            return "translate("+margin+","+margin+")";
        });
    periodic_table = d3.select("#periodic_table").selectAll(".element_shell")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("class", "element_shell")
        .attr("transform", function(d){
            var x = null; var y = null;
            if (d.group > 18){
                x = (d.group - 17) * (display.element_width + display.element_margin);
                y = (d.period + 2) * (display.element_width + display.element_margin);
            } else if (d.group == 0) {
                x = 0; //-2 * display.element_width;
                y = 0; //-2 * display.element_width;
            } else {
                x = (d.group - 1) * (display.element_width + display.element_margin);
                y = (d.period - 1) * (display.element_width + display.element_margin);
            }
            return "translate("+x+","+y+")";
        }).each(function(d, i) {
            var display_id = 'element_' + d.protons + '_display';
            d3.select("#"+this.id)
                .append("g")
                .attr("id", function(d){ return display_id; })
                .attr("class", "element_display");
            d3.select("#"+display_id)
                .append("rect")
                .attr("class", "element_display")
                .attr("width", display.element_width)
                .attr("height", display.element_width)
                .style("opacity", 0)
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
            d3.select("#"+display_id)
                .append("text")
                .attr("class", "element_display")
                .attr("x", 3)
                .attr("y", 5)
                .attr("dy", ".8em")
                .style("opacity", 0)
                .text(function(d) { return d.symbol; })
                .transition().style("opacity",1).duration(400).delay(d.protons * 10);
        });

    // Draw nuclides for every element
    periodic_table.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclide_group'; })
        .attr("class", "nuclide_group")
        .each(function(d, i) {
            d3.select("#"+this.id).selectAll(".nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("g")
                .attr("class", "nuclide_shell")
                .attr("id", function(d){ return 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display'; })
                .attr("transform", function(d){
                    var y = Math.floor(d.index / display.nuclides_per_row) * (display.table_nuclide_width + 2) + 2;
                    var x = (d.index % display.nuclides_per_row) * (display.table_nuclide_width + 2) + 2;
                    return "translate("+x+","+y+")";
                }).each(function(d, i){
                    var display_id = 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display';
                    d3.select("#"+display_id)
                        .append("rect")
                        .attr("class", "nuclide_display")
                        .attr("width", display.table_nuclide_width)
                        .attr("height", display.table_nuclide_width)
                        .style("opacity", 0);
                });
        });

}

function tableToChart(){
    console.log("here we go...");
    d3.selectAll(".nuclide_display")
        .transition().style("opacity",1).duration(800);
}