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

// Initialize object for working with questions
var questions = {
    // Current and next: references to the currently shown question and the next in transition
    current: null,
    next: null,
    // Object for storing all questions that get loaded
    cache: {
        setup: {
            title: "Loading...",
            scale: null
        }
    },
    titleToID: function(question_title){
        return question_title.toLowerCase().replace("?","").replace(/\W/g,"_");
    },
    // Call up a question, as in load it into the interface start-to-finish
    call: function(question_id, callback){
        if (typeof callback == 'undefined'){
            callback = function(){ questions.finalize(); };
        }
        if (question_id != this.titleToID(question_id)){
            console.log("Attempted to call invalid question ID: " + question_id);
            callback();
        }
        // Interrupt all in-progress transitions and null out the next question
        d3.select("#stage").selectAll("*").interrupt();
        this.next = null;
        // Fetch the question
        (function(callback){
            questions.fetch(question_id, function(){
                if (questions.next == null){
                    console.log("Error - unable to fetch question: " + question_id);
                    callback()
                } else {
                    // Unload the current and load the next question
                    questions.unloadCurrent();
                    d3.timer(function(){
                        // Set Title
                        d3.select("#question_title").text(questions.next.title);
                        // Show or hide full data sets as needed
                        var pt = (typeof questions.next.periodic_table == 'object');
                        var cn = (typeof questions.next.chart_of_nuclides == 'object');
                        if (!pt){ display.hidePeriodicTable(); }
                        if (!cn){ display.hideChartOfNuclides(); }
                        if (pt){ display.showPeriodicTable(questions.next.periodic_table); }
                        if (cn){ display.showChartOfNuclides(questions.next.chart_of_nuclides); }
                        // Show captions, components, and specifics
                        display.showCaptions();
                        display.showComponents();
                        display.fadeIn(d3.select("#specifics"), 500);
                        // Set the correct scale
                        if (questions.current.scale != questions.next.scale){
                            display.fadeOut(d3.select("#key_" + questions.current.scale + "_scale"), 500);
                            display.fadeIn(d3.select("#key_" + questions.next.scale + "_scale"), 500);
                        }
                        // Call the next question's load() method
                        questions.next.load(callback);
                        return true;
                    }, 1000 * display.transition_speed);
                }
            });
        })(callback);
    },
    // Fetch a question (either from server or cache) and load into this.next
    fetch: function(question_id, callback){
        if (question_id != this.titleToID(question_id)){
            console.log("Attempted to fetch invalid question ID: " + question_id);
            callback();
        }
        if (typeof this.cache[question_id] != "undefined"){
            this.next = this.cache[question_id];
            callback();
        } else {
            (function(question_id, callback){
                questions.loadScript('questions/' + question_id + '.js', function(){
                    questions.next = questions.cache[question_id];
                    callback();
                });
            })(question_id, callback);
        }
    },
    // Load a script from the server and plop it into the DOM
    loadScript: function(src, callback) {
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = callback;
        script.onreadystatechange = function() {
            if (this.readyState == 'complete') { callback(); }
        }
        head.appendChild(script);
    },
    // Unload the current question
    unloadCurrent: function(){
        if (display.transition_speed > 0){
            display.fadeOut(d3.select("#captions"), 500);
            display.fadeOut(d3.select("#specifics"), 500);
            display.fadeOut(d3.select("#components"), 500);
            d3.timer(function(){
                d3.select("#captions").selectAll("*").remove();
                d3.select("#specifics").selectAll("*").remove();
                d3.select("#components").selectAll("g.component").style("display", "none");
                return true;
            }, 500 * display.transition_speed);
        } else {
            d3.select("#captions").selectAll("*").remove();
            d3.select("#specifics").selectAll("*").remove();
            d3.select("#components").selectAll("g.component").style("display", "none");
        }
    },
    // Complete the transition to a new question
    finalize: function(){
        questions.current = questions.next;
        questions.next = null;
        display.showQuestions(questions.current.questions);
    }
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
                    display.loading = false;
                    display.transition_speed = 0.8;
                    d3.select("#curtain_text").text("welcome!");
                    d3.select("#curtain").transition().duration(1000).style("opacity",0);
                    d3.timer(function(){
                        d3.select("#curtain").style("display", "none");
                        return true;
                    }, 1100);
                    display.in_transition = false;
                    questions.finalize();
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

    // Set elapsed time
    display.setElapsedTimeExp(null);

    // Parse the URL to determine which question to load first.
    // Default to "What is Nuclides.org?"
    var first_question = "what_is_the_periodic_table";
    if (window.location.search.length > 0){
        // ...parse
    }
    
    // Load the first question
    questions.call(first_question, callback);

    /*
    // Fire a transition to the periodic table layout (base)
    transition.fire("elements", null, function(){
        // Detect layouts passed in the URL and pull those up if valid
        var trans = { layout: null, focus: null, valid: false };
        if (window.location.search.length != 0){
            switch (window.location.search.slice(1)){
            case 'nuclides':
                trans.layout = "nuclides";
                trans.valid  = true;
                break;
            case 'isotopes':
                trans.layout = "isotopes";
                var focus = parseInt(window.location.hash.slice(1));
                if (typeof matter.elements[focus] != "undefined"){
                    trans.focus = focus;
                    trans.valid = true;
                }
                break;
            }
        }
        if (trans.valid){
            transition.fire(trans.layout, trans.focus, callback);
        } else {
            callback();
        }
    });
    */

}
