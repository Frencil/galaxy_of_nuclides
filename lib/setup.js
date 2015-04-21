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

// Primary setup function (chain of callbacks fired on page load)
function setup(){
    initializeApplication(function(){
        d3.select("#curtain_text").text("loading...");
        loadElements(function(){
            d3.select("#curtain_text").text("loading....");
            loadNuclides(function(){
                d3.select("#curtain_text").text("loading.....");
                renderApplication(function(){
                    d3.select("#curtain_text").text("welcome!");
                    d3.select("#curtain").transition().duration(1000).style("opacity",0);
                    setTimeout(function(){ d3.select("#curtain").style("display", "none"); }, 1100);
                    display.in_transition = false;
		                d3.select("#main_control").html("Ready.");
                });
            });
        });
    });
}

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

function initializeApplication(callback){

    // Determine scale
    display.available_width = window.innerWidth
        || document.documentElement.clientWidth
        || document.getElementsByTagName('body')[0].clientWidth;
    display.available_height = window.innerHeight
        || document.documentElement.clientHeight
        || document.getElementsByTagName('body')[0].clientHeight;
    display.scale = Math.max( Math.min( display.available_width / display.area.w,
                                        display.available_height / display.area.h ), 1 );

    // Size the total SVG area and purge all top-level <g>
    d3.select("#galaxy_of_nuclides")
        .style("width", (display.area.w * display.scale) + "px")
        .style("height", (display.area.h * display.scale) + "px");
    d3.selectAll("g").remove();

    // Initialize all defined regions
    var initRegions = function(regions, parent){
        for (var region in regions){
            (function(region){
                var r = regions[region];
                var translate = "translate(" + r.x * display.scale + ","
                                             + r.y * display.scale + ")";
                d3.select(parent).append("g")
                    .attr("id", region)
                    .attr("transform", translate);
                if (r.regions !== undefined){
                    initRegions(r.regions, '#' + region);
                }
            })(region);            
        }
    };
    initRegions(display.regions, "svg");

    // Draw the curtain
    display.regions.curtain.draw();

    // Load the logo and render the title
    d3.xml("images/svg/logo.svg", "image/svg+xml", function(xml) {
        var logo_svg = document.importNode(xml.documentElement, true);
        display.regions.title.draw(logo_svg);
        callback();
    });
    
}

function renderApplication(callback){

    // Fire all defined draw methods for regions
    // NOTE: skip title and curtain since those are called ahead of time in initializeApplication()
    var drawRegions = function(regions, parent){
        for (var region in regions){
            (function(region){
                var r = regions[region];
                if (region != 'title' && region != 'curtain'){
                    if (typeof r.init == "function"){ r.init(); }
                    if (typeof r.draw == "function"){ r.draw(); }
                }
                if (r.regions !== undefined){
                    drawRegions(r.regions, '#' + region);
                }
            })(region);
        }
    };
    drawRegions(display.regions, "svg");

    // Fire a transition to the periodic table layout to complete loading
    transition.fire("elements");

    // Set elapsed time
    display.setElapsedTimeExp(null);

    // Fire the callback to lift the curtain
    // TODO: Chain this with drawRegions above to actually fire as soon as everything is done drawing
    setTimeout(callback, 500 * display.transition_speed);

    /*
    setTimeout(function(){
        transition.fire("isotopes", 83);
    }, 1000 * display.transition_speed);
    */

}
