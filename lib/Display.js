"use strict";

// Initialize master data object for display variables
var display = {

    // Scale is an integer value to allow for discrete geometric
    // scaling of the application for different viewport sizes
    scale: 1,

    available_width:  0,
    available_height: 0,

    nuclides_per_row: 0,

    // proton values for whichever element currently shown (or to be shown next) in the "What is {$element}?" question
    current_element: null,
    next_element:    null,

    // Multiplier used for transition timing (set to default value in setup)
    transition_speed: 0,

    // All top-level regions represent areas of the canvas at their
    // smallest resolution, with optimal resolutions being integer
    // multiples of everything
    area: { w: 256, h: 160 },
    regions: {
        
        // questions - show dynamic list of question links as main navigation
        questions: {
            x: 0, y: 28, w: 44, h: 108,
            regions: {
                credit:   { x: 0, y: 108, w: 44, h: 24 }
            }
        },
        
        // key Object for showing dataset scales and related UI
        key: {
            x: 192, y: 0, w: 64, h: 160,
            regions: {
                detail: { x: 0, y: 0, w: 44, h: 28 },
                slider: { x: 44, y: 0, w: 20, h: 160 }
            }
        },
        
        // Stage: Main object for displaying data
        stage: { x: 44, y: 28, w: 192, h: 132 },

        // Curtain: Object for covering everything but title during initial rendering
        curtain: { x: 0, y: 0, w: 256, h: 160 },

        // Title: Area for banner title
        title: { x: 0, y: 0, w: 192, h: 28 }
        
    },

    components: {
        thumbnail: { w: 1, h: 1 },
        nuclide_hover: { w: 50, h: 18 }
    },

    parseTransform: function(node){
        var transform = node.attr("transform").match(/\d+\.*\d*/g);
        for (var t in transform){ transform[t] = parseFloat(transform[t]); }
        return transform;
    },

    // Fade functions: transition opacity bookended by setting display style for performance
    fadeIn: function(selection, delay){
        if (typeof delay != 'number'){ var delay = 0 }
        selection.style("opacity", 0).style("display", null);
        selection.transition().delay(delay * display.transition_speed).style("opacity", 1);
    },
    fadeOut: function(selection, delay){
        if (typeof delay != 'number'){ var delay = 0 }
        selection.transition().delay(delay * display.transition_speed).style("opacity", 0);
        (function(selection, delay){
            d3.timer(function(){
                selection.style("display", "none");
                return true;
            }, delay * display.transition_speed);
        })(selection, delay);
    },

    // Periodic Table Helper Functions
    periodic_table: {
        getElementCoords: function(element, settings){
            var base  = display.scale * (settings.element.w + settings.element.m);
            var x     = display.scale * settings.origin.x;
            var y     = display.scale * settings.origin.y;
            if (element.group > 18){
                x += (element.group - 17) * base;
                y += (element.period + 2) * base;
            } else if (element.group == 0) {
                y -= 1.5 * base;
            } else {
                x += (element.group - 1) * base;
                y += (element.period - 1) * base;
            }
            return [x, y];
        },
        getNuclideCoords: function(nuclide, settings){
            var base   = display.scale * (settings.nuclide.w + settings.nuclide.m);
            var origin = display.periodic_table.getElementCoords(nuclide.parentElement, settings);
            var index  = nuclide.neutrons - nuclide.parentElement.min_neutrons;
            var x = origin[0] + (index % display.nuclides_per_row) * base;
            var y = origin[1] + Math.floor(index / display.nuclides_per_row) * base;
            return [x, y];
        }
    },

    chart_of_nuclides: {
        getNuclideCoords: function(nuclide, settings){
            var base = display.scale * (settings.nuclide.w + settings.nuclide.m);
            var x = display.scale * settings.origin.x + nuclide.neutrons * base;
            var y = display.scale * settings.origin.y + (120 - nuclide.protons) * base;
            return [x, y];
        }
    },

    isotopes_grid: {
        getNuclideCoords: function(nuclide, settings){
            var base   = display.scale * (settings.nuclide.w + settings.nuclide.m);
            var origin = [ display.scale * settings.origin.x, display.scale * settings.origin.y ];
            var index  = nuclide.neutrons - nuclide.parentElement.min_neutrons;
            var x = origin[0] + (index % display.nuclides_per_row) * base;
            var y = origin[1] + Math.floor(index / display.nuclides_per_row) * base;
            return [x, y];
        }
    },

    showDataset: function(data_type, override_settings){
         var settings = {
            origin:  { x: 0, y: 0 },
            element: { w: 0, m: 0 },
            nuclide: { w: 0, m: 0 },
            show_labels: false,
            transition: { duration: 0, delay: 0 },
            coordsFunction: display.periodic_table.getElementCoords
        }
        if (typeof override_settings == 'object'){
            for (var s in override_settings){
                settings[s] = override_settings[s];
            }
        }
        var subclass = '';
        if (typeof settings.next_element != 'undefined'){
            if (settings.next_element == 'display'){
                subclass = '.e' + display.next_element;
            } else {
                subclass = '.e' + settings.next_element;
            }
        }

        // Position, scale, and show data type groups
        d3.selectAll("g." + data_type + subclass).style("display", null);
        d3.selectAll("g." + data_type + subclass).transition()
            .delay(settings.transition.delay * display.transition_speed)
            .duration(settings.transition.duration * display.transition_speed)
            .attr("transform", function(d){
                var coords = settings.coordsFunction(d, settings);
                var scale = settings[data_type].w * display.scale;
                return "translate(" + coords[0] + "," + coords[1] + ") scale(" + scale + ")";
            }).style("opacity", 1);
        
        // Show data type labels
        if (settings.show_labels){
            display.fadeIn(d3.selectAll("text." + data_type + subclass), settings.transition.duration);
        } else {
            display.fadeOut(d3.selectAll("text." + data_type + subclass), settings.transition.duration);
        }
        
        // Position and scale data type hitboxes
        var w = display.scale * (settings[data_type].w + settings[data_type].m);
        d3.selectAll("rect.hitbox." + data_type + subclass)
            .style("display", null)
            .attr("width", w).attr("height", w)
            .attr("transform", function(d){
                var coords = settings.coordsFunction(d, settings);
                return "translate(" + coords[0] + "," + coords[1] + ")";
            });
    },

    hideDataset: function(data_type){
        d3.selectAll("rect.hitbox." + data_type).style("display", "none");
        d3.selectAll("text." + data_type).style("display", "none");
        d3.selectAll("g." + data_type).style("display", "none");
    },

    setTitle: function(){
        var title = questions.next.title;
        // Special handling for specific element pages
        if (questions.next.element_specific){
            title = 'What is ' + matter.elements[display.next_element].name + '?';
        }
        d3.select("#question_title").text(title);
    },

    setCaptions: function(){
        display.fadeIn(d3.select("#captions"), 500);
        // Sanity check
        if (typeof duration != "number"){ var duration = 0; }
        if (typeof delay != "number"){ var delay = 0; }
        if (typeof stagger_delay != "number"){ var stagger_delay = 0; }
        // Position and display captions
        var captions = questions.next.captions;
        if (questions.next.element_specific){
            captions[0].copy = matter.elements[display.next_element].caption;
        }
        for (var c = 0; c < questions.next.captions.length; c++){
            var caption = questions.next.captions[c];
            var text_node = d3.select("#captions").append("text")
                .attr("class", "caption")
                .style("font-size", (caption.line_height * 0.85 * display.scale) + "px")
                .style("opacity", 0);
            new Caption().text(caption.copy).x(caption.x).y(caption.y).lineHeight(caption.line_height).appendTo(text_node);
            text_node.transition()
                .delay((delay + stagger_delay * c) * display.transition_speed)
                .duration(duration * display.transition_speed)
                .style("opacity", 1);
        }
    },

    setComponents: function(){
        display.fadeIn(d3.select("#components"), 500);
        // Sanity check
        if (typeof duration != "number"){ var duration = 0; }
        if (typeof delay != "number"){ var delay = 0; }
        if (typeof stagger_delay != "number"){ var stagger_delay = 0; }
        // Position and display components
        var i = 0;
        for (var c in questions.next.components){
            var component = questions.next.components[c];
            var node = d3.select("#" + c);
            node.style("display", null);
            node.attr("transform", "translate(" + (component.x * display.scale) + "," + (component.y * display.scale) + ")");
            node.transition()
                .delay((delay + stagger_delay * i) * display.transition_speed)
                .duration(duration * display.transition_speed)
                .style("opacity", 1);
            i++;
        }
    },

    setQuestions: function(){
        d3.select("#qlist").selectAll("tspan").remove();
        for (var q in questions.next.questions){
            var question = questions.next.questions[q];
            (function(q, question){
                var id = questions.titleToID(question);
                var text = [];
                var max_line_length = 35;
                while (question.length > 0){
                    if (question.length <= max_line_length){
                        text.push(question);
                        question = '';
                    } else {
                        var idx = question.slice(0,max_line_length).lastIndexOf(" ");
                        text.push(question.slice(0, idx).trim());
                        question = question.slice(idx).trim();
                    }
                }
                for (var t in text){
                    var dy = ((q > 0 && t == 0 ? 1 : 0) * 7 * display.scale) + (t > 0 ? 1 : 0) * 3.2 * display.scale
                    var tspan = d3.select("#qlist").append("tspan")
                        .attr("class", "qhref").attr("x", 1.5 * display.scale).attr("dy", dy)
                        .style("font-size", (2.5 * display.scale) + "px")
                        .text(text[t])
                        .on("click", function(){ questions.call(id); });
                }
            })(q, question);
        }
    },

    setScale: function(){
        if (questions.current.scale != questions.next.scale){
            display.fadeOut(d3.select("#key_" + questions.current.scale + "_scale"), 500 * display.transition_speed);
            display.fadeIn(d3.select("#key_" + questions.next.scale + "_scale"), 500 * display.transition_speed);
            if (questions.next.scale == "element"){
                display.fadeOut(d3.select("#key_elapsed_time"), 500 * display.transition_speed);
            } else {
                display.fadeIn(d3.select("#key_elapsed_time"), 500 * display.transition_speed);
            }
        }
    },

    highlightElement: function(element, bool){
        if (element == null || bool == false){
            d3.select("#element_highlightbox").style("display", "none");
            if (display.current_element != null){ display.setThumbnail(display.current_element); }
            return;
        } else {
            var transform = display.parseTransform(d3.select("#element_" + element.protons + "_display"));
            var x = transform[0];
            var y = transform[1];
            var w = transform[2];
            d3.select("#element_highlightbox").style("display", "block")
                .attr("x", x).attr("y", y).attr("width", w).attr("height", w);
            display.setThumbnail(element.protons);
            return;
        }
    },

    highlightNuclide: function(nuclide, bool){
        if (nuclide == null || bool == false){
            display.setNuclideHover(null);
            d3.select("#nuclide_highlightbox").style("display", "none");
            d3.select("#nuclide_row_highlightbox").style("display", "none");
        } else {
            display.setNuclideHover(nuclide);
            var transform = display.parseTransform(d3.select("#element_" + nuclide.protons + "_nuclide_" + nuclide.neutrons + "_display"));
            var x = transform[0];
            var y = transform[1];
            var w = transform[2];
            d3.select("#nuclide_highlightbox").style("display", "block")
                .attr("x", x).attr("y", y).attr("width", w).attr("height", w);
            display.setThumbnail(nuclide.protons);
            if (typeof questions.current.chart_of_nuclides != "undefined"){
                if (questions.current.chart_of_nuclides.highlight_row){
                    var m = (w / questions.current.chart_of_nuclides.nuclide.w) * questions.current.chart_of_nuclides.nuclide.m;
                    var row_x = x - ((nuclide.neutrons - nuclide.parentElement.min_neutrons) * (w + m));
                    var row_w = (nuclide.parentElement.neutron_spread * (w + m)) - m;
                    d3.select("#nuclide_row_highlightbox").style("display", "block")
                        .attr("x", row_x).attr("y", y).attr("width", row_w).attr("height", w);
                }
            }
        }
        display.highlightElement(nuclide.parentElement, bool);
        return;
    },

    setNuclideHover: function(nuclide){

        if (nuclide == null){
            d3.select("#nuclide_hover").style("display", "none");
            return;
        } else {
            // Initial vars
            var node = d3.select("#element_" + nuclide.protons + "_nuclide_" + nuclide.neutrons + "_display");
            if (node.style("display") == "none"){
                d3.select("#nuclide_hover").style("display", "none");
                return;
            }
            var w = display.components.nuclide_hover.w * display.scale;
            var h = display.components.nuclide_hover.h * display.scale;
            var transform = display.parseTransform(node);

            // Set caption
            var u = (h / display.scale) / 10;
            var caption = "[em4]" + nuclide.parentElement.name + '-' + (nuclide.protons + nuclide.neutrons) + "[em4][br]"
                        + "[em3]Protons: " + nuclide.protons + "[em3][br]"
                        + "[em1]Neutrons: " + nuclide.neutrons + "[em1][br]"
                        + "[em2]Half-life: " + nuclide.halflife.repNumerical() + "[em2]";
            new Caption().text(caption).x(u).y(0).lineHeight(2.2 * u)
                .appendTo(d3.select("#nuclide_hover_info"));

            // Position and show
            var x_limit = (display.regions.stage.w + display.regions.key.regions.slider.w) * display.scale;
            var x = transform[0] + (transform[2] * 1.1);
            if ((x + w) > x_limit){
                x = transform[0] - w - (transform[2] * 0.1)
            }
            var y = transform[1] - (h / 4);
            d3.select("#nuclide_hover").attr("transform", "translate(" + x + ", " + y + ")").style("display", null);
        }
    },

    // Set thumbnail image and title
    setThumbnail: function(protons){
        var offset = 0;
        var title = "";
        if (typeof matter.elements[protons] == "object"){
            title = protons + " - " + matter.elements[protons].name + " (" + matter.elements[protons].symbol + ")";
            if (matter.elements[protons].has_image){
                offset = protons;
            }
        }
        var h = 29 * display.scale;
        d3.select("#thumbnail_src").attr("y", 0 - (offset * h) + (h / 10));
        d3.select("#thumbnail_title").text(title);
    },

    // Elapsed time exponent, controlled by the time slider, alters appearance of nuclides based on half-lives
    // The set function for it redeclares various fill functions to show the effect of its change
    // TODO: make display.elapsed_time an instance of Time
    elapsed_time_exp: null,
    setElapsedTimeExp: function(value){

        // Update the value and redeclare nuclide styles
        if (value != null){
            value = parseInt(value);
            if (isNaN(value)){ return; }
            value = Math.max(value, matter.min_halflife_exp - 1);
            value = Math.min(value, matter.max_halflife_exp - 1);
        }
        this.elapsed_time_exp = value;
        d3.selectAll("rect.nuclide").attr("fill", function(d){ return palette.nuclide(d); });
        d3.selectAll("text.nuclide").attr("fill", function(d){ return palette.nuclideLabel(d); });

        // Set the numerical value for elapsed time
        d3.select("#key_elapsed_time_numerical").selectAll("tspan").remove();
        var t = new Time(1, this.elapsed_time_exp);
        var numerical = '[em3]None[em3][sml] (change with the slider →)[sml]';
        if (this.elapsed_time_exp != null){
            numerical = '[em3]' + t.repNumerical() + '[em3]';
        }
        new Caption().text(numerical).x(2.5).y(10).lineHeight(0).appendTo(d3.select("#key_elapsed_time_numerical"));

        // Set the caption value for elapsed time
        d3.select("#key_elapsed_time_caption").selectAll("tspan").remove();
        if (this.elapsed_time_exp != null){
            var prefixed = t.repPrefixed();
            var analogy = t.repAnalogy();
            var caption = "";
            if (prefixed.length > 0){
                caption += "(" + prefixed + ")";
            }
            if (analogy.length){
                caption += (caption.length > 0 ? "[br]" : "") + analogy;
            }
            if (caption.length){
                new Caption().text(caption).x(2.5).y(11).lineHeight(3).appendTo(d3.select("#key_elapsed_time_caption"));
            }
        }
    }

};

