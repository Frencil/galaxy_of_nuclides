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
                      regions: { periodic_table:    { x: 0, y: 0, w: 44, h: 36, hitbox: true },
                                 chart_of_nuclides: { x: 0, y: 36, w: 44, h: 36, hitbox: true },
                                 element_detail:    { x: 0, y: 72, w: 44, h: 36, hitbox: true }
                               }
                    }
             },

    // Layouts are displayed only inside the area defined by the stage
    // object. These objects provide details for specific layouts.
    layouts: { periodic_table:    { data: { x: 6, y: 26, w: 180, h: 100 },
                                    element: { w: 9, m: 1 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info1: { x: 36, y: 8, w: 80, h: 40 },
                                    info2: { x: 124, y: 8, w: 48, h: 20 },
                                    getElementX: function(element){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        var x = display.scale * display.layouts.periodic_table.data.x;
                                        if (element.group > 18){
                                            return x + (element.group - 17) * base;
                                        } else if (element.group == 0) {
                                            return -100 * base;
                                        } else {
                                            return x + (element.group - 1) * base;
                                        }
                                    },
                                    getElementY: function(element){
                                        var base = display.scale * (display.layouts.periodic_table.element.w
                                                                  + display.layouts.periodic_table.element.m);
                                        var y = display.scale * display.layouts.periodic_table.data.y;
                                        if (element.group > 18){
                                            return y + (element.period + 2) * base;
                                        } else if (element.group == 0) {
                                            return y;
                                        } else {
                                            return y + (element.period - 1) * base;
                                        }
                                    },
                                    getNuclideX: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.nuclide.w
                                                                  + display.layouts.chart_of_nuclides.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.periodic_table.getElementX(element);
                                        return origin + display.scale * display.layouts.chart_of_nuclides.nuclide.m
                                               + (nuclide.index % display.nuclides_per_row) * base;
                                    },
                                    getNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.nuclide.w
                                                                  + display.layouts.chart_of_nuclides.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.periodic_table.getElementY(element);
                                        return origin + display.scale * display.layouts.chart_of_nuclides.nuclide.m
                                               + Math.floor(nuclide.index / display.nuclides_per_row) * base;
                                    }
                                  },
               chart_of_nuclides: { data: { x: 6, y: 6, w: 180, h: 120 },
                                    nuclide: { w: .6, m: .4 },
                                    info1: { x: 8, y: 8, w: 76, h: 40 },
                                    info2: { x: 100, y: 76, w: 84, h: 48 },
                                    getNuclideX: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.nuclide.w
                                                                  + display.layouts.chart_of_nuclides.nuclide.m);
                                        return display.scale * display.layouts.chart_of_nuclides.data.x + nuclide.neutrons * base;
                                    },
                                    getNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.nuclide.w
                                                                  + display.layouts.chart_of_nuclides.nuclide.m);
                                        return display.scale * display.layouts.chart_of_nuclides.data.y + (120 - nuclide.protons) * base;
                                    }
                                  },
               element_detail:    { data: { x: 136, y: 4, w: 52, h: 52 },
                                    element: { w: 2.6, m: 0.288 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    image: { x: 4, y: 128, w: 128, h: 72 },
                                    info1: { x: 4, y: 4, w: 128, h: 48 },
                                    info2: { x: 136, y: 60, w: 52, h: 34 },
                                    periodic_table: { x: 136, y: 98, w: 52, h: 30 },
                                    getElementX: function(element){
                                        var base = display.scale * (display.layouts.element_detail.element.w
                                                                  + display.layouts.element_detail.element.m);
                                        var x = display.scale * display.layouts.element_detail.periodic_table.x;
                                        if (element.group > 18){
                                            return x + (element.group - 17) * base;
                                        } else if (element.group == 0) {
                                            return -100 * base;
                                        } else {
                                            return x + (element.group - 1) * base;
                                        }
                                    },
                                    getElementY: function(element){
                                        var base = display.scale * (display.layouts.element_detail.element.w
                                                                  + display.layouts.element_detail.element.m);
                                        var y = display.scale * display.layouts.element_detail.periodic_table.y;
                                        if (element.group > 18){
                                            return y + (element.period + 2) * base;
                                        } else if (element.group == 0) {
                                            return y;
                                        } else {
                                            return y + (element.period - 1) * base;
                                        }
                                    },
                                    getNuclideX: function(nuclide){
                                        var base = display.scale * (display.layouts.element_detail.nuclide.w
                                                                  + display.layouts.element_detail.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.scale * display.layouts.element_detail.data.x;
                                        return origin + display.scale * display.layouts.element_detail.nuclide.m
                                               + (nuclide.index % display.nuclides_per_row) * base;
                                    },
                                    getNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.element_detail.nuclide.w
                                                                  + display.layouts.element_detail.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.scale * display.layouts.element_detail.data.y;
                                        return origin + display.scale * display.layouts.element_detail.nuclide.m
                                               + Math.floor(nuclide.index / display.nuclides_per_row) * base;
                                    }
                                  }
             },

    // Scale is an integer value to allow for discrete geometric
    // scaling of the application for different viewport sizes
    scale: 1,

    available_width:     0,
    available_height:    0,

    nuclides_per_row:    0,
    in_transition:       true, // boolean to track if in transition or loading (a type of transition)
    current_layout:      'periodic_table',

    // proton value for whichever element currently shown (or to be shown next) in the element detail layout
    element_detail_focus: null

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

    display.nuclides_per_row = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));

    // Set nuclide widths and margins for certain layouts
    var periodic_table_base_nuclide_width = display.layouts.periodic_table.element.w / display.nuclides_per_row;
    display.layouts.periodic_table.nuclide.w = periodic_table_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.w;
    display.layouts.periodic_table.nuclide.m = periodic_table_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.m;
    var element_detail_base_nuclide_width = display.layouts.element_detail.data.w / display.nuclides_per_row;
    display.layouts.element_detail.nuclide.w = element_detail_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.w;
    display.layouts.element_detail.nuclide.m = element_detail_base_nuclide_width * display.layouts.chart_of_nuclides.nuclide.m;
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
                if (r.hitbox){
                    d3.select('#' + region).append("rect")
                        .attr("id", region + "_hitbox")
                        .attr("class", "hitbox")
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", r.w * display.scale)
                        .attr("height", r.h * display.scale);
                }
                if (r.regions !== undefined){
                    drawRegions(r.regions, '#' + region);
                }
            })(region);            
        }
    };
    drawRegions(display.regions, "svg");    

    // Draw basic title (TODO: something better, a real logo...)
    d3.select("#title")
        .append("text")
        .attr("x", display.scale * 4)
        .attr("y", display.scale * (display.regions.title.y + display.regions.title.h - 4))
        .attr("font-size", display.scale * (display.regions.title.h - 12))
        .attr("fill", "#FFFFFF")
        .text("Nuclides.org");

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
        .attr("class", "element_group");
    var dataset = d3.select("#dataset").selectAll(".element_shell")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons; })
        .attr("class", "element_shell")
        .each(function(d, i) {
            var display_id = 'element_' + d.protons + '_display';
            var x = display.layouts.periodic_table.getElementX(d);
            var y = display.layouts.periodic_table.getElementY(d);
            var transform = "translate(" + x + "," + y + ")";
            d3.select("#"+this.id)
                .append("g")
                .attr("id", display_id)
                .attr("class", "element_display element_" + d.protons)
                .attr("transform", transform);
            d3.select("#" + display_id)
                .append("rect")
                .attr("class", "element_display")
                .attr("width", display.layouts.periodic_table.element.w * display.scale)
                .attr("height", display.layouts.periodic_table.element.w * display.scale)
                .attr("fill", function(d){ return palette.element(d); })
                .style("opacity", 0)
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
            d3.select("#" + display_id)
                .append("text")
                .attr("class", "element_display")
                .attr("x", 3)
                .attr("y", 5)
                .attr("dy", ".8em")
                .style("opacity", 0)
                .text(function(d) { return d.symbol; })
                .transition().style("opacity",1).duration(400).delay(d.protons * 10);
        });

    // Draw info boxes
    d3.select("#stage").append("rect")
        .attr("id", "info1")
        .attr("x", display.layouts.periodic_table.info1.x * display.scale)
        .attr("y", display.layouts.periodic_table.info1.y * display.scale)
        .attr("width", display.layouts.periodic_table.info1.w * display.scale)
        .attr("height", display.layouts.periodic_table.info1.h * display.scale)
        .attr("fill", "#808080");
    d3.select("#stage").append("rect")
        .attr("id", "info2")
        .attr("x", display.layouts.periodic_table.info2.x * display.scale)
        .attr("y", display.layouts.periodic_table.info2.y * display.scale)
        .attr("width", display.layouts.periodic_table.info2.w * display.scale)
        .attr("height", display.layouts.periodic_table.info2.h * display.scale)
        .attr("fill", "#808080");

    // Draw nuclides for every element
    dataset.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclide_group'; })
        .attr("class", "nuclide_group")
        .each(function(d, i) {
            d3.select("#"+this.id).selectAll(".nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("g")
                .attr("class", "nuclide_display element_" + d.protons)
                .attr("id", function(d){ return 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display'; })
                .style("opacity", 0)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getNuclideX(d);
                    var y = display.layouts.periodic_table.getNuclideY(d);
                    return "translate("+x+","+y+")";
                })
                .each(function(d, i){
                    var display_id = 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display';
                    d3.select("#"+display_id)
                        .append("rect")
                        .attr("class", "nuclide_display element_" + d.protons)
                        .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("height", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("fill", function(d){ return palette.nuclide(d); });
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
                .delay(500)
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

    moveInfoBoxes: function(target){
        var info_transition = d3.select("svg").transition().delay(1000);
        info_transition.select("#info1")
            .attr("x", display.layouts[target].info1.x * display.scale)
            .attr("y", display.layouts[target].info1.y * display.scale)
            .attr("width", display.layouts[target].info1.w * display.scale)
            .attr("height", display.layouts[target].info1.h * display.scale)
        info_transition.select("#info2")
            .attr("x", display.layouts[target].info2.x * display.scale)
            .attr("y", display.layouts[target].info2.y * display.scale)
            .attr("width", display.layouts[target].info2.w * display.scale)
            .attr("height", display.layouts[target].info2.h * display.scale)
    },

    periodic_table: {

        // Transition: Periodic Table -> Chart of Nuclides
        chart_of_nuclides: function(callback){

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);
            hide_detail.selectAll("text.element_display").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('chart_of_nuclides');

            // Make nuclides appear
            var show_nuclides = d3.select("svg").transition().delay(500).duration(500);
            show_nuclides.selectAll(".nuclide_display").style("opacity",1);

            // Loop through elements (total duration: ~4000)
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Hide the element rect
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay(1000 + 16 * element.protons).duration(100)
                    .style("opacity",0);

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display").filter(".element_" + element.protons).transition()
                    .delay(1100 + 16 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display").filter(".element_" + element.protons).transition()
                    .delay(1100 + 16 * element.protons).duration(2000)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5000).duration(500)
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);

            setTimeout(function(){ callback(); }, 6000);

        },

        // Transition: Periodic Table -> Element Detail
        element_detail: function(callback){

            if (display.element_detail_focus == null){
                display.element_detail_focus = Math.ceil(Math.random() * (matter.elements.length-1));
            }

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);
            hide_detail.selectAll("text.element_display").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('element_detail');

            // Move all non-focused elements to element detail periodic table positions
            d3.selectAll("rect.element_display").filter("*:not(.element_" + display.element_detail_focus + ")").transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Show focused nuclides
            d3.selectAll("g.nuclide_display").filter(".element_" + display.element_detail_focus).transition()
                .delay(500).duration(500)
                .style("opacity",1);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display").filter(".element_" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getNuclideX(d);
                    var y = display.layouts.element_detail.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter(".element_" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("rect.element_display").filter(".element_" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x;
                    var y = display.layouts.element_detail.data.y;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("g.element_display").filter(".element_" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .style("opacity",0);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5000).duration(500)
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);

            setTimeout(function(){ callback(); }, 6000);

        },

    },

    chart_of_nuclides: {

        // Transition: Chart of Nuclides -> Periodic Table
        periodic_table: function(callback){

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('periodic_table');

            // Loop through elements (total duration: ~4000)
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display").filter(".element_" + element.protons).transition()
                    .delay(500 + 16 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getNuclideX(d);
                        var y = display.layouts.periodic_table.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display").filter(".element_" + element.protons).transition()
                    .delay(500 + 16 * element.protons).duration(2000)
                    .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                    .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

                // Show the element rect
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay(2500 + 16 * element.protons).duration(100)
                    .style("opacity",1);

            }

            // Hide nuclides
            var hide_nuclides = d3.select("svg").transition().delay(5000).duration(500);
            hide_nuclides.selectAll(".nuclide_display").style("opacity",0);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5500).duration(500)
            show_detail.selectAll("text.element_display").style("opacity",1);
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);
            
            setTimeout(function(){ callback(); }, 6000);

        },

        // Transition: Chart of Nuclides -> Element Detail
        element_detail: function(callback){

        },

    },

    element_detail: {

        // Transition: Element Detail -> Periodic Table
        periodic_table: function(callback){

        },

        // Transition: Element Detail -> Chart of Nuclides
        chart_of_nuclides: function(callback){

        },

    },

};