"use strict";

// Initialize master data object for display variables
var display = {

    // Scale is an integer value to allow for discrete geometric
    // scaling of the application for different viewport sizes
    scale: 1,

    // Boolean to track whether we're in an initial loading state
    loading: true,

    available_width:  0,
    available_height: 0,

    nuclides_per_row: 0,
    in_transition:    true, // boolean to track if in transition or loading (a type of transition)
    current_layout:   'setup',
    next_layout:      'elements',

    // proton values for whichever element currently shown (or to be shown next) in the element detail layout
    isotopes_focus: null,
    next_isotopes_focus: null,

    // Multiplier used for transition timing (set to default value in setup)
    transition_speed: 0,

    // All top-level regions represent areas of the canvas at their
    // smallest resolution, with optimal resolutions being integer
    // multiples of everything
    area: { w: 256, h: 160 },
    regions: {
        
        // Nav: Large buttons for switching between layouts; graphics are external svg files
        nav: {
            x: 0, y: 28, w: 44, h: 108,
            regions: {
                elements: { x: 0, y: 0, w: 44, h: 36, title: "Click to show the Periodic Table of Elements" },
                nuclides: { x: 0, y: 36, w: 44, h: 36, title: "Click to show the Chart of Nuclides (all Isotopes of all Elements)" },
                isotopes: { x: 0, y: 72, w: 44, h: 36, title: "Click to show the Isotopes for a single Element" },
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
    
    // Layouts are displayed only inside the area defined by the stage
    // object. These objects provide details for specific layouts.
    layouts: {

        // Elements - The Periodic Table
        elements: {
            data: { x: 6, y: 28, w: 180, h: 100 },
            element: { w: 9, m: 1 },
            nuclide: { w: null, m: null }, // These get set in setDisplayVars()
            info: { x: 28, y: 5, w: 91, h: 50 },
            image: { x: 122, y: 5, w: 52, h: 29 },
            title: function(){
                return "The Periodic Table of Elements";
            },
            getElementX: function(element){
                var base = display.scale * (display.layouts.elements.element.w + display.layouts.elements.element.m);
                var x = display.scale * display.layouts.elements.data.x;
                if (element.group > 18){
                    return x + (element.group - 17) * base;
                } else if (element.group == 0) {
                    return x;
                } else {
                    return x + (element.group - 1) * base;
                }
            },
            getElementY: function(element){
                var base = display.scale * (display.layouts.elements.element.w + display.layouts.elements.element.m);
                var y = display.scale * display.layouts.elements.data.y;
                if (element.group > 18){
                    return y + (element.period + 2) * base;
                } else if (element.group == 0) {
                    return y - (1.5 * base);
                } else {
                    return y + (element.period - 1) * base;
                }
            },
            getNuclideX: function(nuclide){
                var base = display.scale * (display.layouts.elements.nuclide.w + display.layouts.elements.nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.elements.getElementX(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + (index % display.nuclides_per_row) * base;
            },
            getNuclideY: function(nuclide){
                var base = display.scale * (display.layouts.elements.nuclide.w + display.layouts.elements.nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.elements.getElementY(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + Math.floor(index / display.nuclides_per_row) * base;
            },
            setExtras: function(){
                // do nothing
            },
            setInfo: function(){
                d3.selectAll(".blurb").remove();
                var title = display.layouts.elements.title();
                var title_height = display.scale * 5.5;
                var line_height = display.scale * 3.1;
                d3.select("#info_title")
                    .attr("x", 0)
                    .attr("y", title_height)
                    .attr("font-size", title_height * 0.85 + "px")
                    .text(title);
                var blurb = d3.select("#info").append("text")
                    .attr("id", "info_blurb")
                    .attr("class", "info blurb")
                    .attr("font-size", line_height * 0.85 + "px");
                var content = "[em1]Elements[em1] are the building blocks of all [em2]chemistry[em2]. All stuff in the universe[br]is made of [em1]atoms[em1] and an element is just one type of atom. Science has[br]found [em3]" + (matter.elements.length-1) + " total elements[em3]. They are all arranged here in what's called the[br][em3]Periodic Table of Elements[em3]."
                    + "[br] [br]If it's an element that exists in nature, or even if it only exists in laboratories,[br]it's on this table. There are many familiar ones such as [link]Carbon[link], [link]Oxygen[link],[br][link]Gold[link], and [link]Silver[link], as well as some that may seem unfamiliar such as[br][link]Ytterbium[link], [link]Antimony[link], or [link]Bismuth[link]."
                    + "[br] [br]While each element is a distinct \"flavor\" of atom, each element in turn has[br]many \"flavors\" called [em2]isotopes[em2]. Click any element here to learn more or[br]use the navigation on the left to explore.";
                display.printTextBlock(blurb, content, 0, title_height + line_height, line_height);
            },
            setHitboxes: function(){
                var w = display.scale * (display.layouts.elements.element.w
                                         + display.layouts.elements.element.m);
                d3.selectAll(".hitbox.element")
                    .attr("display", null)
                    .attr("width", w).attr("height", w)
                    .attr("transform", function(d){
                        var x = display.layouts.elements.getElementX(d);
                        var y = display.layouts.elements.getElementY(d);
                        return "translate(" + x + "," + y + ")";
                    });
            }
        },
        
        // Nuclides - The Chart of Nuclides
        nuclides: {
            data: { x: 5, y: 7, w: 180, h: 120 },
            element: { w: 2.6, m: 0.288 },
            nuclide: { w: .7, m: .3 },
            table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
            zoom_nuclide: { w: 8 },
            info: { x: 12, y: 8, w: 112, h: 116 },
            image: { x: 132, y: 94, w: 52, h: 29 },
            elements: { x: 132, y: 60, w: 52, h: 30 },
            title: function(){
                return "The Chart of Nuclides";
            },
            getElementX: function(element){
                var base = display.scale * (display.layouts.nuclides.element.w + display.layouts.nuclides.element.m);
                var x = display.scale * display.layouts.nuclides.elements.x;
                if (element.group > 18){
                    return x + (element.group - 17) * base;
                } else if (element.group == 0) {
                    return x;
                } else {
                    return x + (element.group - 1) * base;
                }
            },
            getElementY: function(element){
                var base = display.scale * (display.layouts.nuclides.element.w + display.layouts.nuclides.element.m);
                var y = display.scale * display.layouts.nuclides.elements.y;
                if (element.group > 18){
                    return y + (element.period + 2) * base;
                } else if (element.group == 0) {
                    return y - (1.5 * base);
                } else {
                    return y + (element.period - 1) * base;
                }
            },
            getTableNuclideX: function(nuclide){
                var base = display.scale * (display.layouts.nuclides.table_nuclide.w + display.layouts.nuclides.table_nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.nuclides.getElementX(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + (index % display.nuclides_per_row) * base;
            },
            getTableNuclideY: function(nuclide){
                var base = display.scale * (display.layouts.nuclides.table_nuclide.w + display.layouts.nuclides.table_nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.nuclides.getElementY(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + Math.floor(index / display.nuclides_per_row) * base;
            },
            getNuclideX: function(nuclide){
                var base = display.scale * (display.layouts.nuclides.nuclide.w
                                            + display.layouts.nuclides.nuclide.m);
                return display.scale * display.layouts.nuclides.data.x + nuclide.neutrons * base;
            },
            getNuclideY: function(nuclide){
                var base = display.scale * (display.layouts.nuclides.nuclide.w
                                            + display.layouts.nuclides.nuclide.m);
                return display.scale * display.layouts.nuclides.data.y + (120 - nuclide.protons) * base;
            },
            removeAxes: function(){
                d3.select("#axes").remove();
            },
            drawAxes: function(){
                if (d3.select("#axes")[0][0] != null){
                    display.layouts.nuclides.removeAxes();
                }
                var start_x   = 3;
                var start_y   = display.regions.stage.h - 3
                var end_x     = display.regions.stage.w - 6
                var end_y     = 6;
                var origin_x  = display.layouts.nuclides.data.x;
                var origin_y  = display.regions.stage.h - display.layouts.nuclides.data.y;
                var tick_step = 10 * (display.layouts.nuclides.nuclide.w + display.layouts.nuclides.nuclide.m);
                var axes = d3.select("#extras").append("g")
                    .attr("id", "axes");
                axes.append("path")
                    .attr("id", "x-axis")
                    .attr("d", pathString([start_x, start_y, end_x, start_y]))
                    .attr("stroke","#FFFFFF").attr("stroke-width","2")
                    .attr("fill","none");
                axes.append("path")
                    .attr("id", "y-axis")
                    .attr("d", pathString([start_x, start_y, start_x, end_y]))
                    .attr("stroke","#FFFFFF").attr("stroke-width","2")
                    .attr("fill","none");
                for (var t = 0; t < end_x - start_x; t += tick_step){
                    if (t < (start_y - end_y)){
                        var tick_y = (display.layouts.nuclides.data.h - t) + display.layouts.nuclides.data.y;
                        axes.append("path")
                            .attr("d", pathString([start_x, tick_y, start_x + 1, tick_y]))
                            .attr("stroke","#FFFFFF").attr("stroke-width","1")
                            .attr("fill","none");
                    }
                    axes.append("path")
                        .attr("d", pathString([origin_x + t, start_y, origin_x + t, start_y - 1]))
                        .attr("stroke","#FFFFFF").attr("stroke-width","1")
                        .attr("fill","none");
                }
                axes.append("text")
                    .attr("x", (start_x + 4) * display.scale)
                    .attr("y", (start_y - 45) * display.scale)
                    .attr("fill","rgb(196,196,196)")
                    .style("writing-mode", "tb")
                    .style("glyph-orientation-vertical", 0)
                    .style("letter-spacing", -5)
                    .style("font-size", display.scale * 3 + "px")
                    .style("font-weight", "bold")
                    .text("↑ Protons ↓");
                axes.append("text")
                    .attr("x", (start_x + 24) * display.scale)
                    .attr("y", (start_y - 3) * display.scale)
                    .attr("fill","rgb(196,196,196)")
                    .style("font-size", display.scale * 3 + "px")
                    .style("font-weight", "bold")
                    .text("← Neutrons →");
            },
            setInfo: function(){
                d3.selectAll(".blurb").remove();
                var title = display.layouts.nuclides.title();
                var title_height = display.scale * 5.5;
                var line_height = display.scale * 3.2;
                d3.select("#info_title")
                    .attr("x", 0)
                    .attr("y", title_height)
                    .attr("font-size", title_height * 0.85 + "px")
                    .text(title);
                var blurb = d3.select("#info").append("text")
                    .attr("id", "info_blurb")
                    .attr("class", "info blurb")
                    .attr("font-size", line_height * 0.85 + "px");
                var content = "Atoms are made of [em1]protons[em1], [em2]neutrons[em2], and [em3]electrons[em3]. The number of [em1]protons[em1] in an atom determines its[br][em1]chemistry[em1] and thus what [em1]element[em1] it is. The number of [em2]neutrons[em2] an atom has can vary for every element.[br]More neutrons make the element [em2]heavier[em2] without changing its chemistry. Atoms of the same[br]element with different numbers of neutrons are called [em3]isotopes[em3] of that element."
                    + "[br] [br]Every isotope is a [em3]nuclide[em3], or a type of atom found in nature. There are [em1]" + (matter.elements.length-1) + "[em1] total[br]elements and [em2]each has between 1 and " + matter.max_nuclides_per_element + " known isotopes[em2], making for[br][em3]" + matter.total_nuclides + " total known nuclides[em3]. All nuclides are shown here on[br]the [em3]Chart of Nuclides[em3]."
                    + "[br] [br]Some nuclides have particular significance and may even[br]sound familiar, such as [link]Carbon-14[link], [link]Uranium-235[link],[br]or [link]Americium-241[link]. Click anywhere on the[br][em3]Chart of Nuclides[em3] or the [em1]Periodic Table[em1][br]guide to the right for a closer look at[br]isotopes and for a single element.";
                display.printTextBlock(blurb, content, 0, title_height + line_height, line_height);
            },
            setHitboxes: function(){
                var ew = display.scale * (display.layouts.nuclides.element.w + display.layouts.nuclides.element.m);
                d3.selectAll(".hitbox.element")
                    .attr("display", null)
                    .attr("width", ew).attr("height", ew)
                    .attr("transform", function(d){
                        var x = display.layouts.nuclides.getElementX(d);
                        var y = display.layouts.nuclides.getElementY(d);
                        return "translate(" + x + "," + y + ")";
                    });
                var nw = display.scale * (display.layouts.nuclides.nuclide.w + display.layouts.nuclides.nuclide.m);
                d3.selectAll(".hitbox.nuclide")
                    .attr("display", null)
                    .attr("width", nw).attr("height", nw)
                    .attr("transform", function(d){
                        var x = display.layouts.nuclides.getNuclideX(d);
                        var y = display.layouts.nuclides.getNuclideY(d);
                        return "translate(" + x + "," + y + ")";
                    });
            }
        },
        
        // Isotopes: One Element in Detail
        isotopes: {
            data: { x: 136, y: 4, w: 52, h: 52 },
            element: { w: 2.6, m: 0.288 },
            nuclide: { w: null, m: null }, // These get set in setDisplayVars()
            table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
            info: { x: 2, y: 2, w: 128, h: 48 },
            image: { x: 136, y: 98, w: 52, h: 29 },
            elements: { x: 136, y: 62, w: 52, h: 30 },
            big_image: { x: 4, y: 56, w: 128, h: 72 },
            title: function(){
                var focus = display.next_isotopes_focus;
                if (focus == null){ focus = display.isotopes_focus; }
                if (focus == 0){
                    var title = "The Neutron";
                } else {
                    var title = "Isotopes of " + matter.elements[focus].name;
                }
                return title;
            },
            getElementX: function(element){
                var base = display.scale * (display.layouts.isotopes.element.w + display.layouts.isotopes.element.m);
                var x = display.scale * display.layouts.isotopes.elements.x;
                if (element.group > 18){
                    return x + (element.group - 17) * base;
                } else if (element.group == 0) {
                    return x;
                } else {
                    return x + (element.group - 1) * base;
                }
            },
            getElementY: function(element){
                var base = display.scale * (display.layouts.isotopes.element.w + display.layouts.isotopes.element.m);
                var y = display.scale * display.layouts.isotopes.elements.y;
                if (element.group > 18){
                    return y + (element.period + 2) * base;
                } else if (element.group == 0) {
                    return y - (1.5 * base);
                } else {
                    return y + (element.period - 1) * base;
                }
            },
            getTableNuclideX: function(nuclide){
                var base = display.scale * (display.layouts.isotopes.table_nuclide.w + display.layouts.isotopes.table_nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.isotopes.getElementX(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + (index % display.nuclides_per_row) * base;
            },
            getTableNuclideY: function(nuclide){
                var base = display.scale * (display.layouts.isotopes.table_nuclide.w + display.layouts.isotopes.table_nuclide.m);
                var element = matter.elements[nuclide.protons];
                var origin  = display.layouts.isotopes.getElementY(element);
                var index   = nuclide.neutrons - element.min_neutrons;
                return origin + Math.floor(index / display.nuclides_per_row) * base;
            },
            getDataNuclideX: function(nuclide){
                var base   = display.scale * (display.layouts.isotopes.nuclide.w + display.layouts.isotopes.nuclide.m);
                var origin = display.scale * display.layouts.isotopes.data.x;
                if (typeof nuclide == 'object'){
                    var element = matter.elements[nuclide.protons];
                    var index   = nuclide.neutrons - element.min_neutrons;
                } else {
                    var index = nuclide;
                }
                return origin + (index % display.nuclides_per_row) * base;
            },
            getDataNuclideY: function(nuclide){
                var base    = display.scale * (display.layouts.isotopes.nuclide.w + display.layouts.isotopes.nuclide.m);
                var origin  = display.scale * display.layouts.isotopes.data.y;
                if (typeof nuclide == 'object'){
                    var element = matter.elements[nuclide.protons];
                    var index   = nuclide.neutrons - element.min_neutrons;
                } else {
                    var index = nuclide;
                }
                return origin + Math.floor(index / display.nuclides_per_row) * base;
            },
            setInfo: function(){
                d3.selectAll(".blurb").remove();
                var title = display.layouts.isotopes.title();
                var title_height = display.scale * 5.5;
                var line_height = display.scale * 3.1;
                var origin_x = display.layouts.isotopes.info.x * display.scale;
                var origin_y = display.layouts.isotopes.info.y * display.scale;
                d3.select("#info_title")
                    .attr("x", origin_x)
                    .attr("y", origin_y + title_height)
                    .attr("font-size", title_height * 0.85 + "px")
                    .text(title);
                var blurb = d3.select("#info").append("text")
                    .attr("id", "info_blurb")
                    .attr("class", "info blurb")
                    .attr("font-size", line_height * 0.85 + "px");
                var content = matter.elements[display.next_isotopes_focus].info;
                display.printTextBlock(blurb, content, origin_x, origin_y + title_height + line_height, line_height);
            },
            setHitboxes: function(){
                var focus = display.isotopes_focus;
                if (focus == null){ focus = display.next_isotopes_focus; }
                var ew = display.scale * (display.layouts.isotopes.element.w + display.layouts.isotopes.element.m);
                d3.selectAll(".hitbox.element")
                    .attr("display", null)
                    .attr("width", ew).attr("height", ew)
                    .attr("transform", function(d){
                        var x = display.layouts.isotopes.getElementX(d);
                        var y = display.layouts.isotopes.getElementY(d);
                        return "translate(" + x + "," + y + ")";
                    });
                var nw = display.scale * (display.layouts.isotopes.nuclide.w + display.layouts.isotopes.nuclide.m);
                d3.selectAll(".hitbox.nuclide.e" + focus)
                    .attr("display", null)
                    .attr("width", nw).attr("height", nw)
                    .attr("transform", function(d){
                        var x = display.layouts.isotopes.getDataNuclideX(d);
                        var y = display.layouts.isotopes.getDataNuclideY(d);
                        return "translate(" + x + "," + y + ")";
                    });
            },
            removeBigImage: function(){
                d3.select("#big_image").remove();
            },
            drawBigImage: function(){
                if (d3.select("#big_image")[0][0] != null){
                    display.layouts.isotopes.removeBigImage();
                }
                var image_x = display.scale * display.layouts.isotopes.big_image.x;
                var image_y = display.scale * display.layouts.isotopes.big_image.y;
                var image_w = display.scale * display.layouts.isotopes.big_image.w;
                var image_h = display.scale * display.layouts.isotopes.big_image.h;
                var bigimage = d3.select("#extras").append("g")
                    .attr("id", "big_image")
                    .attr("transform", "translate(" + image_x + ", " + image_y + ")");
                bigimage.append("svg:image")
                    .attr("id", "big_image_src")
                    .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
                bigimage.append("rect")
                    .attr("id", "big_image_border")
                    .attr("class", "borderbox")
                    .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
            }
        }
    },

    highlightNav: function(button, bool){
        if (bool){
            d3.select("#" + button + "_title")
                .attr("fill", "rgb(255,255,255)")
                .attr("filter", "url(#highlight-glow)");
            d3.select("#" + button + "_bg").style("opacity", 1);
            // Special behavior in element layout only:
            // Show nuclides when highlighting isotopes or nuclides, hide them when highlighting elements
            if (!display.in_transition && display.current_layout == 'elements'){
                if (button == 'elements'){
                    // Hide nuclide scale
                    d3.select("#key_nuclide_scale").style("opacity", 0);
                    d3.select("#key_elapsed_time").style("opacity", 0);
                    // Show element scale
                    d3.select("#key_element_scale").style("opacity", 1);
                    // Hide nuclides
                    d3.selectAll("g.nuclide_display").style("opacity", 0);
                    // Show element labels
                    d3.selectAll("text.element_display").style("opacity", 1);
                } else {
                    // Hide element scale
                    d3.select("#key_element_scale").style("opacity", 0);
                    // Show nuclide scale
                    d3.select("#key_nuclide_scale").style("opacity", 1);
                    d3.select("#key_elapsed_time").style("opacity", 1);
                    // Dim element labels
                    d3.selectAll("text.element_display").style("opacity", 0.5);
                    // Show nuclides
                    d3.selectAll("g.nuclide_display").style("opacity", 1);
                }
            }
        } else {
            if (!display.in_transition && display.current_layout == button){ return; }
            if (display.in_transition && display.next_layout == button){ return; }
            d3.select("#" + button + "_title")
                .attr("fill", "rgb(127,127,127)")
                .attr("filter", null);
            d3.select("#" + button + "_bg").style("opacity", 0.33);
        }
    },

    highlightElement: function(element, bool){
        if (display.in_transition){ return; }
        var selector = "rect.element_display.e" + element.protons;
        if (bool){  // Highlight
            d3.select(selector).attr("filter", "url(#highlight-glow)");
            if (display.current_layout == 'nuclides'){
                d3.select("#element_" + element.protons + "_highlightbox").attr("display", null);
            }
            display.setImage(element.protons);
        }  else  {  // Un-Highlight
            d3.select(selector).attr("filter", "none");
            if (display.current_layout == 'nuclides'){
                d3.select("#element_" + element.protons + "_highlightbox").attr("display", "none");
            }
            if (display.current_layout == 'isotopes'){
                display.setImage(display.isotopes_focus);
            }
        }
    },

    highlightNuclide: function(nuclide, bool){
        if (display.in_transition || nuclide == null){ return; }
        var selector = "rect.nuclide_display.e" + nuclide.protons + ".n" + nuclide.neutrons;
        if (bool){  // Highlight
            d3.select(selector).attr("filter", "url(#highlight-glow)");
            display.setZoomNuclide(nuclide);
        }  else  {  // Un-Highlight
            d3.select(selector).attr("filter", "none");
            display.setZoomNuclide(null);
        }
        // Cascade
        display.highlightElement(nuclide.parentElement, bool);
    },

    setZoomNuclide: function(nuclide){
        if (nuclide == null || (display.current_layout != 'nuclides' && display.current_layout != 'isotopes')){
            d3.select("#zoom_nuclide").style("display", "none");
        } else {

            // Initialize vars
            var zoom_w = display.layouts.nuclides.zoom_nuclide.w * display.scale;
            var nuc_w  = display.layouts.nuclides.nuclide.w * display.scale;
            var label_unit = zoom_w / 10;
            var number = nuclide.protons + nuclide.neutrons;

            // Position and show nuclide (nuclides layout only)
            if (display.current_layout == 'nuclides'){
                var rect_fill = d3.select("rect.nuclide_display.e" + nuclide.protons + ".n" + nuclide.neutrons).attr("fill");
                var text_fill = d3.select("text.nuclide_display.e" + nuclide.protons + ".n" + nuclide.neutrons).attr("fill");
                d3.select("#zoom_nuclide_nuclide").style("display", null);
                d3.select("#zoom_nuclide_main_display").attr("fill", rect_fill);
                d3.select("#zoom_nuclide_label").attr("fill", text_fill);
                d3.select("#zoom_nuclide_label_symbol").text(nuclide.parentElement.symbol);
                d3.select("#zoom_nuclide_label_number").text(number);
            }

            // Position and show info
            if (display.current_layout == 'nuclides'){
                var info_x = zoom_w * 1.2;
                var info_y = -1 * (zoom_w / 4);
            } else if (display.current_layout == 'isotopes'){
                var info_x = 0;
                var info_y = 0;
            }
            d3.select("#zoom_nuclide_info")
                .attr("transform", "translate(" + info_x + ", " + info_y + ")");

            // Set info text
            // TODO: Make this not rely on nested tspans
            d3.select("#zoom_nuclide_info_name").text(nuclide.parentElement.name + '-' + number);
            d3.select("#zoom_nuclide_info_protons").text("Protons: " + nuclide.protons);
            d3.select("#zoom_nuclide_info_neutrons").text("Neutrons: " + nuclide.neutrons);
            var hl_text = d3.select("#zoom_nuclide_info_halflife");
            var hl_raw  = "[em3]Half-Life: " + nuclide.halflife.repNumerical() + "[em3]";
            display.printTextBlock(hl_text, hl_raw, hl_text.attr("x"), 1.75 * hl_text.attr("dy"), parseInt(hl_text.style("font-size")));

            // Show and position the group
            if (display.current_layout == 'nuclides'){
                var x = display.layouts.nuclides.getNuclideX(nuclide);
                var y = display.layouts.nuclides.getNuclideY(nuclide) + nuc_w - zoom_w;
            } else if (display.current_layout == 'isotopes'){
                var x = display.layouts.isotopes.data.x * display.scale;
                var y = display.layouts.isotopes.getDataNuclideY(nuclide) + (1.6 * display.layouts.isotopes.nuclide.w * display.scale);
            }
            d3.select("#zoom_nuclide")
                .attr("transform", "translate(" + x + ", " + y + ")")
                .style("display", null);
        }
    },

    // Set small image and title
    setImage: function(protons, transition_duration){
        var offset = 0;
        var title = "";
        if (typeof matter.elements[protons] == "object"){
            title = protons + " - " + matter.elements[protons].name + " (" + matter.elements[protons].symbol + ")";
            if (matter.elements[protons].has_image){
                offset = protons;
            }
        }
        var image_h = display.layouts.elements.image.h * display.scale;
        d3.select("#image_src").attr("y", 0 - (offset * image_h) + (image_h / 10));
        d3.select("#image_title").text(title);
    },

    // Set big image for element detail view
    setBigImage: function(protons){
        var image_url = "images/elements/no_image.jpg";
        if (typeof matter.elements[protons] == "object"){
            if (matter.elements[protons].has_image){
                image_url = "images/elements/" + protons + ".jpg";
            }
        }
        var dark = 200;
        var ease = dark * 2;
        d3.select("#big_image_src").transition()
            .delay(0).duration(ease * display.transition_speed).style("opacity",0);
        setTimeout(function(){
            d3.select("#big_image_src").attr("xlink:href",image_url);
        }, (ease + (dark/2)) * display.transition_speed);
        d3.select("#big_image_src").transition()
            .delay((ease + dark) * display.transition_speed).duration(ease * display.transition_speed).style("opacity",1);
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
        d3.selectAll("rect.nuclide_display").attr("fill", function(d){ return palette.nuclide(d); });
        d3.selectAll("text.nuclide_display").attr("fill", function(d){ return palette.nuclideLabel(d); });

        // Set the numerical value for elapsed time
        d3.select("#key_elapsed_time_numerical").selectAll("tspan").remove();
        var t = new Time(1, this.elapsed_time_exp);
        var numerical = '[em3]None[em3][sml] (change with the slider →)[sml]';
        if (this.elapsed_time_exp != null){
            numerical = '[em3]' + t.repNumerical() + '[em3]';
        }
        display.printTextBlock(d3.select("#key_elapsed_time_numerical"), numerical,
                               2.5 * display.scale, 10 * display.scale, 0);

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
                display.printTextBlock(d3.select("#key_elapsed_time_caption"), caption,
                                       2.5 * display.scale, 11 * display.scale, 3 * display.scale);
            }
        }
    },

    // Helper function to print a marked-up string into a paragraph block
    // Use "[br]" for a line break and wrap emphasized terms in [em1], [em2], or [em3] tags.
    // Links to elements and nuclides can be wrapped in [link] tags and must match an
    // element or nuclide name to function.
    // E.g.: "This is a sample text block.[br]It includes things that are [em1]emphasized[em1],
    //        [em2]more[em2], and [em3]even more[em3].[br]There are also links to named things
    //        like [link]Carbon[link] and [link]Carbon-14[link], and positions like H[sub]2[sub]O."
    printTextBlock: function(selector, raw_text, origin_x, origin_y, line_height){
        var tspans = [];
        var nodes = raw_text.split(/(\[\w+\])/);
        var emphasis = null;
        var position = null;
        var dy_adjustments = { 'sup': -1 * display.scale,
                               'sub': 0.5 * display.scale,
                               'sml': 0 };
        var n = 0, t = 0;
        tspans.push({ text: '', class: [], mouse: null,
                      x: origin_x, y: (origin_y + line_height), dy: null });
        while (n < nodes.length){
            switch (nodes[n]){
            // Line breaks
            case '[br]':
                var dy = line_height;
                if (t > 0){
                    if (tspans[t-1].class[1] != null){
                        dy += -1 * dy_adjustments[tspans[t-1].class[1]];
                    }
                }
                tspans.push({ text: '', class: [], mouse: null,
                              x: origin_x, y: null, dy: dy,  });
                t++;
                break;
            // Emphasis
            case '[em1]':
            case '[em2]':
            case '[em3]':
                var node_class = nodes[n].slice(1,4);
                if (emphasis == null){
                    emphasis = node_class;
                    if (!tspans[t].text.length){
                        tspans[t].class[0] = emphasis;
                    } else {
                        tspans.push({ text: '', class: [emphasis, position],
                                      mouse: null, x: null, y: null, dy: null });
                        t++;
                    }
                } else {
                    emphasis = null;
                    if (!tspans[t].text.length){
                        tspans[t].class[0] = null;
                    } else {
                        tspans.push({ text: '', class: [emphasis, position],
                                      mouse: null, x: null, y: null, dy: null });
                        t++;
                    }
                }
                break;
            // Subscript / Superscript / Small
            case '[sub]':
            case '[sup]':
            case '[sml]':
                var node_class = nodes[n].slice(1,4);
                if (position == null){
                    position = node_class;
                    var dy = dy_adjustments[position];
                    if (!tspans[t].text.length){
                        tspans[t].class[1] = node_class;
                        tspans[t].dy += dy;
                    } else {
                        tspans.push({ text: '', class: [emphasis, position],
                                      mouse: null, x: null, y: null, dy: dy });
                        t++;
                    }
                } else {
                    var dy = -1 * dy_adjustments[position];
                    position = null;
                    if (!tspans[t].text.length){
                        tspans[t].class[1] = null;
                        tspans[t].dy += dy;
                    } else {
                        tspans.push({ text: '', class: [emphasis, position],
                                      mouse: null, x: null, y: null, dy: dy });
                        t++;
                    }
                }
                break;
            // Links (requires match to matter.element_name_map or matter.nuclide_name_map)
            case '[link]':
                if (tspans[t].mouse == null){
                    if (tspans[t].text.length == 0){
                        tspans[t].class.push("link");
                        tspans[t].mouse = "mouse";
                    } else {
                        tspans.push({ text: '', class: ["link"], mouse: "mouse", x: null, y: null, dy: null });
                        t++;
                    }
                } else {
                    tspans.push({ text: '', class: [], mouse: null, x: null, y: null, dy: null });
                    t++;
                }
                break;
            // Repo links (common while many element info blocks remain unwritten)
            case '[repo]':
                if (tspans[t].mouse == null){
                    if (tspans[t].text.length == 0){
                        tspans[t].class.push("href");
                        tspans[t].mouse = "repo";
                    } else {
                        tspans.push({ text: '', class: ["href"], mouse: "repo", x: null, y: null, dy: null });
                        t++;
                    }
                } else {
                    tspans.push({ text: '', class: [], mouse: null, x: null, y: null, dy: null });
                    t++;
                }
                break;
            default:
                tspans[t].text += nodes[n];
                break;
            }
            n++;
        }
        // Remove all tspans from the selector
        selector.selectAll("tspan").remove();
        // Render new tspans to the selector
        for (var t in tspans){
            var tspan = tspans[t];
            if (tspan.class[1] != null){ tspan.class[1] = "small"; }
            var classes = tspan.class.join(" ").trim();
            var node = selector.append("tspan").text(tspan.text);
            if (classes.length){ node.attr("class", classes); }
            if (tspan.x != null){ node.attr("x", tspan.x); }
            if (tspan.y != null){ node.attr("y", tspan.y); }
            if (Math.abs(tspan.dy) > 0){ node.attr("dy", tspan.dy); }
            if (tspan.mouse == "repo"){
                node.on("click", function(){
                    document.getElementById("link_repo_contrib").click();
                });
            } else if (tspan.mouse == "mouse"){
                var element = matter.element_name_map[tspan.text];
                var nuclide = matter.nuclide_name_map[tspan.text];
                if (typeof element != "undefined"){
                    (function(node, element){
                        node.on("mouseover", function(){
                            display.highlightElement(element, true);
                        }).on("mouseout", function(){
                            display.highlightElement(element, false);
                        }).on("click", function(){
                            transition.fire("isotopes", element.protons);
                        });
                    })(node, element);
                } else if (typeof nuclide != "undefined"){
                    (function(node, nuclide){
                        node.on("mouseover", function(){
                            display.highlightNuclide(nuclide, true);
                        }).on("mouseout", function(){
                            display.highlightNuclide(nuclide, false);
                        }).on("click", function(){
                            transition.fire("isotopes", nuclide.protons);
                        });
                    })(node, nuclide);
                }
            }
        }
    }

};

// The Palette object stores all data color information and methods
var palette = {
    element: function(d){
        var relative_nuclides = this.map_range(d.nuclide_count,
                                               matter.min_nuclides_per_element, matter.max_nuclides_per_element,
                                               0, 1);
        return this.hsla(this.getColor(relative_nuclides, 1, 'element'));
    },
    nuclide: function(d){
        var scale_position = Math.min( (d.halflife.exponent + d.halflife.base/10), matter.max_halflife_exp );
        if (d.isStable){ scale_position = matter.max_halflife_exp; }
        var relative_halflife = this.map_range(scale_position,
                                               matter.min_halflife_exp, matter.max_halflife_exp,
                                               0, 1);
        var alpha = 1;
        if (display.elapsed_time_exp != null && !d.isStable){
            if (d.halflife.exponent == display.elapsed_time_exp){
                alpha = 0.5;
            } else if (display.elapsed_time_exp > d.halflife.exponent){
                alpha = 0;
            }
        }
        return this.hsla(this.getColor(relative_halflife, alpha, 'nuclide'));
    },
    nuclideLabel: function(d){
        var color = "rgb(0,0,0)";
        if (display.elapsed_time_exp != null && !d.isStable){
            if (d.halflife.exponent == display.elapsed_time_exp){
                color = "rgb(255,255,255)";
            } else if (display.elapsed_time_exp > d.halflife.exponent){
                color = "rgb(127,127,127)";
            }
        }
        return color;
    },
    schemes: {
        // Light yellow to dark green (sequential)
        element: [ { h: 60, s: 100, l: 94.9 },
                   { h: 64, s: 91.8, l: 85.7 },
                   { h: 78, s: 72, l: 79 },
                   { h: 96, s: 53.7, l: 71.2 },
                   { h: 121, s: 40.6, l: 62.4 },
                   { h: 136, s: 44.9, l: 46.3 },
                   { h: 140, s: 58.1, l: 32.7 },
                   { h: 152, s: 100, l: 20.4 },
                   { h: 156, s: 100, l: 13.5 } ],
        // Dark cyan to dark orange through light gray (diverging)
        nuclide: [ { h: 177, s: 100, l: 11.8 },
                   { h: 176, s: 97.9, l: 18.8 },
                   { h: 175, s: 56.6, l: 34.3 },
                   { h: 173, s: 37.1, l: 54.5 },
                   { h: 171, s: 44.4, l: 73.9 },
                   { h: 100, s: 33.3, l: 91.2 },
                   { h: 43, s: 64.4, l: 76.9 },
                   { h: 38, s: 56.7, l: 59.2 },
                   { h: 34, s: 66.4, l: 42 },
                   { h: 33, s: 87.2, l: 27.6 },
                   { h: 33, s: 88.8, l: 17.5 } ]
    },
    getColor: function(value, alpha, scheme){
        var stops = this.schemes[scheme];
        var low_index = Math.floor(value * (stops.length - 1));
        var high_index = Math.ceil(value * (stops.length - 1));
        return { h: this.map_range(value, 0, 1, stops[low_index].h, stops[high_index].h),
                 s: this.map_range(value, 0, 1, stops[low_index].s, stops[high_index].s),
                 l: this.map_range(value, 0, 1, stops[low_index].l, stops[high_index].l),
                 a: alpha };
    },
    map_range: function(value, low1, high1, low2, high2) {
        if (high1 == low1){ return low2; }
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    },
    hsla: function(color){
        return "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")";
    }
};

/*******************************************
  Define init() methods for various regions
********************************************/

// Stage / Init
display.regions.stage.init = function(){

    display.nuclides_per_row = Math.ceil(Math.sqrt(matter.max_nuclides_per_element));

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

};

// Key / Init
display.regions.key.init = function(){

    display.time_slider = { w: 14, h: 3 };

    display.time_slider.y_margin      = 15 * display.scale;
    display.time_slider.slider_height = 3 * display.scale;
    display.time_slider.slider_width  = 14 * display.scale;
    display.time_slider.x_origin      = ((display.regions.key.regions.slider.w / 2) * display.scale) - (display.time_slider.slider_width / 2);
    display.time_slider.y_min = display.time_slider.y_margin;
    display.time_slider.y_max = (display.regions.key.regions.slider.h * display.scale) - (display.time_slider.y_margin + display.time_slider.slider_height);

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

    display.time_slider.mouse_events = d3.behavior.drag()
        .origin(function(d) { return d; })
        .on("drag", function(d){
            if (typeof d3.event.y == "undefined"){
                var y = d3.event.clientY;
            } else {
                var y = d3.event.y;
            }
            display.time_slider.slideTo(y, true);
        });

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

// Draw Nav
display.regions.nav.draw = function(){
    for (var button in display.regions.nav.regions){
        if (button == 'credit'){
            continue;
        }
        (function(button){
            // Draw nav graphic from external svg
            d3.xml("images/svg/"+button+".svg", "image/svg+xml", function(xml) {
                var nav_svg = document.importNode(xml.documentElement, true);
                d3.select("#" + button).append("title").text(display.regions.nav.regions[button].title);
                // Background rounded rectangle
                var w = (display.regions.nav.regions[button].w * display.scale) - (2 * display.scale);
                var h = (display.regions.nav.regions[button].h * display.scale) - (2 * display.scale);
                d3.select("#" + button).append("rect")
                    .attr("id", button + "_bg")
                    .attr("x", display.scale).attr("y", display.scale).attr("width", w).attr("height", h)
                    .attr("rx", 2 * display.scale).attr("ry", 2 * display.scale)
                    .attr("stroke", "rgb(255,255,255)").style("stroke-width","1")
                    .attr("fill", "url(#nav_gradient)").style("opacity", 0.33);
                // SVG container group
                d3.select("#" + button).append("g")
                    .attr("id", button + "_svg")
                    .attr("transform", "scale(" + display.scale + ")")
                    .node().appendChild(nav_svg);
                // Nav title
                d3.select("#" + button).append("text")
                    .attr("id", button + "_title")
                    .attr("class", "nav_title")
                    .attr("x", 22 * display.scale).attr("y", 8 * display.scale)
                    .attr("textLength", 34 * display.scale).attr("lengthAdjust", "spacing")
                    .attr("text-anchor", "middle")
                    .attr("fill", "rgb(127,127,127)")
                    .attr("filter", null)
                    .style("font-size", (5.5 * display.scale) + "px")
                    .text(button.slice(0,1).toUpperCase() + button.slice(1));
                // Nav hitbox
                d3.select("#" + button).append("rect")
                    .attr("id", button + "_hitbox")
                    .attr("class", "hitbox")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", display.regions.nav.regions[button].w * display.scale)
                    .attr("height", display.regions.nav.regions[button].h * display.scale)
                    .on("mouseover", function(){
                        display.highlightNav(button, true);
                    })
                    .on("mouseout", function(){
                        display.highlightNav(button, false);
                    })
                    .on("click", function(){
                        transition.fire(button);
                    });
            });
        })(button);
    }
};

// Draw Nav / Credit
display.regions.nav.regions.credit.draw = function(){
    var credit = d3.select("#credit").append("text")
        .attr("class", "credit")
        .attr("x", 0).attr("y", 0);
    credit.append("tspan")
        .attr("x", 0).attr("y", 2 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("Data provided by Brookhaven National Laboratory")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", 0).attr("dy", 2.5 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("http://www.nndc.bnl.gov/")
        .on("click", function(){ document.getElementById("credit_brookhaven").click(); });
    credit.append("tspan")
        .attr("x", 0).attr("dy", 3.5 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("Images provided by Images-of-Elements.com")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", 0).attr("dy", 2.5 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("http://images-of-elements.com/")
        .on("click", function(){ document.getElementById("credit_imagesofelements").click(); });
    credit.append("tspan")
        .attr("x", 0).attr("dy", 3.5 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("Developed, maintained, and open sourced by")
    credit.append("tspan")
        .attr("class", "credit href")
        .attr("x", 0).attr("dy", 2.5 * display.scale)
        .style("font-size", (2 * display.scale) + "px")
        .text("Christopher Clark (Frencil)")
        .on("click", function(){ document.getElementById("credit_frencil").click(); });
    credit.append("tspan")
        .attr("x", 0).attr("dy", 3.5 * display.scale)
        .style("font-size", (1.9 * display.scale) + "px")
        .text("© Copyright " + new Date().getFullYear() + " Nuclides.org • ");
    credit.append("tspan")
        .attr("class", "credit href")
        .style("font-size", (1.9 * display.scale) + "px")
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
    var g = d3.select("#detail").append("g").attr("id","key_elapsed_time").style("opacity", 0);
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

    // Draw Element Scale
    var escale = d3.select("#slider").append("g")
        .attr("id", "key_element_scale").style("opacity", 0);
    escale.append("title")
        .text("Elements are colored by how many isotopes they have: fewer is lighter yellow, more is darker green");
    escale.append("rect")
        .attr("id", "element_scale")
        .attr("x", (region_w / 2 - scale_w / 2) * display.scale).attr("y", y_margin * display.scale)
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

    // Draw Nuclide Scale
    d3.select("#slider").on("click", function(){
        if (!display.in_transition && display.current_layout != 'elements'){
            if (typeof d3.event.y == "undefined"){
                var use_y = d3.event.clientY;
            } else {
                var use_y = d3.event.y;
            }
            var y = use_y - (display.time_slider.slider_height / 2);
            display.time_slider.slideTo(y, false);
        }
    });
    var nscale = d3.select("#slider").append("g")
        .attr("id", "key_nuclide_scale").style("opacity", 0).style("cursor", "pointer");
    nscale.append("title")
        .text("Nuclides are colored by how long their half-life is: shorter is blue, longer is orange");
    nscale.append("rect")
        .attr("id", "nuclide_scale")
        .attr("x", (region_w / 2 - scale_w / 2) * display.scale).attr("y", y_margin * display.scale)
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

    // Draw Slider UI elements
    var nscale = d3.select("#key_nuclide_scale");
    var shadow = nscale.append("rect")
        .attr("id", "time_slider_shadow")
        .attr("x", (region_w / 2 - scale_w / 2) * display.scale).attr("y", display.time_slider.y)
        .attr("width", scale_w * display.scale).attr("height", 0)
        .attr("fill", "rgba(0,0,0,0.75)");
    var handle = nscale.append("rect")
        .data([display.time_slider])
        .attr("id", "time_slider_handle").attr("class", "handle")
        .attr("x", display.time_slider.x).attr("y", display.time_slider.y)
        .attr("width", display.time_slider.w * display.scale).attr("height", display.time_slider.h * display.scale)
        .attr("rx", display.scale).attr("ry", display.scale / 2)
        .attr("stroke", "rgb(255,255,255)").style("stroke-width","1")
        .attr("fill", "url(#slider_gradient)")
        .call(display.time_slider.mouse_events)
        .on("mouseover", function(){ display.time_slider.highlightSlider(true); })
        .on("mouseout", function(){ display.time_slider.highlightSlider(false); })
        .append("title").text("Move this slider up and down to simulate the passage of time and see nuclides decay according to their half-lives");

};

// Draw Stage
display.regions.stage.draw = function(){

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

    // Draw Stage / Dataset
    d3.select("#stage").append("g")
        .attr("id", "dataset")
        .attr("class", "element_group");

    // Draw Stage / Dataset / Elements
    d3.select("#dataset").selectAll(".element_display")
        .data(matter.elements)
        .enter().append("g")
        .attr("id", function(d){ return 'element_' + d.protons + '_display'; })
        .attr("class", function(d){ return 'element_display e' + d.protons; })
        .each(function(d, i) {
            var display_id = 'element_' + d.protons + '_display';
            var x = display.layouts.elements.getElementX(d);
            var y = display.layouts.elements.getElementY(d);
            var transform = "translate(" + x + "," + y + ")";
            d3.select("#"+this.id)
                .attr("transform", transform);
            d3.select("#" + display_id)
                .append("rect")
                .attr("class", "element_display e" + d.protons)
                .attr("width", display.layouts.elements.element.w * display.scale)
                .attr("height", display.layouts.elements.element.w * display.scale)
                .attr("fill", function(d){ return palette.element(d); });
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

    // Draw Stage / Dataset / Nuclides
    d3.select("#dataset").selectAll(".nuclide_display")
        .data( Object.keys(matter.nuclide_name_map).map(function (key) {return matter.nuclide_name_map[key]}) )
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
            var display_id = 'element_' + d.protons + '_nuclides_' + d.neutrons + '_display';
            d3.select("#"+display_id)
                .append("rect")
                .attr("class", function(d){ return "nuclide_display e" + d.protons + " n" + d.neutrons; })
                .attr("width", display.layouts.elements.nuclide.w * display.scale)
                .attr("height", display.layouts.elements.nuclide.w * display.scale)
                .attr("fill", function(d){ return palette.nuclide(d); })
                .style("stroke-width", 0.1);
            var label = d3.select("#" + display_id)
                .append("text")
                .attr("id", function(d){ return "element_" + d.protons + "_nuclides_" + d.neutrons + "_label"; })
                .attr("class", function(d){ return "nuclide_display e" + d.protons + " n" + d.neutrons; })
                .attr("fill", function(d){ return palette.nuclideLabel(d); })
                .attr("x", 0)
                .attr("y", 0)
                .style("opacity",0);
            var label_unit = (display.layouts.isotopes.nuclide.w * display.scale) / 10;
            var tspan = label.append("tspan")
                .attr("x", 8.5 * label_unit)
                .attr("y", 8 * label_unit)
                .attr("text-anchor", "end")
                .style("font-size", 4 * label_unit + "px")
                .text(function(d){ return d.parentElement.symbol });
            var number = d.protons + d.neutrons;
            var tspan2 = label.append("tspan")
                .attr("x", 1.5 * label_unit)
                .attr("y", 3.8 * label_unit)
                .style("font-size", 2.7 * label_unit + "px")
                .text(number);
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
    var zoom_nuclide = zoom_g.append("g")
        .attr("id", "zoom_nuclide_nuclide")
        .style("display", "none");
    zoom_nuclide.append("rect")
        .attr("id", "zoom_nuclide_main_display")
        .attr("class", "zoom_nuclide")
        .attr("width", w).attr("height", w)
        .attr("x", 0).attr("y", 0)
        .attr("filter", "url(#highlight-glow)");
    var zoom_label = zoom_nuclide.append("text")
        .attr("id", "zoom_nuclide_label")
        .attr("class", "zoom_nuclide")
        .attr("x", 0).attr("y", 0);
    zoom_label.append("tspan")
        .attr("id", "zoom_nuclide_label_symbol")
        .attr("x", 8.5 * label_unit)
        .attr("y", 8 * label_unit)
        .attr("text-anchor", "end")
        .style("font-size", 4 * label_unit + "px");
    zoom_label.append("tspan")
        .attr("id", "zoom_nuclide_label_number")
        .attr("x", 1.5 * label_unit)
        .attr("y", 3.8 * label_unit)
        .style("font-size", 2.7 * label_unit + "px");
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
        .style("font-size", (line_height * 0.8) + "px");
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_neutrons")
        .attr("class", "em2")
        .attr("x", w / 6).attr("dy", line_height)
        .style("font-size", (line_height * 0.8) + "px");
    zoom_info_text.append("tspan")
        .attr("id", "zoom_nuclide_info_halflife")
        .attr("class", "em3")
        .attr("x", w / 6).attr("dy", line_height)
        .style("font-size", (line_height * 0.8) + "px");

    // Draw Stage / Hitboxes
    d3.select("#stage").append("g")
        .attr("id", "hitboxes");

    // Element hitboxes
    d3.select("#hitboxes").selectAll(".hitbox.element")
        .data(matter.elements)
        .enter().append("rect")
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
        })
        .append("title").text(function(d){ return "Click to show the Isotopes of " + d.name + " (" + d.symbol + ")"; });

    // Nuclide hitboxes
    d3.select("#hitboxes").selectAll(".hitbox.nuclide")
        .data( Object.keys(matter.nuclide_name_map).map(function (key) {return matter.nuclide_name_map[key]}) )
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

};
