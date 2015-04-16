"use strict";

// Initialize master data object for all known baryonic matter
var matter = {
    min_halflife_exp:         0,
    max_halflife_exp:         0,
    max_neutrons:             0,
    max_neutron_spread:       0,
    absolute_max_neutrons:    0,
    max_nuclides_per_element: 0,
    min_nuclides_per_element: 0,
    total_nuclides:           0,
    sprite_map_max:           0,
    element_name_map: {},
    nuclide_name_map: {}
};

function loadElements(callback) {
    var now = new Date().getTime();
    d3.csv("data/elements.csv?r=" + now, function(d) {
        return new Element(d.protons, d.period, d.group, d.symbol, d.name, d.has_image, d.info);
    }, function(error, rows) {
        if (!error){
            matter.elements = rows;
            for (var e in matter.element_name_map){
                matter.element_name_map[e] = matter.elements[matter.element_name_map[e]];
            }
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

function setup(){
    initializeNuclides();
    loadElements(function(){
        d3.select("#curtain_text").text("loading....");
        loadNuclides(function(){
            d3.select("#curtain_text").text("loading.....");
            renderApplication(function(){
                d3.select("#curtain").transition().duration(1000).style("opacity",0);
                setTimeout(function(){ d3.select("#curtain").style("display", "none"); }, 1100);
                display.in_transition = false;
		            d3.select("#main_control").html("Ready.");
            });
        });
    });
}

// Scale an array of path stops and generate a path string
function pathString(path){
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

function setDisplayVars(){

    display.nuclides_per_row = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));

    // Set nuclide widths and margins for certain layouts

    var elements_base_nuclide_width = display.layouts.elements.element.w / display.nuclides_per_row;
    display.layouts.elements.nuclide.w = elements_base_nuclide_width * 0.9;
    display.layouts.elements.nuclide.m = elements_base_nuclide_width * 0.1;

    var nuclides_base_table_nuclide_width = display.layouts.nuclides.element.w / display.nuclides_per_row;
    display.layouts.nuclides.table_nuclide.w = nuclides_base_table_nuclide_width * 0.9;
    display.layouts.nuclides.table_nuclide.m = nuclides_base_table_nuclide_width * 0.1;

    var isotopes_base_nuclide_width = display.layouts.isotopes.data.w / display.nuclides_per_row;
    display.layouts.isotopes.nuclide.w = isotopes_base_nuclide_width * 0.9;
    display.layouts.isotopes.nuclide.m = isotopes_base_nuclide_width * 0.1;

    var isotopes_base_table_nuclide_width = display.layouts.isotopes.element.w / display.nuclides_per_row;
    display.layouts.isotopes.table_nuclide.w = isotopes_base_table_nuclide_width * 0.9;
    display.layouts.isotopes.table_nuclide.m = isotopes_base_table_nuclide_width * 0.1;
}

function initializeNuclides(){

    // Determine scale
    display.available_width = window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;
    display.available_height = window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;
    display.scale = Math.max( Math.min( Math.floor(display.available_width / display.area.w),
                                        Math.floor(display.available_height / display.area.h) ), 1 );

    // Size the total SVG area and purge all top-level <g>
    d3.select("#galaxy_of_nuclides")
        .style("width", (display.area.w * display.scale) + "px")
        .style("height", (display.area.h * display.scale) + "px");
    d3.selectAll("g").remove();

    // Initialize all defined regions
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
                if (r.regions !== undefined){
                    drawRegions(r.regions, '#' + region);
                }
            })(region);            
        }
    };
    drawRegions(display.regions, "svg");

    // Fill curtain with loading graphic
    d3.select("#curtain")
        .style("opacity",1)
        .append("rect")
        .attr("x", 0).attr("y", 0)
        .attr("width", display.scale * display.regions.curtain.w)
        .attr("height", display.scale * display.regions.curtain.h)
        .attr("fill", "rgb(0,0,0)");
    d3.select("#curtain")
        .append("text")
        .attr("id", "curtain_text")
        .attr("text-anchor", "middle")
        .attr("fill", "rgb(255,255,255)")
        .attr("x", display.scale * (display.regions.curtain.w / 2))
        .attr("y", display.scale * (display.regions.curtain.h / 2))
        .style("font-size", 6 * display.scale)
        .text("loading...");

    // Draw Title (TODO: something better, a real logo...)
    var title_unit = display.regions.title.h / 10;
    d3.select("#title")
        .append("text")
        .attr("x", 1 * title_unit * display.scale)
        .attr("y", 5.5 * title_unit * display.scale)
        .attr("font-size", display.scale * (display.regions.title.h / 2) + "px")
        .attr("fill", "rgb(255,255,255)")
        .attr("filter", "url(#highlight-glow)")
        .html("Nuclides.org");
    var subtitle = d3.select("#title")
        .append("text")
        .attr("x", 1 * title_unit * display.scale)
        .attr("y", 8 * title_unit * display.scale)
        .attr("font-size", (0.9 * title_unit * display.scale) + "px")
        .attr("fill", "rgb(127,127,127)")
        .attr("filter", "url(#soft-glow)")
        .style("font-style", "italic");
    subtitle.append("tspan").attr("x", 3 * title_unit * display.scale).attr("dy", 0)
        .text("The Periodic Table of Elements and the Chart of Nuclides");
    subtitle.append("tspan").attr("x", 6 * title_unit * display.scale).attr("dy", 1.3 * title_unit * display.scale)
        .text("Two sets of data, all known matter in the universe");
    
}