/*******************************************
  Define init() methods for various regions
********************************************/

// Stage / Init
display.regions.stage.init = function(){
    display.nuclides_per_row = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));
};

// Key / Init
display.regions.key.init = function(){

    display.time_slider = { w: 14, h: 3 };

    display.time_slider.y_margin      = 15 * display.scale;
    display.time_slider.slider_height = 3 * display.scale;
    display.time_slider.slider_width  = 14 * display.scale;
    display.time_slider.x_origin      = ((display.regions.key.regions.slider.w / 2) * display.scale) - (display.time_slider.slider_width / 2);
    display.time_slider.y_min = display.time_slider.y_margin - (display.time_slider.slider_height / 2);
    display.time_slider.y_max = (display.regions.key.regions.slider.h * display.scale) - (display.time_slider.y_margin + 0.5 * display.time_slider.slider_height);

    display.time_slider.x = display.time_slider.x_origin;
    display.time_slider.y = display.time_slider.y_min;

    display.time_slider.slideTo = function(y, dragging){
        // Set state variables
        if (dragging){
            y = Math.min(Math.max(y, display.time_slider.y_min), display.time_slider.y_max);
        } else if (y < display.time_slider.y_min || y > display.time_slider.y_max){
            return;
        }
        display.time_slider.highlightSlider(true);
        display.time_slider.y = y;
        // Reposition the slider
        d3.select("#time_slider_handle").attr("y", display.time_slider.y);
        d3.select("#time_slider_shadow").attr("height", display.time_slider.y - display.time_slider.y_min);
        // Set elapsed time
        var new_elapsed_time_exp = null;
        if (display.time_slider.y > display.time_slider.y_min){
            new_elapsed_time_exp =
                matter.min_halflife_exp
                + (matter.max_halflife_exp - matter.min_halflife_exp)
                * (display.time_slider.y - display.time_slider.y_min) / (display.time_slider.y_max - display.time_slider.y_min);
        }
        display.setElapsedTimeExp(new_elapsed_time_exp);
    };

    display.time_slider.drag = function(dragging){
        if (typeof d3.event.y == "undefined"){
            var use_y = d3.event.clientY;
        } else {
            var use_y = d3.event.y;
        }
        var y = use_y - (display.time_slider.slider_height / 2);
        display.time_slider.slideTo(y, dragging);
    }

    display.time_slider.highlightSlider = function(bool){
        if (bool){
            d3.select("#time_slider_handle")
                .attr("fill", "url(#slider_gradient_highlight)")
                .attr("filter", "url(#highlight-glow)");
        } else {
            d3.select("#time_slider_handle")
                .attr("fill", "url(#slider_gradient)")
                .attr("filter", null);
        }
    };

};


