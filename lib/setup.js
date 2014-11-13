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
    table_nuclide_width: 0,    // size of a nuclide rect when mapped to the periodic table
    chart_nuclide_width: 0,    // size of a nuclide rect when shown in the chart of nuclides
    in_transition:       true, // boolean to track if in transition or loading (a type of transition)
    current_layout:      'periodic_table'
};

// Define transform object for storing all transform functions to be swapped on various display shells
transform = {
    translate: {
        element: {
            periodic_table: function(d){
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
            },
            chart_of_nuclides: function(d){
                var x = 0;
                var y = display.total_height - (d.protons * (display.chart_nuclide_width + 2));
                return "translate("+x+","+y+")";
            }
        },
        nuclide: {
            periodic_table: function(d){
                var y = Math.floor(d.index / display.nuclides_per_row) * (display.table_nuclide_width + 2) + 2;
                var x = (d.index % display.nuclides_per_row) * (display.table_nuclide_width + 2) + 2;
                return "translate("+x+","+y+")";
            },
            chart_of_nuclides: function(d){
                var x = d.neutrons * (display.table_nuclide_width + 2);
                var y = 0;
                return "translate("+x+","+y+")";
            }
        }
    }
};

function loadElements(callback) {
    d3.csv("data/elements.csv", function(d) {
        return new Element(d.protons, d.period, d.group, d.symbol, d.name);
    }, function(error, rows) {
        if (!error){
            matter.elements = rows;
            callback();
        } else {
            console.log("Error loading elements: " + error);
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
        } else {
            console.log("Error loading nuclides: " + error);
        }
    });
}

function loadGalaxy(){
    loadElements(function(){
        loadNuclides(function(){
            drawGalaxy(function(){
                display.in_transition = false;
		            d3.select("#main_control").text("< Show Chart of Nuclides >");
            });
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
    display.element_width       = Math.max( Math.min(Math.floor(display.total_width / 24), Math.floor(display.total_height / 12)), 24);
    display.element_margin      = Math.max(Math.floor(display.element_width / 10), 2);
    display.nuclides_per_row    = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));
    display.table_nuclide_width = Math.max(Math.floor(display.element_width / display.nuclides_per_row) - 2, 2);
    display.chart_nuclide_width = Math.max( Math.min(Math.floor(display.total_width / matter.absolute_max_neutrons), Math.floor(display.total_height / matter.elements.length)), 3);
}

function drawGalaxy(callback){

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
        .attr("id", "main_control")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .text("Loading...")
        .on("click", function(d, i){
            transitionLayouts();
        });

    // Draw all of the elements, fading them in as we go
    d3.select("svg").append("g")
        .attr("id", "periodic_table")
        .attr("class", "element_group")
        .attr("transform", function(){
            var x_margin = Math.floor( (display.total_width - (display.element_width * 18 + display.element_margin * 17)) / 2 );
            var y_margin = Math.floor( (display.total_height - (display.element_width * 10 + display.element_margin * 9)) / 2 );
            return "translate("+x_margin+","+y_margin+")";
        });
    periodic_table = d3.select("#periodic_table").selectAll(".element_shell")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("class", "element_shell")
        .attr("transform", transform.translate.element.periodic_table)
        .each(function(d, i) {
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
                .attr("transform", transform.translate.nuclide.periodic_table)
                .each(function(d, i){
                    var display_id = 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display';
                    d3.select("#"+display_id)
                        .append("rect")
                        .attr("class", "nuclide_display")
                        .attr("width", display.table_nuclide_width)
                        .attr("height", display.table_nuclide_width)
                        .style("opacity", 0);
                });
        });

    // Callback to set display.in_transition = false after our fade-ins defined above are complete
    setTimeout(callback, matter.elements.length * 20 + 800);

}

function transitionLayouts(){
    if (display.in_transition){
        console.log("in transition, ignoring request");
        return;
    }
    if (display.current_layout == 'periodic_table'){
        console.log("transitioning: periodic table to chart of nuclides");
        d3.select("#main_control").text("Transitioning to Chart of Nuclides...")
        display.in_transition = true;
        tableToChart(function(){
            display.current_layout = 'chart_of_nuclides';
            display.in_transition  = false;
            d3.select("#main_control").text("< Show Periodic Table >")
        });
        return;
    }
    if (display.current_layout == 'chart_of_nuclides'){
        console.log("transitioning: chart of nuclides to periodic table");
        d3.select("#main_control").text("Transitioning to Periodic Table...")
        display.in_transition = true;
        chartToTable(function(){
            display.current_layout = 'periodic_table';
            display.in_transition  = false;
            d3.select("#main_control").text("< Show Chart of Nuclides >")
        });
        return;
    }
}

function tableToChart(callback){

    // Step 1: make element text vanish
    var hide_element_text = d3.select("svg").transition().duration(400);
    hide_element_text.selectAll("text.element_display").style("opacity",0);

    // Step 2: make nuclides appear
    var show_nuclides = hide_element_text.transition().duration(800);
    show_nuclides.selectAll(".nuclide_display").style("opacity",1);

    // Step 3: make element rect vanish
    var hide_element_rect = show_nuclides.transition().duration(800);
    hide_element_rect.selectAll("rect.element_display").style("opacity",0);

    // Step 4: reposition element shells to chart
    var translate_element_shells = hide_element_rect.transition(2000);
    translate_element_shells.selectAll(".element_shell").attr("transform",transform.translate.element.chart_of_nuclides);

    // Step 5: reposition nuclide shells to chart
    var translate_nuclide_shells = translate_element_shells.transition(2000);
    translate_element_shells.selectAll(".nuclide_shell").attr("transform",transform.translate.nuclide.chart_of_nuclides);

    setTimeout(function(){ callback(); }, 6000);
    
}

function chartToTable(callback){

    // Step 4: reposition element shells to periodic
    var translate_nuclide_shells = d3.select("svg").transition().duration(2000);
    translate_nuclide_shells.selectAll(".nuclide_shell").attr("transform",transform.translate.nuclide.periodic_table);

    // Step 4: reposition element shells to periodic
    var translate_element_shells = translate_nuclide_shells.transition().duration(2000);
    translate_element_shells.selectAll(".element_shell").attr("transform",transform.translate.element.periodic_table);

    // Step -3: make element rect appear
    var show_element_rect = translate_element_shells.transition().duration(800);
    show_element_rect.selectAll("rect.element_display").style("opacity",1);

    // Step -2: make nuclides vanish
    var hide_nuclides = show_element_rect.transition().duration(800);
    hide_nuclides.selectAll(".nuclide_display").style("opacity",0);

    // Step -1: make element text appear
    var show_element_text = hide_nuclides.transition().duration(400);
    show_element_text.selectAll("text.element_display").style("opacity",1);

    setTimeout(function(){ callback(); }, 6000);
    
}