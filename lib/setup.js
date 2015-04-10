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
    regions: {

        // Title: Area for banner title
        title: { x: 0, y: 0, w: 192, h: 28, hitbox: true },

        // Nav: Large buttons for switching between layouts; graphics are external svg files
        nav:   { x: 0, y: 28, w: 44, h: 108,
                 regions: { periodic_table:    { x: 0, y: 0, w: 44, h: 36, hitbox: true },
                            chart_of_nuclides: { x: 0, y: 36, w: 44, h: 36, hitbox: true },
                            element_detail:    { x: 0, y: 72, w: 44, h: 36, hitbox: true },
                            credit:            { x: 0, y: 108, w: 44, h: 24 }
                          }
               },
        
        // Slider: Object for controlling elapsed time to illustrate decay
        time:  { x: 192, y: 0, w: 64, h: 160,
                 regions: { info:   { x: 0, y: 0, w: 44, h: 28 },
                            slider: { x: 44, y: 0, w: 20, h: 160 }
                          }
               },
        
        // Stage: Main object for displaying data
        stage: { x: 44, y: 28, w: 192, h: 132 }
        
    },
    
    // Layouts are displayed only inside the area defined by the stage
    // object. These objects provide details for specific layouts.
    layouts: { periodic_table:    { data: { x: 6, y: 26, w: 180, h: 100 },
                                    element: { w: 9, m: 1 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info1: { x: 29, y: 5, w: 60, h: 47 },
                                    info2: { x: 93, y: 5, w: 28, h: 47 },
                                    image: { x: 125, y: 5, w: 48, h: 27 },
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
                                        var base = display.scale * (display.layouts.periodic_table.nuclide.w
                                                                  + display.layouts.periodic_table.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.periodic_table.getElementX(element);
                                        return origin + (nuclide.index % display.nuclides_per_row) * base;
                                    },
                                    getNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.periodic_table.nuclide.w
                                                                  + display.layouts.periodic_table.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.periodic_table.getElementY(element);
                                        return origin + Math.floor(nuclide.index / display.nuclides_per_row) * base;
                                    }
                                  },
               chart_of_nuclides: { data: { x: 6, y: 6, w: 180, h: 120 },
                                    element: { w: 2.6, m: 0.288 },
                                    nuclide: { w: .6, m: .4 },
                                    table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info1: { x: 8, y: 8, w: 96, h: 32 },
                                    info2: { x: 84, y: 88, w: 100, h: 36 },
                                    image: { x: 8, y: 45, w: 48, h: 27 },
                                    periodic_table: { x: 132, y: 54, w: 52, h: 30 },
                                    getElementX: function(element){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.element.w
                                                                  + display.layouts.chart_of_nuclides.element.m);
                                        var x = display.scale * display.layouts.chart_of_nuclides.periodic_table.x;
                                        if (element.group > 18){
                                            return x + (element.group - 17) * base;
                                        } else if (element.group == 0) {
                                            return -100 * base;
                                        } else {
                                            return x + (element.group - 1) * base;
                                        }
                                    },
                                    getElementY: function(element){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.element.w
                                                                  + display.layouts.chart_of_nuclides.element.m);
                                        var y = display.scale * display.layouts.chart_of_nuclides.periodic_table.y;
                                        if (element.group > 18){
                                            return y + (element.period + 2) * base;
                                        } else if (element.group == 0) {
                                            return y;
                                        } else {
                                            return y + (element.period - 1) * base;
                                        }
                                    },
                                    getTableNuclideX: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.table_nuclide.w
                                                                  + display.layouts.chart_of_nuclides.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.chart_of_nuclides.getElementX(element);
                                        return origin + (nuclide.index % display.nuclides_per_row) * base;
                                    },
                                    getTableNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.table_nuclide.w
                                                                  + display.layouts.chart_of_nuclides.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.chart_of_nuclides.getElementY(element);
                                        return origin + Math.floor(nuclide.index / display.nuclides_per_row) * base;
                                    },
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
                                    table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info1: { x: 4, y: 4, w: 128, h: 48 },
                                    info2: { x: 136, y: 60, w: 52, h: 34 },
                                    image: { x: 4, y: 56, w: 128, h: 72 },
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
                                    getTableNuclideX: function(nuclide){
                                        var base = display.scale * (display.layouts.element_detail.table_nuclide.w
                                                                  + display.layouts.element_detail.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.element_detail.getElementX(element);
                                        return origin + (nuclide.index % display.nuclides_per_row) * base;
                                    },
                                    getTableNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.element_detail.table_nuclide.w
                                                                  + display.layouts.element_detail.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.element_detail.getElementY(element);
                                        return origin + Math.floor(nuclide.index / display.nuclides_per_row) * base;
                                    },
                                    getDataNuclideX: function(index){
                                        var base = display.scale * (display.layouts.element_detail.nuclide.w
                                                                  + display.layouts.element_detail.nuclide.m);
                                        var origin  = display.scale * display.layouts.element_detail.data.x;
                                        return origin + (index % display.nuclides_per_row) * base;
                                    },
                                    getDataNuclideY: function(index){
                                        var base = display.scale * (display.layouts.element_detail.nuclide.w
                                                                  + display.layouts.element_detail.nuclide.m);
                                        var origin  = display.scale * display.layouts.element_detail.data.y;
                                        return origin + Math.floor(index / display.nuclides_per_row) * base;
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

    // proton values for whichever element currently shown (or to be shown next) in the element detail layout
    element_detail_focus: null,
    next_element_detail_focus: null

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
        return new Element(d.protons, d.period, d.group, d.symbol, d.name, d.has_image);
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
    display.layouts.periodic_table.nuclide.w = periodic_table_base_nuclide_width * 0.9;
    display.layouts.periodic_table.nuclide.m = periodic_table_base_nuclide_width * 0.1;

    var chart_of_nuclides_base_table_nuclide_width = display.layouts.chart_of_nuclides.element.w / display.nuclides_per_row;
    display.layouts.chart_of_nuclides.table_nuclide.w = chart_of_nuclides_base_table_nuclide_width * 0.9;
    display.layouts.chart_of_nuclides.table_nuclide.m = chart_of_nuclides_base_table_nuclide_width * 0.1;

    var element_detail_base_nuclide_width = display.layouts.element_detail.data.w / display.nuclides_per_row;
    display.layouts.element_detail.nuclide.w = element_detail_base_nuclide_width * 0.9;
    display.layouts.element_detail.nuclide.m = element_detail_base_nuclide_width * 0.1;

    var element_detail_base_table_nuclide_width = display.layouts.element_detail.element.w / display.nuclides_per_row;
    display.layouts.element_detail.table_nuclide.w = element_detail_base_table_nuclide_width * 0.9;
    display.layouts.element_detail.table_nuclide.m = element_detail_base_table_nuclide_width * 0.1;
}

