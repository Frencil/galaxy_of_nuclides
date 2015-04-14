"use strict";

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
        
        // Time: Object for controlling elapsed time to illustrate decay
        time:  { x: 192, y: 0, w: 64, h: 160,
                 regions: { detail: { x: 0, y: 0, w: 44, h: 28 },
                            slider: { x: 44, y: 0, w: 20, h: 160 }
                          }
               },
        
        // Stage: Main object for displaying data
        stage: { x: 44, y: 28, w: 192, h: 132 }
        
    },
    
    // Layouts are displayed only inside the area defined by the stage
    // object. These objects provide details for specific layouts.
    layouts: { periodic_table:    { data: { x: 6, y: 28, w: 180, h: 100 },
                                    element: { w: 9, m: 1 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info: { x: 28, y: 5, w: 91, h: 50 },
                                    image: { x: 122, y: 5, w: 52, h: 29 },
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
                                        var index   = nuclide.neutrons - element.min_neutrons;
                                        return origin + (index % display.nuclides_per_row) * base;
                                    },
                                    getNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.periodic_table.nuclide.w
                                                                  + display.layouts.periodic_table.nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.periodic_table.getElementY(element);
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
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info").append("text")
                                            .attr("id", "info_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "[em1]Elements[em1] are the building blocks of all [em2]chemistry[em2]. All stuff in the universe[br]is made of [em1]atoms[em1] and an element is just one type of atom. Science has[br]found [em3]" + (matter.elements.length-1) + " total elements[em3]. They are all arranged here in what's called the[br][em3]Periodic Table of Elements[em3]."
                                                    + "[br] [br]If it's an element that exists in nature, or even if it only exists in laboratories,[br]it's on this table. There are many familiar ones such as [link]Carbon[link], [link]Oxygen[link],[br][link]Gold[link], and [link]Silver[link], as well as some that may seem unfamiliar such as[br][link]Ytterbium[link], [link]Antimony[link], or [link]Bismuth[link]."
                                                    + "[br] [br]While each element is distinct \"flavor\" of atom, each element in turn has[br]many \"flavors\" called [em2]isotopes[em2]. Click any element here to learn more or[br]use the navigation on the left to explore.";
                                        display.printTextBlock(blurb, content, 0, title_height + line_height, line_height);
                                    }
                                  },

               chart_of_nuclides: { data: { x: 5, y: 7, w: 180, h: 120 },
                                    element: { w: 2.6, m: 0.288 },
                                    nuclide: { w: .6, m: .4 },
                                    table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info: { x: 12, y: 8, w: 112, h: 116 },
                                    image: { x: 132, y: 98, w: 52, h: 29 },
                                    periodic_table: { x: 132, y: 60, w: 52, h: 30 },
                                    extras: {
                                        xaxis: { },
                                        yaxis: { }
                                    },
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
                                        var index   = nuclide.neutrons - element.min_neutrons;
                                        return origin + (index % display.nuclides_per_row) * base;
                                    },
                                    getTableNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.chart_of_nuclides.table_nuclide.w
                                                                  + display.layouts.chart_of_nuclides.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.chart_of_nuclides.getElementY(element);
                                        var index   = nuclide.neutrons - element.min_neutrons;
                                        return origin + Math.floor(index / display.nuclides_per_row) * base;
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
                                    },
                                    removeAxes: function(){
                                        d3.select("#axes").remove();
                                    },
                                    drawAxes: function(){
                                        if (d3.select("#axes")[0][0] != null){
                                            display.layouts.chart_of_nuclides.removeAxes();
                                        }
                                        var origin_x = 2;
                                        var origin_y = display.regions.stage.h - 2
                                        var end_x = display.regions.stage.w - 2
                                        var end_y = 2;
                                        var axes = d3.select("#extras").append("g")
                                            .attr("id", "axes");
                                        axes.append("path")
                                            .attr("id", "x-axis")
                                            .attr("d", pathString([origin_x, origin_y, end_x, origin_y]))
                                            .attr("stroke","#FFFFFF").attr("stroke-width","2")
                                            .attr("fill","none")
                                            .style("opacity", 0);
                                        axes.append("path")
                                            .attr("id", "y-axis")
                                            .attr("d", pathString([origin_x, origin_y, origin_x, end_y]))
                                            .attr("stroke","#FFFFFF").attr("stroke-width","2")
                                            .attr("fill","none")
                                            .style("opacity", 0);
                                        d3.select("#x-axis").transition().duration(5000)
                                            .style("opacity", 1);
                                        d3.select("#y-axis").transition().duration(5000)
                                            .style("opacity", 1);
                                    },
                                    setInfo: function(){
                                        d3.selectAll(".blurb").remove();
                                        var title = "Chart of Nuclides";
                                        var title_height = display.scale * 5.5;
                                        var line_height = display.scale * 3.2;
                                        d3.select("#info_title")
                                            .attr("x", 0)
                                            .attr("y", title_height)
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info").append("text")
                                            .attr("id", "info_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "Atoms are made of [em1]protons[em1], [em2]neutrons[em2], and [em3]electrons[em3]. The number of [em1]protons[em1] in an atom determines its[br][em1]chemistry[em1] and thus what [em1]element[em1] it is. The number of [em2]neutrons[em2] an atom has can vary for every element.[br]More neutrons make the element [em2]heavier[em2] without changing its chemistry. Atoms of the same[br]element with different numbers of neutrons are called [em3]isotopes[em3] of that element."
                                            + "[br] [br]Every isotope is a [em3]nuclide[em3], or a type of atom found in nature. There are [em1]" + (matter.elements.length-1) + "[em1] total[br]elements and [em2]each has between 1 and " + matter.max_nuclides_per_element + " known isotopes[em2], making for[br][em3]" + matter.total_nuclides + " total known nuclides[em3]. All nuclides are shown here on[br]the [em3]Chart of Nuclides[em3]."
                                            + "[br] [br]Some nuclides have particular significance and may even[br]sound familiar, such as [link]Carbon-14[link], [link]Uranium-235[link],[br]or [link]Americium-241[link]. Click anywhere on the[br][em3]Chart of Nuclides[em3] or the [em1]Periodic Table[em1][br]guide to the right for a closer look at[br]isotopes and for a single element.";
                                        display.printTextBlock(blurb, content, 0, title_height + line_height, line_height);
                                    }
                                  },

               element_detail:    { data: { x: 136, y: 4, w: 52, h: 52 },
                                    element: { w: 2.6, m: 0.288 },
                                    nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    table_nuclide: { w: null, m: null }, // These get set in setDisplayVars()
                                    info: { x: 4, y: 4, w: 128, h: 48 },
                                    image: { x: 136, y: 98, w: 52, h: 29 },
                                    periodic_table: { x: 136, y: 62, w: 52, h: 30 },
                                    big_image: { x: 4, y: 56, w: 128, h: 72 },
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
                                        var index   = nuclide.neutrons - element.min_neutrons;
                                        return origin + (index % display.nuclides_per_row) * base;
                                    },
                                    getTableNuclideY: function(nuclide){
                                        var base = display.scale * (display.layouts.element_detail.table_nuclide.w
                                                                  + display.layouts.element_detail.table_nuclide.m);
                                        var element = matter.elements[nuclide.protons];
                                        var origin  = display.layouts.element_detail.getElementY(element);
                                        var index   = nuclide.neutrons - element.min_neutrons;
                                        return origin + Math.floor(index / display.nuclides_per_row) * base;
                                    },
                                    getDataNuclideX: function(nuclide){
                                        var base   = display.scale * (display.layouts.element_detail.nuclide.w
                                                                    + display.layouts.element_detail.nuclide.m);
                                        var origin = display.scale * display.layouts.element_detail.data.x;
                                        if (typeof nuclide == 'object'){
                                            var element = matter.elements[nuclide.protons];
                                            var index   = nuclide.neutrons - element.min_neutrons;
                                        } else {
                                            var index = nuclide;
                                        }
                                        return origin + (index % display.nuclides_per_row) * base;
                                    },
                                    getDataNuclideY: function(nuclide){
                                        var base    = display.scale * (display.layouts.element_detail.nuclide.w
                                                                    + display.layouts.element_detail.nuclide.m);
                                        var origin  = display.scale * display.layouts.element_detail.data.y;
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
                                        var title = "Isotopes of " + matter.elements[display.next_element_detail_focus].name;
                                        var title_height = display.scale * 5.5;
                                        var line_height = display.scale * 3.1;
                                        var origin_x = display.layouts.element_detail.info.x * display.scale;
                                        var origin_y = display.layouts.element_detail.info.y * display.scale;
                                        d3.select("#info_title")
                                            .attr("x", origin_x)
                                            .attr("y", origin_y + title_height)
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info").append("text")
                                            .attr("id", "info_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "[em3]Information coming soon...[em3]";
                                        display.printTextBlock(blurb, content, origin_x, origin_y + title_height + line_height, line_height);
                                    },
                                    removeBigImage: function(){
                                        d3.select("#big_image").remove();
                                    },
                                    drawBigImage: function(){
                                        if (d3.select("#big_image")[0][0] != null){
                                            display.layouts.element_detail.removeBigImage();
                                        }
                                        var image_x = display.scale * display.layouts.element_detail.big_image.x;
                                        var image_y = display.scale * display.layouts.element_detail.big_image.y;
                                        var image_w = display.scale * display.layouts.element_detail.big_image.w;
                                        var image_h = display.scale * display.layouts.element_detail.big_image.h;
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

    available_width:     0,
    available_height:    0,

    nuclides_per_row:    0,
    in_transition:       true, // boolean to track if in transition or loading (a type of transition)
    current_layout:      'setup',
    next_layout:         'periodic_table',

    // proton values for whichever element currently shown (or to be shown next) in the element detail layout
    element_detail_focus: null,
    next_element_detail_focus: null,

    // Shorthand function for toggling highlight on svg objects
    highlight: function(svg_object, bool){
        if (bool){
            svg_object
                .attr("filter", "url(#highlight-glow)");
        } else {
            svg_object
                .attr("filter", "none");
        }
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
            case '[br]':
                tspans.push({ text: '', class: null, mouse: null,
                              x: origin_x, y: null, dy: line_height,  });
                t++;
                break;
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
            selector.append("tspan")
                .attr("class", tspan.class)
                .attr("x", tspan.x)
                .attr("y", tspan.y)
                .attr("dy", tspan.dy)
                .text(tspan.text);
        }
    }

};
