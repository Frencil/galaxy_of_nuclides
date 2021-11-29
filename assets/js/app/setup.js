"use strict";

var cacheKey = "2021-11-28";

// Initialize master data object for matter
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
    nuclide_name_map: {},
    nuclideExists: function(protons, neutrons){
        if (typeof this.elements[protons] == 'undefined' || typeof this.elements[protons].nuclides[neutrons] == 'undefined'){
            return false;
        } else {
            return true;
        }
    }
};

// Initialize palette
var palette = new Palette();

// Initialize questions
var questions = new Questions();
questions.cache['setup'] = { title: "Loading...", scale: null };

// Primary setup function (chain of callbacks fired on page load)
function setup(){
    initializeApplication(function(){
        d3.select("#curtain_text").text("loading...");
        loadElements(function(){
            d3.select("#curtain_text").text("loading....");
            loadNuclides(function(){
                d3.select("#curtain_text").text("loading.....");
                renderApplication(function(){
                    questions.finalize();
                    display.transition_speed = 0.8;
                    d3.select("#curtain_text").text("welcome!");
                    d3.select("#curtain").transition().duration(1000).style("opacity",0);
                    d3.timer(function(){
                        d3.select("#curtain").style("display", "none");
                        return true;
                    }, 1100);
                });
            });
        });
    });
}

function loadElements(callback) {
    d3.csv("assets/data/elements.csv?r=" + cacheKey, function(d) {
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
    d3.csv("assets/data/nuclides.csv?r=" + cacheKey, function(d) {
        var n = new Nuclide().setProtons(d.protons).setNeutrons(d.neutrons).setHalflife(d.halflife);
        if (typeof d.caption != "undefined"){ n.setCaption(d.caption); }
        return n;
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

    questions.current = questions.cache.setup;

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
    d3.xml("assets/images/svg/logo.svg", "image/svg+xml", function(xml) {
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

    // Set elapsed time
    display.setElapsedTimeExp(null);

    // Parse the URL to determine which question to load first.
    // Default to "What is Nuclides.org?"
    var url = questions.parseUrl();
    if (url.id != null){
        if (url.element != null){ display.next_element = url.element; }
        questions.call(url.id, callback);
    } else {
        questions.call("what_is_nuclides_org", callback);
    }

}

// Listen for popstate events (users navigating history through browser controls)
// to make that navigation work as expected
window.onpopstate = function(event) {
    if (typeof event.state == "object"){
        if (typeof event.state.question == "string"){
            questions.call(event.state.question, function(){
                questions.finalize(true);
            });
        }
    }
};