// Function to map a value in one range to a corresponding value in another range
function map_range(value, low1, high1, low2, high2) {
    if (high1 == low1){
        return low2;
    }
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function drawGalaxy(callback){

    // Scale an array of path stops and generate a path string
    var pathString = function(path){
        var result = '';
        for (var s in path){
            var val = path[s] * display.scale;
            if (!(s % 2)){
                result += (s == 0 ? "M" : "L");
            }
            result += val + " ";
        }
        return result;
    }

    // Generate display variables for the current display area size
    setDisplayVars();

    // Size the total SVG area correctly
    d3.select("#galaxy")
        .style("width", display.area.w * display.scale)
        .style("height", display.area.h * display.scale);

    // Purge any previously drawn elements (all top-level <g>)
    d3.selectAll("g").remove();

    // Draw all defined regions
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

    // Draw Title (TODO: something better, a real logo...)
    d3.select("#title")
        .append("text")
        .attr("x", display.scale * 4)
        .attr("y", display.scale * (display.regions.title.y + display.regions.title.h - 4))
        .attr("font-size", display.scale * (display.regions.title.h - 12))
        .attr("fill", "#FFFFFF")
        .text("Nuclides.org");

    // Draw Nav
    d3.select("#nav").append("g").attr("id","ghost_brackets");
    d3.select("#nav").append("g").attr("id","highlight_brackets");
    for (var button in display.regions.nav.regions){
        if (button == 'credit'){
            continue;
        }
        (function(button){
            // Draw button graphics from external svg
            d3.xml("images/svg/"+button+".svg", "image/svg+xml", function(xml) {
                var importedNode = document.importNode(xml.documentElement, true);
                d3.select("#" + button + "_svg")
                    .append("g").attr("id",button + "_graphic")
                    .node().appendChild(importedNode);
                d3.select("#" + button + "_graphic")
                    .attr("transform", "scale(" + display.scale + ")");
            });
            // Add event handlers
            d3.select('#' + button + "_hitbox")
                .on("mouseover", function(){
                    d3.select("#ghost_brackets_" + button).attr("display", null);
                })
                .on("mouseout", function(){
                    d3.select("#ghost_brackets_" + button).attr("display", "none");
                })
                .on("click", function(){
                    transition.fire(button);
                });
            // Draw ghost brackets
            var y = display.regions.nav.regions[button].y;
            var g = d3.select("#ghost_brackets").append("g")
                .attr("id","ghost_brackets_" + button)
                .attr("display", "none");
            g.append("path")
                .attr("d",pathString([3, y+1, 1, y+1, 1, y+35, 3, y+35]))
                .attr("stroke","#FFFFFF").attr("stroke-width","1")
                .attr("fill","none").style("opacity", 0.5)
            g.append("path")
                .attr("d",pathString([41, y+1, 43, y+1, 43, y+35, 41, y+35]))
                .attr("stroke","#FFFFFF").attr("stroke-width","1")
                .attr("fill","none").style("opacity", 0.5);
        })(button);
    }
    d3.select("#highlight_brackets").append("path")
        .attr("d",pathString([3, 1, 1, 1, 1, 35, 3, 35]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    d3.select("#highlight_brackets").append("path")
        .attr("d",pathString([41, 1, 43, 1, 43, 35, 41, 35]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");

    // Draw Time
    var time = d3.select("#time");
    time.append("path")
        .attr("d",pathString([3, 1, 1, 1, 1, 27, 3, 27]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    time.append("path")
        .attr("d",pathString([41, 1, 43, 1, 43, 27, 41, 27]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    time.append("path")
        .attr("d",pathString([47, 1, 45, 1, 45, 159, 47, 159]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    time.append("path")
        .attr("d",pathString([61, 1, 63, 1, 63, 159, 61, 159]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    time.append("path")
        .attr("d",pathString([43, 13, 45, 13]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");
    time.append("path")
        .attr("d",pathString([43, 14, 45, 14]))
        .attr("stroke","#FFFFFF").attr("stroke-width","1")
        .attr("fill","none");

    // Draw Stage / Info
    var info = d3.select("#stage").append("g").attr("id", "info");
    info.append("rect")
        .attr("id", "info1")
        .attr("class", "info")
        .attr("x", display.layouts.periodic_table.info1.x * display.scale)
        .attr("y", display.layouts.periodic_table.info1.y * display.scale)
        .attr("width", display.layouts.periodic_table.info1.w * display.scale)
        .attr("height", display.layouts.periodic_table.info1.h * display.scale)
        .attr("fill", "#101010");
    info.append("rect")
        .attr("id", "info2")
        .attr("class", "info")
        .attr("x", display.layouts.periodic_table.info2.x * display.scale)
        .attr("y", display.layouts.periodic_table.info2.y * display.scale)
        .attr("width", display.layouts.periodic_table.info2.w * display.scale)
        .attr("height", display.layouts.periodic_table.info2.h * display.scale)
        .attr("fill", "#101010");
    info.append("svg:image")
        .attr("id", "image")
        .attr("class", "info")
        .attr("x", display.layouts.periodic_table.image.x * display.scale)
        .attr("y", display.layouts.periodic_table.image.y * display.scale)
        .attr("width", display.layouts.periodic_table.image.w * display.scale)
        .attr("height", display.layouts.periodic_table.image.h * display.scale);

    // Draw control elements (WIP, deprecated)
    d3.select("#credit").append("g")
        .attr("id", "controls")
        .attr("class", "controls");
    d3.select("#controls")
        .append("text")
        .attr("id", "main_control")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .text("Loading...");

    // Draw Stage / Elements
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
                .attr("class", "element_display e" + d.protons)
                .attr("transform", transform);
            d3.select("#" + display_id)
                .append("rect")
                .attr("class", "element_display e" + d.protons)
                .attr("width", display.layouts.periodic_table.element.w * display.scale)
                .attr("height", display.layouts.periodic_table.element.w * display.scale)
                .attr("fill", function(d){ return palette.element(d); })
                .style("opacity", 0)
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
            d3.select("#" + display_id)
                .append("text")
                .attr("class", "element_display e" + d.protons)
                .attr("x", 3)
                .attr("y", 5)
                .attr("dy", ".8em")
                .style("opacity", 0)
                .text(function(d) { return d.symbol; })
                .transition().style("opacity",1).duration(400).delay(d.protons * 10);
        });

    // Draw Stage / Nuclides
    dataset.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclide_group'; })
        .attr("class", "nuclide_group")
        .each(function(d, i) {
            d3.select("#"+this.id).selectAll(".nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("g")
                .attr("class", "nuclide_display e" + d.protons)
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
                        .attr("class", "nuclide_display e" + d.protons)
                        .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("height", display.layouts.periodic_table.nuclide.w * display.scale)
                        .attr("fill", function(d){ return palette.nuclide(d); });
                });
        });

    // Draw Stage / Hitboxes
    d3.select("#stage").append("g")
        .attr("id","hitboxes");
    d3.select("#hitboxes").selectAll(".hitbox")
        .data(matter.elements)
        .enter().append("rect")
        .attr("id", function(d){ return 'element_' + d.protons + "_hitbox"; })
        .attr("class", "hitbox element")
        .attr("width", display.layouts.periodic_table.element.w * display.scale)
        .attr("height", display.layouts.periodic_table.element.w * display.scale)
        .attr("transform", function(d){
            var x = display.layouts.periodic_table.getElementX(d);
            var y = display.layouts.periodic_table.getElementY(d);
            return "translate(" + x + "," + y + ")";
        })
        .on("mouseover", function(d){
            d3.select("rect.element_display.e" + d.protons)
                .style("stroke", "#FFFFFF")
                .style("filter", "url(#highlight-glow)");
            if (!display.in_transition && display.current_layout != 'element_detail'){
                transition.set_image(d.protons);
            }
        })
        .on("mouseout", function(d){
            d3.select("rect.element_display.e" + d.protons)
                .style("stroke", "#D0D0D0")
                .style("filter", "none");
        })
        .on("click", function(d){
            transition.fire("element_detail", d.protons);
        });
    for (var h = 0; h < matter.max_nuclides_per_element; h++){
        var x = display.layouts.element_detail.getDataNuclideX(h);
        var y = display.layouts.element_detail.getDataNuclideY(h);
        var transform = "translate(" + x + "," + y + ")";
        d3.select("#hitboxes").append("rect")
            .attr("id", "nuclide_" + h + "_hitbox")
            .attr("class", "hitbox nuclide")
            .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
            .attr("height", display.layouts.element_detail.nuclide.w * display.scale)
            .attr("transform", transform)
            .attr("display", "none");
    }

    // Callback to set display.in_transition = false after all above definitions are complete
    setTimeout(callback, matter.elements.length * 20 + 800);

}