function renderApplication(callback){

    // Generate display variables for the current display area size
    setDisplayVars();

    // Draw Nav
    d3.select("#nav").append("g").attr("id","ghost_brackets");
    d3.select("#nav").append("g").attr("id","highlight_brackets");
    for (var button in display.regions.nav.regions){
        if (button == 'credit'){
            continue;
        }
        (function(button){
            // Draw nav graphic from external svg
            d3.xml("images/svg/"+button+".svg", "image/svg+xml", function(xml) {
                var importedNode = document.importNode(xml.documentElement, true);
                d3.select("#" + button + "_svg")
                    .append("g").attr("id",button + "_graphic")
                    .node().appendChild(importedNode);
                d3.select("#" + button + "_graphic")
                    .attr("transform", "scale(" + display.scale + ")");
            });
            // Draw nav title
            d3.select("#" + button).append("text")
                .attr("id", button + "_title")
                .attr("class", "nav_title")
                .attr("x", 22 * display.scale).attr("y", 8.5 * display.scale)
                .attr("textLength", 34 * display.scale).attr("lengthAdjust", "spacing")
                .attr("text-anchor", "middle")
                .attr("fill", "rgb(127,127,127)")
                .attr("filter", "url(#soft-glow)")
                .style("font-size", 5.5 * display.scale)
                .text(button.slice(0,1).toUpperCase() + button.slice(1));
            // Draw nav hitbox
            d3.select("#" + button).append("rect")
                .attr("id", button + "_hitbox")
                .attr("class", "hitbox")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", display.regions.nav.regions[button].w * display.scale)
                .attr("height", display.regions.nav.regions[button].h * display.scale);
            // Add event handlers
            d3.select('#' + button + "_hitbox")
                .on("mouseover", function(){
                    if (display.in_transition || display.current_layout == button){ return; }
                    d3.select("#ghost_brackets_" + button).attr("display", null);
                    d3.select("#" + button + "_title")
                        .attr("fill", "rgb(255,255,255)")
                        .attr("filter", "url(#highlight-glow)")
                })
                .on("mouseout", function(){
                    if (display.in_transition || display.current_layout == button){ return; }
                    d3.select("#ghost_brackets_" + button).attr("display", "none");
                    d3.select("#" + button + "_title")
                        .attr("fill", "rgb(127,127,127)")
                        .attr("filter", "url(#soft-glow)")
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

    // Draw Stage / Highlight Boxes
    // These are objects that provide a highlight in addition to objects themselves
    // First: a special group of rects to show visible highlight on element rows on the chart of nuclides
    d3.select("#stage").append("g")
        .attr("id", "nuclides_element_highlights");
    d3.select("#nuclides_element_highlights").selectAll(".highlightbox")
        .data(matter.elements)
        .enter().append("rect")
        .attr("id", function(d){ return "element_" + d.protons + "_highlightbox"; })
        .attr("class", "highlightbox")
        .attr("filter", "url(#highlight-glow)")
        .attr("width", function(d){
            var base = (display.layouts.nuclides.nuclide.w + display.layouts.nuclides.nuclide.m) * display.scale;
            return (d.neutron_spread * base) - (display.layouts.nuclides.nuclide.m * display.scale);
        })
        .attr("height", function(d){
            return display.layouts.nuclides.nuclide.w * display.scale;
        })
        .attr("transform", function(d){
            var nuclide = d.nuclides[d.min_neutrons]
            var x = display.layouts.nuclides.getNuclideX(nuclide);
            var y = display.layouts.nuclides.getNuclideY(nuclide);
            return "translate(" + x + "," + y + ")";
        })
        .attr("display", "none")
    // Second: an additional element rect for maintaining a highlight in the table on the element detail layout
    d3.select("#stage").append("rect")
        .attr("id", "floating_element_highlightbox")
        .attr("class", "highlightbox")
        .attr("filter", "url(#highlight-glow)")
        .attr("width", display.layouts.isotopes.element.w * display.scale)
        .attr("height", display.layouts.isotopes.element.w * display.scale)
        .attr("display", "none");

    // Draw Stage / Common Objects (those reused on more than one layout; e.g. info box, image boxes, etc.)
    var commons = d3.select("#stage").append("g").attr("id", "commons").attr("transform","translate(0,0)");
    commons.append("g")
        .attr("id", "info")
        .attr("transform","translate(0,0)")
        .append("text")
        .attr("id", "info_title")
        .attr("class", "info title");
    var image_w = display.layouts.elements.image.w * display.scale;
    var image_h = display.layouts.elements.image.h * display.scale;
    commons.append("clipPath")
        .attr("id", "image_clip")
        .append("rect").attr("id", "image_cliprect")
        .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
    var image = commons.append("g")
        .attr("id", "image")
        .attr("transform","translate(0,0)")
        .attr("clip-path", "url(#image_clip)");
    image.append("svg:image")
        .attr("id", "image_src")
        .attr("xlink:href", 'images/elements/sprite_map.png')
        .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", (matter.sprite_map_max + 1) * image_h);
    image.append("rect")
        .attr("id", "image_titlerect")
        .attr("class", "image title")
        .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h / 5);
    image.append("text")
        .attr("id", "image_title")
        .attr("class", "image title")
        .attr("x", 1.5 * display.scale)
        .attr("y", (image_h / 5) - (1.65 * display.scale))
        .attr("font-size", (image_h / 5) * 0.7 + "px");
    image.append("rect")
        .attr("id", "image_border")
        .attr("class", "info borderbox")
        .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
    display.setImage(1);
    commons.append("g")
        .attr("id", "extras");

    // Draw control elements (deprecated)
    d3.select("#credit").append("g")
        .attr("id", "controls")
        .attr("class", "controls");
    d3.select("#controls")
        .append("text")
        .attr("id", "main_control")
        .attr("x",10).attr("y",10).attr("dy", "2em")
        .html("Loading...");

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
            var x = display.layouts.elements.getElementX(d);
            var y = display.layouts.elements.getElementY(d);
            var transform = "translate(" + x + "," + y + ")";
            d3.select("#"+this.id)
                .append("g")
                .attr("id", display_id)
                .attr("class", "element_display e" + d.protons)
                .attr("transform", transform);
            d3.select("#" + display_id)
                .append("rect")
                .attr("class", "element_display e" + d.protons)
                .attr("width", display.layouts.elements.element.w * display.scale)
                .attr("height", display.layouts.elements.element.w * display.scale)
                .attr("fill", function(d){ return palette.element(d); })
                .style("opacity", 0)
                .transition().style("opacity",1).duration(800).delay(d.protons * 20);
            var label = d3.select("#" + display_id)
                .append("text")
                .attr("id", "element_" + d.protons + "_label")
                .attr("class", "element_display e" + d.protons)
                .attr("x", 0)
                .attr("y", 0);
            var label_unit = (display.layouts.elements.element.w / 10);
            var tspan = label.append("tspan")
                .attr("x", 1 * label_unit * display.scale)
                .attr("y", 8 * label_unit * display.scale)
                .style("font-size", 5 * label_unit * display.scale + "px")
                .text(d.symbol);
            if (d.symbol.length > 2){
                tspan.attr("textLength", 7 * label_unit * display.scale + "px").attr("lengthAdjust", "spacingAndGlyphs");
            }
            label.append("tspan")
                .attr("x", 9 * label_unit * display.scale)
                .attr("y", 3 * label_unit * display.scale)
                .attr("text-anchor", "end")
                .style("font-size", 2.5 * label_unit * display.scale + "px")
                .text(d.protons);
        });

    // Draw Stage / Nuclides
    dataset.append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclide_group'; })
        .attr("class", "nuclide_group")
        .each(function(d, i) {
            d3.select("#"+this.id).selectAll(".nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("g")
                .attr("class", function(d){ return "nuclide_display e" + d.protons + " n" + d.neutrons })
                .attr("id", function(d){ return 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display'; })
                .style("opacity", 0)
                .attr("transform", function(d){
                    var x = display.layouts.elements.getNuclideX(d);
                    var y = display.layouts.elements.getNuclideY(d);
                    return "translate("+x+","+y+")";
                })
                .each(function(d, i){
                    var element = matter.elements[d.protons];
                    var display_id = 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display';
                    d3.select("#"+display_id)
                        .append("rect")
                        .attr("class", function(d){ return "nuclide_display e" + d.protons + " n" + d.neutrons; })
                        .attr("width", display.layouts.elements.nuclide.w * display.scale)
                        .attr("height", display.layouts.elements.nuclide.w * display.scale)
                        .attr("fill", function(d){ return palette.nuclide(d); });
                    var label = d3.select("#" + display_id)
                        .append("text")
                        .attr("id", function(d){ return "element_" + d.protons + "_nuclides_" + d.neutrons + "_label"; })
                        .attr("class", function(d){ return "nuclide_display e" + d.protons + " n" + d.neutrons; })
                        .attr("x", 0)
                        .attr("y", 0)
                        .style("opacity",0);
                    var label_unit = (display.layouts.isotopes.nuclide.w * display.scale) / 10;
                    var tspan = label.append("tspan")
                        .attr("x", 4.1 * label_unit)
                        .attr("y", 7 * label_unit)
                        .style("font-size", 4 * label_unit + "px")
                        .text(element.symbol);
                    if (element.symbol.length > 2){
                        tspan.attr("textLength", 4 * label_unit + "px").attr("lengthAdjust", "spacingAndGlyphs");
                    }
                    var number = d.protons + d.neutrons;
                    var tspan2 = label.append("tspan")
                        .attr("x", 3.8 * label_unit)
                        .attr("y", 4 * label_unit)
                        .attr("text-anchor", "end")
                        .style("font-size", 2.5 * label_unit + "px")
                        .text(number);
                    if (number > 99){
                        tspan2.attr("textLength", 3.1 * label_unit + "px").attr("lengthAdjust", "spacingAndGlyphs");
                    }
                });
        });

    // Draw Stage / Zoom Nuclide
    // This is a special set of objects to appear when mousing over individual nuclides in the chart layout
    var w = display.layouts.nuclides.zoom_nuclide.w * display.scale;
    var label_unit = w / 10;
    var zoom_g = d3.select("#stage").append("g")
        .attr("id", "zoom_nuclide")
        .attr("class", "zoom_nuclide")
        .attr("transform","translate(0,0)")
        .style("display", "none");
    zoom_g.append("rect")
        .attr("id", "zoom_nuclide_main_display")
        .attr("class", "zoom_nuclide")
        .attr("width", w).attr("height", w)
        .attr("x", 0).attr("y", 0)
        .attr("filter", "url(#highlight-glow)");
    var zoom_label = zoom_g.append("text")
        .attr("class", "zoom_nuclide")
        .attr("x", 0).attr("y", 0);
    zoom_label.append("tspan")
        .attr("id", "zoom_nuclide_label_symbol")
        .attr("x", 4.1 * label_unit)
        .attr("y", 7 * label_unit)
        .style("font-size", 4 * label_unit + "px");
    zoom_label.append("tspan")
        .attr("id", "zoom_nuclide_label_number")
        .attr("x", 3.8 * label_unit)
        .attr("y", 4 * label_unit)
        .attr("text-anchor", "end")
        .style("font-size", 2.5 * label_unit + "px");
    var line_height = w / 2.4;
    var zoom_info = zoom_g.append("g")
        .attr("id", "zoom_nuclide_info")
        .attr("transform", "translate(0, 0)");
    zoom_info.append("rect")
        .attr("id", "zoom_nuclide_info_display")
        .attr("class", "zoom_nuclide")
        .attr("width", w * 6).attr("height", w * 2)
        .attr("x", 0).attr("y", w / -4)
        .attr("fill", "rgb(0,0,0)")
        .attr("filter", "url(#highlight-glow)");
    var zoom_info_text = zoom_info.append("text")
        .attr("class", "zoom_nuclide")
        .attr("x", 0).attr("y", 0);
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_name")
        .attr("class", "link")
        .attr("x", w / 6).attr("y", line_height / 1.9)
        .style("font-size", (line_height * 0.95) + "px")
        .text("");
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_protons")
        .attr("class", "em1")
        .attr("x", w / 6).attr("dy", line_height)
        .style("font-size", (line_height * 0.8) + "px")
        .text("Line 1 g");
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_neutrons")
        .attr("class", "em2")
        .attr("x", w / 6).attr("dy", line_height)
        .style("font-size", (line_height * 0.8) + "px")
        .text("Line 2 g");
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_halflife")
        .attr("class", "em3")
        .attr("x", w / 6).attr("dy", line_height)
        .style("font-size", (line_height * 0.8) + "px")
        .text("Line 3 g");

    // Draw Stage / Hitboxes
    d3.select("#stage").append("g")
        .attr("id", "hitboxes");
    d3.select("#hitboxes").selectAll(".hitbox")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons + "_hitbox_group"; })
        .attr("class", "element_hitbox_group");

    // Element hitboxes
    d3.selectAll(".element_hitbox_group")
        .append("rect")
        .attr("class", function(d){ return "hitbox element e" + d.protons; })
        .attr("width", 0).attr("height", 0).attr("transform", "translate(0,0)")
        .attr("display", "none")
        .on("mouseover", function(d){
            display.highlightElement(d, true);
        })
        .on("mouseout", function(d){
            display.highlightElement(d, false);
        })
        .on("click", function(d){
            transition.fire("isotopes", d.protons);
        });

    // Nuclide hitboxes
    d3.selectAll(".element_hitbox_group")
        .append("g")
        .attr("id", function(d){ return "element_" + d.protons + "_nuclide_hitbox_group"; })
        .attr("class", "nuclide_hitbox_group")
        .each(function(d, i) {
            d3.select("#"+this.id).selectAll(".hitbox.nuclide")
                .data( Object.keys(d.nuclides).map(function (key) {return d.nuclides[key]}) )
                .enter().append("rect")
                .attr("class", function(d){ return "hitbox nuclide e" + d.protons + " n" + d.neutrons })
                .attr("width", 0).attr("height", 0).attr("transform", "translate(0,0)")
                .attr("display", "none")
                .on("mouseover", function(d){
                    display.highlightNuclide(d, true);
                })
                .on("mouseout", function(d){
                    display.highlightNuclide(d, false);
                })
                .on("click", function(d){
                    transition.fire("isotopes", d.protons);
                });
        });

    // Fire a transition to the periodic table layout to complete loading
    transition.fire("elements");

    // Fire the callback to lift the curtain
    setTimeout(callback, 500 * display.transition_speed);

    /*
    setTimeout(function(){
        transition.fire("isotopes", 0);
    }, 500 * display.transition_speed);
    */

}
