"use strict";

// Initialize master data object for display variables
var display = {

    // All top-level regions represent areas of the canvas at their
    // smallest resolution, with optimal resolutions being integer
    // multiples of everything
    area:    { w: 256, h: 160 },
    regions: {

        // Nav: Large buttons for switching between layouts; graphics are external svg files
        nav:   { x: 0, y: 28, w: 44, h: 108,
                 regions: { elements:    { x: 0, y: 0, w: 44, h: 36 },
                            nuclides: { x: 0, y: 36, w: 44, h: 36 },
                            isotopes:    { x: 0, y: 72, w: 44, h: 36 },
                            credit:            { x: 0, y: 108, w: 44, h: 24 }
                          }
               },
        
        // Time: Object for controlling elapsed time to illustrate decay
        time:  { x: 192, y: 0, w: 64, h: 160,
                 regions: { detail: { x: 0, y: 0, w: 44, h: 28 },
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
                var title = "Periodic Table of Elements";
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
                    + "[br] [br]While each element is distinct \"flavor\" of atom, each element in turn has[br]many \"flavors\" called [em2]isotopes[em2]. Click any element here to learn more or[br]use the navigation on the left to explore.";
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
                var title = "Chart of Nuclides";
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
                if (display.next_isotopes_focus == 0){
                    var title = "The Neutron";
                } else {
                    var title = "Isotopes of " + matter.elements[display.next_isotopes_focus].name;
                }
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
    
    // Scale is an integer value to allow for discrete geometric
    // scaling of the application for different viewport sizes
    scale: 1,

    available_width:  0,
    available_height: 0,

    nuclides_per_row: 0,
    in_transition:    true, // boolean to track if in transition or loading (a type of transition)
    current_layout:   'setup',
    next_layout:      'elements',

    // proton values for whichever element currently shown (or to be shown next) in the element detail layout
    isotopes_focus: null,
    next_isotopes_focus: null,

    // Multiplier used for transition timing
    transition_speed: 0.8,

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
                var fill = d3.select("rect.nuclide_display.e" + nuclide.protons + ".n" + nuclide.neutrons).attr("fill");
                d3.select("#zoom_nuclide_nuclide")
                    .style("display", null);
                // Set main rect
                d3.select("#zoom_nuclide_main_display")
                    .attr("fill", fill);
                // Set symbol
                var symbol_textLength = null;
                if (nuclide.parentElement.symbol.length > 2){
                    symbol_textLength = (4 * label_unit) + "px";
                }
                d3.select("#zoom_nuclide_label_symbol")
                    .attr("textLength", symbol_textLength).attr("lengthAdjust", "spacingAndGlyphs")
                    .text(nuclide.parentElement.symbol);
                // Set number
                var number_textLength = null;
                if (number > 99){
                    number_textLength = (3.1 * label_unit) + "px";
                }
                d3.select("#zoom_nuclide_label_number")
                    .attr("textLength", number_textLength).attr("lengthAdjust", "spacingAndGlyphs")
                    .text(number);
            }

            // Position and show info
            if (display.current_layout == 'nuclides'){
                var info_x = zoom_w * 1.2;
                var info_y = -1 * (zoom_w / 4);
            } else if (display.current_layout == 'isotopes'){
                var info_x = 0;
                var info_y = 0;
            }
            if (nuclide.neutrons > (matter.max_neutrons * 0.7)){
                info_x = zoom_w * -6.2;
            }
            d3.select("#zoom_nuclide_info")
                .attr("transform", "translate(" + info_x + ", " + info_y + ")");

            // Set info text
            d3.select("#zoom_nuclide_info_name").text(nuclide.parentElement.name + '-' + number);
            d3.select("#zoom_nuclide_info_protons").text("Protons: " + nuclide.protons);
            d3.select("#zoom_nuclide_info_neutrons").text("Neutrons: " + nuclide.neutrons);
            d3.select("#zoom_nuclide_info_halflife").text("Half-Life: " + nuclide.halflife.humanReadable(false));

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

    // Helper function to print a marked-up string into a paragraph block
    // Use "[br]" for a line break and wrap emphasized terms in [em1], [em2], or [em3] tags.
    // Links to elements and nuclides can be wrapped in [link] tags and must match an
    // element or nuclide name to function.
    // E.g.: "This is a sample text block.[br]It includes things that are [em1]emphasized[em1],
    //        [em2]more[em2], and [em3]even more[em3].[br]There are also links to named things
    //        like [link]Carbon[link] and [link]Carbon-14[link]."
    printTextBlock: function(selector, raw_text, origin_x, origin_y, line_height){
        var tspans = [];
        var nodes = raw_text.split(/(\[\w+\])/);
        var n = 0, t = 0;
        tspans.push({ text: '', class: null, mouse: null,
                      x: origin_x, y: (origin_y + line_height), dy: null });
        while (n < nodes.length){
            switch (nodes[n]){
            // Line breaks
            case '[br]':
                tspans.push({ text: '', class: null, mouse: null,
                              x: origin_x, y: null, dy: line_height,  });
                t++;
                break;
            // Emphasis
            case '[em1]':
            case '[em2]':
            case '[em3]':
                var node_class = nodes[n].slice(1,4);
                if (tspans[t].class == node_class){
                    tspans.push({ text: '', class: null, mouse: null,
                                  x: null, y: null, dy: null });
                    t++;
                } else {
                    if (tspans[t].text.length == 0){
                        tspans[t].class = node_class;
                    } else {
                        tspans.push({ text: '', class: node_class, mouse: null,
                                      x: null, y: null, dy: null });
                        t++;
                    }
                }
                break;
            // Links (requires match to matter.element_name_map or matter.nuclide_name_map)
            case '[link]':
                if (tspans[t].mouse == null){
                    if (tspans[t].text.length == 0){
                        tspans[t].class = "link";
                        tspans[t].mouse = "mouse";
                    } else {
                        tspans.push({ text: '', class: "link", mouse: "mouse",
                                      x: null, y: null, dy: null });
                        t++;
                    }
                } else {
                    tspans.push({ text: '', class: null, mouse: null,
                                  x: null, y: null, dy: null });
                    t++;
                }
                break;
            default:
                tspans[t].text += nodes[n];
                break;
            }
            n++;
        }
        // Render tspans to the selector
        for (var t in tspans){
            var tspan = tspans[t];
            var node = selector.append("tspan")
                .attr("class", tspan.class)
                .attr("x", tspan.x)
                .attr("y", tspan.y)
                .attr("dy", tspan.dy)
                .text(tspan.text);
            if (tspan.mouse){
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
        return this.hsla(this.getColor(relative_halflife, 1, 'nuclide'));
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
}