/*******************************************
  Define draw() methods for various regions
********************************************/

// Draw Title
display.regions.title.draw = function(logo_svg){
    var title_unit = (display.regions.title.h / 10) * display.scale;
    var title_scale = display.scale * ((display.regions.title.h / 64) * 0.8) // note: the logo is 64x64 for use as a favicon
    d3.select("#title").append("title").text("Nuclides.org - Interactively explore the elements, nuclides, and isotopes");
    d3.select("#title").append("desc").text("The Periodic Table of Elements and the Chart of Nuclides: Two sets of data, all known matter in the universe");
    d3.select("#title").append("g")
        .attr("id","title_svg")
        .attr("transform", "scale(" + title_scale + ") translate(0, " + (0.5 * title_unit) + ")")
        .node().appendChild(logo_svg);
    d3.select("#title")
        .append("text")
        .attr("x", 8 * title_unit)
        .attr("y", 5.25 * title_unit)
        .attr("font-size", (5 * title_unit) + "px")
        .attr("fill", "rgb(255,255,255)")
        .attr("filter", "url(#highlight-glow)")
        .text("Nuclides.org");
    var subtitle = d3.select("#title")
        .append("text")
        .attr("y", 7.1 * title_unit)
        .attr("font-size", (0.9 * title_unit) + "px")
        .attr("fill", "rgb(127,127,127)")
        .style("font-style", "italic");
    subtitle.append("tspan").attr("x", 9 * title_unit).attr("dy", 0)
        .text("The Periodic Table of Elements and the Chart of Nuclides");
    subtitle.append("tspan").attr("x", 12 * title_unit).attr("dy", 1.3 * title_unit)
        .text("Two sets of data, all known matter in the universe");
}

