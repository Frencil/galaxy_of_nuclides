"use strict";

// Initialize master data object for all known baryonic matter
var matter = {
    min_halflife_exp:         0,
    max_halflife_exp:         0,
    max_neutron_spread:       0,
    absolute_max_neutrons:    0,
    max_nuclides_per_element: 0,
    min_nuclides_per_element: 0
};

// Initialize master data object for display variables
var display = {

    // All top-level regions represent areas of the canvas at their
    // smallest resolution, with optimal resolutions being integer
    // multiples of everything
    area:    { w: 256, h: 160 },
    regions: { stage:      { x: 44, y: 28, w: 192, h: 132 },
               title:      { x: 0, y: 0, w: 192, h: 28 },
               slider:     { x: 236, y: 0, w: 20, h: 160 },
               sliderinfo: { x: 192, y: 0, w: 44, h: 28 },
               credit:     { x: 0, y: 136, w: 44, h: 24 },
               nav: { x: 0, y: 28, w: 44, h: 108,
                      regions: { periodic_table:    { x: 0, y: 0, w: 44, h: 36 },
                                 chart_of_nuclides: { x: 0, y: 36, w: 44, h: 36 },
                                 element_detail:    { x: 0, y: 72, w: 44, h: 36 }
                               }
                    }
             },

    // Layouts are displayed only inside the area defined by the stage
    // object. These objects provide details for specific layouts
    layouts: { periodic_table:    { data: { x: 6, y: 26, w: 180, h: 100 },
                                    element: { w: 9, m: 1 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info1: { x: 36, y: 8, w: 80, h: 40 },
                                    info2: { x: 124, y: 8, w: 48, h: 20 },
                                    getElementX: function(group, period){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        if (group > 18){
                                            return (group - 17) * base;
                                        } else if (group == 0) {
                                            return 0;
                                        } else {
                                            return (group - 1) * base;
                                        }
                                    },
                                    getElementY: function(group, period){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        if (group > 18){
                                            return (period + 2) * base;
                                        } else if (group == 0) {
                                            return 0;
                                        } else {
                                            return (period - 1) * base;
                                        }
                                    }
                                  },
               chart_of_nuclides: { data: { x: 6, y: 126, w: 180, h: 120 },
                                    nuclide: { w: .6, m: .4 },
                                    info1: { x: 8, y: 8, w: 76, h: 40 },
                                    info2: { x: 100, y: 76, w: 84, h: 48 },
                                    getElementX: function(group, period){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        if (group > 18){
                                            return (group - 17) * base;
                                        } else if (group == 0) {
                                            return 0;
                                        } else {
                                            return (group - 1) * base;
                                        }
                                    },
                                    getElementY: function(group, period){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        if (group > 18){
                                            return (period + 2) * base;
                                        } else if (group == 0) {
                                            return 0;
                                        } else {
                                            return (period - 1) * base;
                                        }
                                    }
                                  },
               single_element:    { data: { x: 136, y: 56, w: 52, h: 52 },
                                    image: { x: 4, y: 128, w: 128, h: 72 },
                                    info1: { x: 4, y: 4, w: 128, h: 48 },
                                    info2: { x: 136, y: 60, w: 52, h: 68 } }
             },

    // Scale is an integer value to allow for discrete geometric
    // scaling of the application for different viewport sizes
    scale: 1,

    available_width:     0,
    available_height:    0,

    nuclides_per_row:    0,
    in_transition:       true, // boolean to track if in transition or loading (a type of transition)
    current_layout:      'periodic_table'

};

// Define colors object for storing all color functions on various objects
var palette = {
    element: function(d){
        var relative_nuclides = map_range(d.nuclide_count, matter.min_nuclides_per_element, matter.max_nuclides_per_element, 0, 1);
        return palette.hsla(palette.scheme.getColor(relative_nuclides, 1));
    },
    nuclide: function(d){
        var scale_position = Math.min( (d.halflife.exponent + d.halflife.base/10), matter.max_halflife_exp );
        if (d.isStable){ scale_position = matter.max_halflife_exp; }
        var relative_halflife = map_range(scale_position, matter.min_halflife_exp, matter.max_halflife_exp, 0, 1);
        return palette.hsla(palette.scheme.getColor(relative_halflife, 1));
    },
    scheme: {
        scheme_low:  { h: 200, s_min: 75, s_max: 0, l_min: 35, l_max: 75 },
        scheme_high: { h: 30, s_min: 0, s_max: 70, l_min: 70, l_max: 40 },
        getColor: function(normalized_value, alpha){
            if (normalized_value < 0.5){
                return { h: this.scheme_low.h,
                         s: map_range(normalized_value, 0, 0.5, this.scheme_low.s_min, this.scheme_low.s_max),
                         l: map_range(normalized_value, 0, 0.5, this.scheme_low.l_min, this.scheme_low.l_max),
                         a: alpha };
            } else {
                return { h: this.scheme_high.h,
                         s: map_range(normalized_value, 0.5, 1, this.scheme_high.s_min, this.scheme_high.s_max),
                         l: map_range(normalized_value, 0.5, 1, this.scheme_high.l_min, this.scheme_high.l_max),
                         a: alpha };
            }
        }
    },
    hsla: function(color){
        return "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")";
    }
}


// Define transform object for storing all transform functions to be swapped on various display shells
var transform = {
    translate: {
        dataset: {
            periodic_table: function(){
                var x_margin = display.layouts.periodic_table.data.x * display.scale;
                var y_margin = display.layouts.periodic_table.data.y * display.scale;
                return "translate("+x_margin+","+y_margin+")";
            },
            chart_of_nuclides: function(){
                var x_margin = display.layouts.chart_of_nuclides.data.x * display.scale;
                var y_margin = 0; //display.layouts.chart_of_nuclides.data.y * display.scale;
                return "translate("+x_margin+","+y_margin+")";
            },
            reset: function(){
                return "translate(0, 0)";
            }
        },
        element: {
            periodic_table: function(d){
                var x = display.layouts.periodic_table.getElementX(d.group, d.period);
                var y = display.layouts.periodic_table.getElementY(d.group, d.period);
                return "translate("+x+","+y+")";
            },
            chart_of_nuclides: function(d){
                var x = 0;
                var y = display.scale * (display.layouts.chart_of_nuclides.data.h - (d.protons * (display.layouts.chart_of_nuclides.nuclide.w + display.layouts.chart_of_nuclides.nuclide.m)));
                return "translate("+x+","+y+")";
            }
        },
        nuclide: {
            periodic_table: function(d){
                var y = display.scale * (display.layouts.periodic_table.nuclide.m + (Math.floor(d.index / display.nuclides_per_row) * (display.layouts.periodic_table.nuclide.w + display.layouts.periodic_table.nuclide.m)));
                var x = display.scale * (display.layouts.periodic_table.nuclide.m + (d.index % display.nuclides_per_row) * (display.layouts.periodic_table.nuclide.w + display.layouts.periodic_table.nuclide.m));
                return "translate("+x+","+y+")";
            },
            chart_of_nuclides: function(d){
                var x = display.scale * d.neutrons * (display.layouts.chart_of_nuclides.nuclide.w + display.layouts.chart_of_nuclides.nuclide.m);
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
            for (var n in rows){
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
		            d3.select("#main_control").text("Ready.");
            });
        });
    });
}

function setDisplayVars(){

    display.available_width = window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;

    display.available_height = window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;

    display.scale = Math.max( Math.min( Math.floor(display.available_width / display.area.w),
                                        Math.floor(display.available_height / display.area.h) ), 1 );

    display.nuclides_per_row    = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));

    var periodic_table_base_nuclide_width = display.layouts.periodic_table.element.w / display.nuclides_per_row;
    display.layouts.periodic_table.nuclide.w = periodic_table_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.w;
    display.layouts.periodic_table.nuclide.m = periodic_table_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.m;
}