// Draw Curtain
display.regions.curtain.draw = function(){
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
        .style("font-size", (6 * display.scale) + "px")
        .text("loading..");
}

// Draw Questions
display.regions.questions.draw = function(){
    d3.select("#questions").append("path")
        .attr("d",pathString([44, 0, 44, 131]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    d3.select("#questions").append("path")
        .attr("d",pathString([0, 6, 44, 6]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    d3.select("#questions").append("path")
        .attr("d",pathString([0, 108, 44, 108]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    d3.select("#questions").append("text").append("tspan")
        .attr("class", "qhref")
        .attr("x", 1.5 * display.scale).attr("y", 3 * display.scale)
        .style("font-size", (3 * display.scale) + "px")
        .style("font-weight", "bold")
        .text("What is Nuclides.org?")
        .on("click", function(){
            questions.call("what_is_nuclides_org");
        });
    d3.select("#questions").append("text")
        .attr("id", "qlist").attr("y", 11.5 * display.scale);
};

// Draw Questions / Credit
display.regions.questions.regions.credit.draw = function(){
    var x = 1.5 * display.scale;
    var credit = d3.select("#credit").append("text")
        .attr("class", "credit")
        .attr("x", 0).attr("y", 0);
    credit.append("tspan")
        .attr("x", x).attr("y", 3.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("Data provided by Brookhaven Nat'l Laboratory")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", x).attr("dy", 2.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("http://www.nndc.bnl.gov/")
        .on("click", function(){ document.getElementById("credit_brookhaven").click(); });
    credit.append("tspan")
        .attr("x", x).attr("dy", 3.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("Images provided by Images-of-Elements.com")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", x).attr("dy", 2.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("http://images-of-elements.com/")
        .on("click", function(){ document.getElementById("credit_imagesofelements").click(); });
    credit.append("tspan")
        .attr("x", x).attr("dy", 3.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("Developed, maintained, and open sourced by")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", x).attr("dy", 2.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("Christopher Clark (Frencil)")
        .on("click", function(){ document.getElementById("credit_frencil").click(); });
    credit.append("tspan")
        .attr("x", x).attr("dy", 3.5 * display.scale)
        .style("font-size", (1.7 * display.scale) + "px")
        .text("© Copyright " + new Date().getFullYear() + " Nuclides.org • ");
    credit.append("tspan")
        .attr("class", "credit href")
        .style("font-size", (1.7 * display.scale) + "px")
        .text("About Nuclides.org")
        .on("click", function(){ document.getElementById("link_repo").click(); });
};

// Draw Key
display.regions.key.draw = function(){
    var key_brackets = d3.select("#key").append("g").attr("id", "key_brackets");
    key_brackets.append("path")
        .attr("d",pathString([3, 1, 1, 1, 1, 27, 3, 27]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    key_brackets.append("path")
        .attr("d",pathString([41, 1, 43, 1, 43, 27, 41, 27]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    key_brackets.append("path")
        .attr("d",pathString([47, 1, 45, 1, 45, 159, 47, 159]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    key_brackets.append("path")
        .attr("d",pathString([61, 1, 63, 1, 63, 159, 61, 159]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    key_brackets.append("path")
        .attr("d",pathString([43, 13, 45, 13]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
    key_brackets.append("path")
        .attr("d",pathString([43, 14, 45, 14]))
        .attr("stroke","#FFFFFF").style("stroke-width","1")
        .attr("fill","none");
};

// Draw Key / Detail
display.regions.key.regions.detail.draw = function(){
    var g = d3.select("#detail").append("g").attr("id","key_elapsed_time");
    g.append("text")
        .attr("fill", "rgb(255,255,255)")
        .style("font-size", (3.5 * display.scale) + "px")
        .attr("x", 2.5 * display.scale).attr("y", 5.5 * display.scale)
        .text("Elapsed Time:");
    g.append("text")
        .attr("id", "key_elapsed_time_numerical")
        .attr("fill", "rgb(255,255,255)")
        .style("font-size", (3 * display.scale) + "px")
        .attr("x", 2.5 * display.scale).attr("y", 10 * display.scale)
        //.append("tspan").text("none"); // (change with the slider →)
    g.append("text")
        .attr("id", "key_elapsed_time_caption")
        .attr("fill", "rgb(255,255,255)")
        .style("font-size", (2 * display.scale) + "px")
        .style("font-style", "italic")
        .attr("x", 2.5 * display.scale).attr("y", 14 * display.scale);
};

// Draw Key / Slider
display.regions.key.regions.slider.draw = function(){

    var y_margin = 15; // units on top and bottom of scales (also governs slider y-bounds)
    var region_w = display.regions.key.regions.slider.w;
    var region_h = display.regions.key.regions.slider.h;
    var scale_w = 6;
    var scale_h = region_h - (2 * y_margin);
    var scale_x = ((region_w / 2) - scale_w) * display.scale

    // Add drag capture to the entire region
    var drag = d3.behavior.drag()
        .on("drag", function(d) { display.time_slider.drag(true); });
    d3.select("#slider").call(drag)
        .on("click", function(d) { display.time_slider.drag(false); });

    // Draw Element Scale
    var escale = d3.select("#slider").append("g")
        .attr("id", "key_element_scale").style("opacity", 0);
    escale.append("title")
        .text("Elements are colored by how many isotopes they have: fewer is lighter yellow, more is darker green");
    escale.append("rect")
        .attr("id", "element_scale")
        .attr("x", scale_x).attr("y", y_margin * display.scale)
        .attr("width", scale_w * display.scale).attr("height", scale_h * display.scale)
        .attr("stroke", "#FFFFFF").style("stroke-width","1")
        .attr("fill", "url(#element_gradient)");
    var escale_t = escale.append("text")
        .attr("class", "scale")
        .style("font-size", (3 * display.scale) + "px");
    escale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("y", y_margin * 0.2 * display.scale)
        .attr("dy", 4 * display.scale)
        .text("Fewer");
    escale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("dy", 3.5 * display.scale)
        .text("Isotopes");
    escale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("y", (y_margin + scale_h + (y_margin * 0.15)) * display.scale)
        .attr("dy", 4 * display.scale)
        .text("More");
    escale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("dy", 3.5 * display.scale)
        .text("Isotopes");

    // Draw Element Scale ticks (range of 1 to 46, total spread of 45)
    var tick_text_x = ((region_w / 2) + scale_w) * display.scale;
    var eticks = escale.append("text");
    for (var t = 0; t < 10; t++){
        var tick = 1 + t * 5;
        var tick_y = y_margin + ((tick - 1) / 45) * scale_h;
        escale.append("path")
            .attr("d",pathString([(region_w / 2) - scale_w, tick_y, (region_w / 2) + scale_w, tick_y]))
            .attr("stroke","#FFFFFF").style("stroke-width","1.5")
            .attr("fill","none");
        var tick_text_y = (tick_y - 1) * display.scale;
        if (t == 0){ tick_text_y = (tick_y + 4) * display.scale; }
        var tick_label = (t == 0 || t == 9 ? tick : tick - 1); // a little slop to yield mostly ticks divisible by 5
        eticks.append("tspan").attr("x", tick_text_x).attr("y", tick_text_y).attr("text-anchor", "end")
            .attr("fill","#FFFFFF").style("font-size", (3.5 * display.scale) + "px").text(tick_label);
    }

    // Draw Nuclide Scale
    var nscale = d3.select("#slider").append("g")
        .attr("id", "key_nuclide_scale").style("opacity", 0).style("cursor", "pointer");
    nscale.append("title")
        .text("Nuclides are colored by how long their half-life is: shorter is blue, longer is orange");
    nscale.append("rect")
        .attr("id", "nuclide_scale")
        .attr("x", scale_x).attr("y", y_margin * display.scale)
        .attr("width", scale_w * display.scale).attr("height", scale_h * display.scale)
        .attr("stroke", "#FFFFFF").style("stroke-width","1")
        .attr("fill", "url(#nuclide_gradient)");
    var nscale_t = nscale.append("text")
        .attr("class", "scale")
        .style("font-size", (3 * display.scale) + "px");
    nscale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("y", y_margin * 0.2 * display.scale)
        .attr("dy", 4 * display.scale)
        .text("Shorter");
    nscale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("dy", 3.5 * display.scale)
        .text("Half-Life");
    nscale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("y", (y_margin + scale_h + (y_margin * 0.15)) * display.scale)
        .attr("dy", 4 * display.scale)
        .text("Longer");
    nscale_t.append("tspan")
        .attr("text-anchor", "middle")
        .attr("x", (region_w / 2) * display.scale).attr("dy", 3.5 * display.scale)
        .text("Half-Life");
    nscale.append("rect")
        .attr("id", "time_slider_shadow")
        .attr("x", scale_x).attr("y", display.time_slider.y)
        .attr("width", scale_w * display.scale).attr("height", 0)
        .attr("fill", "rgba(0,0,0,0.75)");

    // Draw Nuclide Scale ticks (range of -22 to 30, total spread of 52)
    var tick_text_x = ((region_w / 2) + 0.7) * display.scale;
    for (var t = 0; t < 14; t++){
        var tick = -22 + t * 4;
        var tick_y = y_margin + ((22 + tick) / 52) * scale_h;
        nscale.append("path")
            .attr("d",pathString([(region_w / 2) - scale_w, tick_y, (region_w / 2) + scale_w, tick_y]))
            .attr("stroke","#FFFFFF").style("stroke-width","1.5")
            .attr("fill","none");
        var tick_text_y = (tick_y - 1) * display.scale;
        if (t == 0){ tick_text_y = (tick_y + 3) * display.scale; }
        var nticks = nscale.append("text");
        if (Math.abs(tick) < 4){
            nticks.append("tspan").attr("x", tick_text_x).attr("y", tick_text_y)
                .attr("fill","#FFFFFF").style("font-size", (2*display.scale) + "px").text(Math.pow(10,tick)+"s");
        } else {
            nticks.append("tspan").attr("x", tick_text_x).attr("y", tick_text_y)
                .attr("fill","#FFFFFF").style("font-size", (2*display.scale) + "px").text("10");
            nticks.append("tspan").attr("dy", -1 * display.scale)
                .attr("fill","#FFFFFF").style("font-size", (1.3*display.scale) + "px").text(tick);
            nticks.append("tspan").attr("dy", display.scale)
                .attr("fill","#FFFFFF").style("font-size", (2*display.scale) + "px").text("s");
        }
    }

    // Draw Nuclide Scale slider UI element
    nscale.append("rect")
        .data([display.time_slider])
        .attr("id", "time_slider_handle").attr("class", "handle")
        .attr("x", display.time_slider.x).attr("y", display.time_slider.y)
        .attr("width", display.time_slider.w * display.scale).attr("height", display.time_slider.h * display.scale)
        .attr("rx", display.scale).attr("ry", display.scale / 2)
        .attr("stroke", "rgb(255,255,255)").style("stroke-width","1")
        .attr("fill", "url(#slider_gradient)")
        //.call(display.time_slider.mouse_events)
        .on("mouseover", function(){ display.time_slider.highlightSlider(true); })
        .on("mouseout", function(){ display.time_slider.highlightSlider(false); })
        .append("title").text("Move this slider up and down to simulate the passage of time and see nuclides decay according to their half-lives");

};

// Draw Stage
display.regions.stage.draw = function(){

    // Draw Stage / Question Title
    d3.select("#stage").append("text")
        .attr("id", "question_title").attr("class","qtitle")
        .attr("x", 2 * display.scale).attr("y", 5.5 * display.scale)
        .style("font-size", (5 * display.scale) + "px")
        .text("");

    // Draw Stage / Captions
    d3.select("#stage").append("g").attr("id", "captions");

    // Draw Stage / Highlight Boxes
    // These are objects that provide a highlight in addition to objects themselves
    // First: a special group of rects to show visible highlight on element rows on the chart of nuclides
    d3.select("#stage").append("g")
        .attr("id", "nuclides_element_highlights");
    // An additional element rect for maintaining a highlight in the table on any what is element question
    d3.select("#stage").append("rect")
        .attr("id", "floating_element_highlightbox")
        .attr("class", "highlightbox")
        .attr("filter", "url(#highlight-glow)")
        .attr("width", 0)
        .attr("height", 0)
        .attr("display", "none");

    // Draw Stage / Dataset
    d3.select("#stage").append("g")
        .attr("id", "dataset")
        .attr("class", "element_group");

    // Draw Stage / Dataset / Elements
    d3.select("#dataset").selectAll("g.element")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_display'; })
        .attr("class", function(d){ return 'element e' + d.protons; })
        .attr("transform", "translate(0, 0) scale(1)")
        .style("display", "none")
        .each(function(d, i) {
            var display_id = 'element_' + d.protons + '_display';
            d3.select("#"+this.id)
                .attr("transform", "translate(0,0)");
            d3.select("#" + display_id)
                .append("rect")
                .attr("class", "element e" + d.protons)
                .attr("id", function(d){ return "element_" + d.protons + "_block"; })
                .attr("width", 1).attr("height", 1)
                .attr("fill", function(d){ return palette.element(d); });
            var label = d3.select("#" + display_id)
                .append("text").attr("class", "element")
                .attr("id", "element_" + d.protons + "_label")
                .style("display", "none");
            var symbol = label.append("tspan")
                .attr("class", "element_symbol e" + d.protons)
                .attr("x", 0.1).attr("y", 0.8).style("font-size", "0.5px")
                .text(d.symbol);
            label.append("tspan")
                .attr("class", "element_number e" + d.protons)
                .attr("x", 0.9).attr("y", 0.3).style("font-size", "0.25px")
                .attr("text-anchor", "end")
                .text(d.protons);
            if (d.symbol.length > 2){
                symbol.attr("textLength", "0.7px").attr("lengthAdjust", "spacingAndGlyphs");
            }
        });

    // Draw Stage / Dataset / Nuclides
    d3.select("#dataset").selectAll("g.nuclide")
        .data( Object.keys(matter.nuclide_name_map).map(function (key) {return matter.nuclide_name_map[key]}) )
        .enter().append("g")
        .attr("class", function(d){ return "nuclide e" + d.protons + " n" + d.neutrons })
        .attr("id", function(d){ return 'element_' + d.protons + '_nuclide_' + d.neutrons + '_display'; })
        .attr("transform", "translate(0, 0) scale(1)")
        .style("display", "none")
        .each(function(d, i){
            var display_id = 'element_' + d.protons + '_nuclide_' + d.neutrons + '_display';
            d3.select("#"+display_id)
                .append("rect")
                .attr("id", function(d){ return "element_" + d.protons + "_nuclide_" + d.neutrons + "_block"; })
                .attr("class", function(d){ return "nuclide e" + d.protons + " n" + d.neutrons; })
                .attr("width", 1).attr("height", 1)
                .attr("fill", function(d){ return palette.nuclide(d); })
            var label = d3.select("#" + display_id)
                .append("text")
                .attr("id", function(d){ return "element_" + d.protons + "_nuclide_" + d.neutrons + "_label"; })
                .attr("class", function(d){ return "nuclide e" + d.protons + " n" + d.neutrons; })
                .attr("fill", function(d){ return palette.nuclideLabel(d); })
                .style("display", "none");
            label.append("tspan")
                .attr("x", 0.85).attr("y", 0.8).style("font-size", "0.4px")
                .attr("text-anchor", "end")
                .text(function(d){ return d.parentElement.symbol });
            label.append("tspan")
                .attr("x", 0.15).attr("y", 0.38).style("font-size", "0.27px")
                .text(d.protons + d.neutrons);
        });

    // Draw Stage / Highlightboxes
    d3.select("#stage").append("g").attr("id", "highlightboxes");
    d3.select("#highlightboxes").append("rect")
        .attr("id", "element_highlightbox")
        .attr("class", "highlightbox")
        .attr("stroke-width", 0.3 * display.scale).attr("stroke-dasharray",0.5*display.scale + "," + 0.5*display.scale)
        .attr("filter", "url(#highlight-glow)")
        .attr("display", "none");
    d3.select("#highlightboxes").append("rect")
        .attr("id", "nuclide_highlightbox")
        .attr("class", "highlightbox")
        .attr("stroke-width", 0.3 * display.scale).attr("stroke-dasharray",0.5*display.scale + "," + 0.5*display.scale)
        .attr("filter", "url(#highlight-glow)")
        .attr("display", "none");
    d3.select("#highlightboxes").append("rect")
        .attr("id", "nuclide_row_highlightbox")
        .attr("class", "highlightbox")
        .attr("stroke-width", 0.3 * display.scale).attr("stroke-dasharray",0.5*display.scale + "," + 0.5*display.scale)
        .attr("filter", "url(#highlight-glow)")
        .attr("display", "none");

    // Draw Stage / Components
    d3.select("#stage").append("g").attr("id", "components");

    // Component: Thumbnail
    var thumbnail = d3.select("#components").append("g")
        .attr("id", "thumbnail").attr("class", "component")
        .attr("transform", "translate(0,0)")
        .style("display", "none");
    var w = 52 * display.scale;
    var h = 30 * display.scale;
    thumbnail.append("clipPath")
        .attr("id", "thumbnail_clip")
        .append("rect").attr("id", "thumbnail_cliprect")
        .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
    var thumbnail_main = thumbnail.append("g")
        .attr("id", "thumbnail_main")
        .attr("clip-path", "url(#thumbnail_clip)");
    thumbnail_main.append("svg:image")
        .attr("id", "thumbnail_src")
        .attr("xlink:href", 'images/elements/sprite_map.png')
        .attr("x", 0).attr("y", 0).attr("width", w).attr("height", (matter.sprite_map_max + 1) * (h - display.scale));
    thumbnail_main.append("rect")
        .attr("id", "thumbnail_titlerect")
        .attr("class", "thumbnail title")
        .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h / 5);
    thumbnail_main.append("text")
        .attr("id", "thumbnail_title")
        .attr("class", "thumbnail title")
        .attr("x", 1.5 * display.scale).attr("y", (h / 5) - (1.65 * display.scale))
        .attr("font-size", (h / 5) * 0.7 + "px");
    thumbnail_main.append("rect")
        .attr("id", "thumbnail_border")
        .attr("class", "borderbox")
        .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
    display.setThumbnail(1);

    // Component: Nuclide Hover
    var w = display.components.nuclide_hover.w * display.scale;
    var h = display.components.nuclide_hover.h * display.scale;
    var g = d3.select("#components").append("g")
        .attr("id", "nuclide_hover")
        .attr("transform","translate(0,0)")
        .style("display", "none");
    g.append("rect")
        .attr("width", w).attr("height", h)
        .attr("x", 0).attr("y", 0)
        .attr("fill", "rgb(0,0,0)")
        .attr("filter", "url(#highlight-glow)");
    var g_text = g.append("text").attr("id", "nuclide_hover_info").style("font-size", (h/5.5) + "px");

    // Draw Stage / Specifics
    d3.select("#stage").append("g").attr("id", "specifics");

    // Draw Stage / Hitboxes
    d3.select("#stage").append("g")
        .attr("id", "hitboxes");

    // Element hitboxes
    d3.select("#hitboxes").selectAll(".hitbox.element")
        .data(matter.elements)
        .enter().append("rect")
        .attr("class", function(d){ return "hitbox element e" + d.protons; })
        .attr("width", 1).attr("height", 1).attr("transform", "translate(0,0)")
        .style("display", "none")
        .on("mouseover", function(d){
            display.highlightElement(d, true);
        })
        .on("mouseout", function(d){
            display.highlightElement(d, false);
        })
        .on("click", function(d){
            if (d.protons == 0){
                questions.call("what_is_a_neutron");
            } else {
                display.next_element = d.protons;
                questions.call("what_is_element");
            }
        })
        .append("title").text(function(d){ return "What is " + (d.protons == 0 ? 'a Neutron' : d.name) + "?"; });

    // Nuclide hitboxes
    d3.select("#hitboxes").selectAll(".hitbox.nuclide")
        .data( Object.keys(matter.nuclide_name_map).map(function (key) {return matter.nuclide_name_map[key]}) )
        .enter().append("rect")
        .attr("class", function(d){ return "hitbox nuclide e" + d.protons + " n" + d.neutrons })
        .attr("width", 1).attr("height", 1).attr("transform", "translate(0,0)")
        .style("display", "none")
        .on("mouseover", function(d){
            display.highlightNuclide(d, true);
        })
        .on("mouseout", function(d){
            display.highlightNuclide(d, false);
        })
        .on("click", function(d){
            display.next_element = d.protons;
            questions.call("what_is_element");
        });

};