// Function to map a value in one range to a corresponding value in another range
function map_range(value, low1, high1, low2, high2) {
    if (high1 == low1){
        return low2;
    }
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function drawGalaxy(callback){

    // Generate display variables for the current display area size
    setDisplayVars();

    // Size the total SVG area correctly
    d3.select("#galaxy")
        .style("width", display.area.w * display.scale)
        .style("height", display.area.h * display.scale);

    // Purge any previously drawn elements (all top-level <g>)
    d3.selectAll("g").remove();

    // Add groups for each defined display region
    var drawRegions = function(regions, parent){
        for (var region in regions){
            (function(region){
                var r = regions[region];
                var translate = "translate(" + r.x * display.scale + ","
                                             + r.y * display.scale + ")";
                d3.select(parent).append("g")
                    .attr("id", region)
                    .attr("transform", translate)
                    .append("g")
                    .attr("id", region + "_svg");
                d3.select('#' + region).append("rect")
                    .attr("id", region + "_hitbox")
                    .attr("class", "hitbox")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", r.w * display.scale)
                    .attr("height", r.h * display.scale);
                if (r.regions !== undefined){
                    drawRegions(r.regions, '#' + region);
                }
            })(region);            
        }
    };
    drawRegions(display.regions, "svg");      

    // Draw nav buttons
    for (var button in display.regions.nav.regions){
        (function(button){
            d3.xml("images/svg/"+button+".svg", "image/svg+xml", function(xml) {
                var importedNode = document.importNode(xml.documentElement, true);
                d3.select("#" + button + "_svg")
                    .append("g").attr("id",button + "_graphic")
                    .node().appendChild(importedNode);
                d3.select("#" + button + "_graphic")
                    .attr("transform", "scale(" + display.scale + ")");
            });
            d3.xml("images/svg/nav_ghost_brackets.svg", "image/svg+xml", function(xml) {
                var importedNode = document.importNode(xml.documentElement, true);
                d3.select("#" + button + "_svg")
                    .append("g").attr("id",button + "_ghost_brackets")
                    .node().appendChild(importedNode);
                d3.select("#" + button + "_ghost_brackets")
                    .attr("opacity", 0)
                    .attr("transform", "scale(" + display.scale + ")");
            });
            // Add event handlers
            d3.select('#' + button + "_hitbox")
                .on("mouseover", function(){
                    d3.select("#"+button+"_ghost_brackets").attr("opacity", 100);
                })
                .on("mouseout", function(){
                    d3.select("#"+button+"_ghost_brackets").transition().attr("opacity", 0);
                })
                .on("click", function(){
                    transition.fire(button);
                });
        })(button);
    }

    // Draw brackets
    d3.xml("images/svg/slider_brackets.svg", "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("#sliderinfo")
            .append("g").attr("id","slider_brackets")
            .node().appendChild(importedNode);
        d3.select("#slider_brackets")
            .attr("transform", "scale(" + display.scale + ")");
    });
    d3.xml("images/svg/nav_highlight_brackets.svg", "image/svg+xml", function(xml) {
        var importedNode = document.importNode(xml.documentElement, true);
        d3.select("#nav")
            .append("g").attr("id","nav_brackets")
            .node().appendChild(importedNode);
        d3.select("#nav_brackets")
            .attr("transform", "scale(" + display.scale + ")");
    });

    // Draw control elements (WIP)
    d3.select("#credit").append("g")
        .attr("id", "controls")
        .attr("class", "controls");
    d3.select("#controls")
        .append("text")
        .attr("id", "main_control")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .text("Loading...");

    // Draw all of the elements, fading them in as we go
    d3.select("#stage").append("g")
        .attr("id", "dataset")
        .attr("class", "element_group")
        .attr("transform", transform.translate.dataset.periodic_table);
    var dataset = d3.select("#dataset").selectAll(".element_shell")
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
                .attr("width", display.layouts.periodic_table.element.w * display.scale)
                .attr("height", display.layouts.periodic_table.element.w * display.scale)
                .attr("fill", function(d){ return palette.element(d); })
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
    dataset.append("g")
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
                        .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("height", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("fill", function(d){ return palette.nuclide(d); })
                        .style("opacity", 0);
                });
        });

    // Callback to set display.in_transition = false after our fade-ins defined above are complete
    setTimeout(callback, matter.elements.length * 20 + 800);

}

var transition = {

    fire: function(new_layout){

        if (display.in_transition){
            console.log("in transition, ignoring request");
            return;
        }
        if (display.current_layout == new_layout){
            console.log("requested transition to current layout, ignoring request");
            return;
        }

        console.log("transitioning: " + display.current_layout + " to " + new_layout);
        d3.select("#main_control").text("Transitioning: " + display.current_layout + " to " + new_layout);
        display.in_transition = true;
        
        (function(new_layout){
            var y = display.regions.nav.regions[new_layout].y * display.scale;
            d3.select("#nav_brackets").transition()
                .duration(2000)
                .attr("transform", "translate(0, " + y + "), scale(" + display.scale + ")");
            transition[display.current_layout][new_layout](function(){
                console.log(new_layout);
                display.current_layout = new_layout;
                display.in_transition  = false;
                d3.select("#main_control").text("Ready.")
            });
        })(new_layout);

    },

    periodic_table: {

        chart_of_nuclides: function(callback){

            // Step 1: make element text vanish
            var hide_element_text = d3.select("svg").transition().duration(400);
            hide_element_text.selectAll("text.element_display").style("opacity",0);
            
            // Step 2: make nuclides appear
            var show_nuclides = hide_element_text.transition().duration(800);
            show_nuclides.selectAll(".nuclide_display").style("opacity",1);

            // Step 3: make element rect vanish
            var hide_element_rect = show_nuclides.transition().duration(800);
            hide_element_rect.selectAll("rect.element_display").style("opacity",0);

            // Step 4: retranslate data set and element shells
            var translate_elements = hide_element_rect.transition(2000);
            translate_elements.select("#dataset").attr("transform",transform.translate.dataset.chart_of_nuclides);
            translate_elements.selectAll(".element_shell").attr("transform",transform.translate.element.chart_of_nuclides);

            // Step 5: reposition nuclide shells to chart
            var translate_nuclide_shells = translate_elements.transition(2000);
            translate_nuclide_shells.selectAll(".nuclide_shell").attr("transform",transform.translate.nuclide.chart_of_nuclides);

            setTimeout(function(){ callback(); }, 6000);

        },

        element_detail: function(callback){

        },

    },

    chart_of_nuclides: {

        periodic_table: function(callback){

            // Step 1: reposition nuclide shells to periodic
            var translate_nuclide_shells = d3.select("svg").transition().duration(2000);
            translate_nuclide_shells.selectAll(".nuclide_shell").attr("transform",transform.translate.nuclide.periodic_table);
            
            // Step 2: reposition dataset and element shells to periodic
            var translate_elements = translate_nuclide_shells.transition().duration(2000);
            translate_elements.selectAll(".element_shell").attr("transform",transform.translate.element.periodic_table);
            translate_elements.select("#dataset").attr("transform",transform.translate.dataset.periodic_table);
            
            // Step 3: make element rect appear
            var show_element_rect = translate_elements.transition().duration(800);
            show_element_rect.selectAll("rect.element_display").style("opacity",1);

            // Step 4: make nuclides vanish
            var hide_nuclides = show_element_rect.transition().duration(800);
            hide_nuclides.selectAll(".nuclide_display").style("opacity",0);

            // Step 5: make element text appear
            var show_element_text = hide_nuclides.transition().duration(400);
            show_element_text.selectAll("text.element_display").style("opacity",1);
            
            setTimeout(function(){ callback(); }, 6000);

        },

        element_detail: function(callback){

        },

    },

    element_detail: {

        periodic_table: function(callback){

        },

        chart_of_nuclides: function(callback){

        },

    },

};