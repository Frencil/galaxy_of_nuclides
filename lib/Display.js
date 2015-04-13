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
                                    setInfo: function(){
                                        d3.selectAll(".blurb").remove();
                                        var title = "Periodic Table of Elements";
                                        var title_height = display.scale * 5.5;
                                        var line_height = display.scale * 3.1;
                                        var origin_x = display.layouts.periodic_table.info1.x * display.scale;
                                        var origin_y = display.layouts.periodic_table.info1.y * display.scale;
                                        d3.select("#info1_title")
                                            .attr("x", origin_x)
                                            .attr("y", origin_y + title_height)
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info1").append("text")
                                            .attr("id", "info1_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "**Elements** are the building blocks of all **chemistry**.$$All stuff in the universe is made of **atoms** and an$$element is one type of atom. Science has found$$**" + (matter.elements.length-1) + " total elements**. They are all arranged here in$$the **Periodic Table of Elements**.$$ $$While each element is distinct \"flavor\" of atom,$$each element in turn has many \"flavors\" called$$**isotopes**. Click any element here to learn more$$or use the navigation on the left to explore.";
                                        display.printTextBlock(blurb, content, origin_x, origin_y + title_height + line_height, line_height);
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
                                    setInfo: function(){
                                        d3.selectAll(".blurb").remove();
                                        var title = "Chart of Nuclides";
                                        var title_height = display.scale * 5.5;
                                        var line_height = display.scale * 2.5;
                                        var origin_x = display.layouts.chart_of_nuclides.info1.x * display.scale;
                                        var origin_y = display.layouts.chart_of_nuclides.info1.y * display.scale;
                                        d3.select("#info1_title")
                                            .attr("x", origin_x)
                                            .attr("y", origin_y + title_height)
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info1").append("text")
                                            .attr("id", "info1_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "Atoms are made of protons, neutrons, and electrons. The number of **protons** an atom has determines$$its **chemistry**, and thus what **element** it is. The number of **neutrons** an atom has can vary for every$$element. More neutrons make the element **heavier**. Atoms of the same element with different$$numbers of neutrons are called **isotopes** of that element.$$ $$Every isotope is a **nuclide**, or a type of atom found in nature. There are **" + (matter.elements.length-1) + "** total elements and **each**$$**has between 1 and " + matter.max_nuclides_per_element + " known isotopes**, making for **" + matter.total_nuclides + " total known nuclides**. All nuclides are$$shown here on the **Chart of Nuclides**. Click anywhere on the chart or the Periodic Table guide to the$$right to see the isotopes and other information for a single element.";
                                        display.printTextBlock(blurb, content, origin_x, origin_y + title_height + line_height, line_height);
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
                                        var origin_x = display.layouts.element_detail.info1.x * display.scale;
                                        var origin_y = display.layouts.element_detail.info1.y * display.scale;
                                        d3.select("#info1_title")
                                            .attr("x", origin_x)
                                            .attr("y", origin_y + title_height)
                                            .attr("font-size", title_height * 0.85)
                                            .text(title);
                                        var blurb = d3.select("#info1").append("text")
                                            .attr("id", "info1_blurb")
                                            .attr("class", "info blurb")
                                            .attr("font-size", line_height * 0.85);
                                        var content = "**Information coming soon...**";
                                        display.printTextBlock(blurb, content, origin_x, origin_y + title_height + line_height, line_height);
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
                .attr("stroke", "rgb(255,255,255)")
                .attr("filter", "url(#highlight-glow)");
        } else {
            svg_object
                .attr("stroke", "rgb(196,196,196)")
                .attr("filter", "none");
        }
    },

    // Helper function to print a marked-up string into a paragraph block
    // Use "$$" for a line break and wrap bolded terms in "**"
    // E.g.: "This is one line with a **bold** word;$$This is a new line.";
    printTextBlock: function(selector, raw_text, origin_x, origin_y, line_height){
        var lines = raw_text.split("$$");
        var tspans = [];
        for (l in lines){
            var line = lines[l];
            if (line.indexOf("**") != -1){
                sublines = line.split("**");
                var newline = true;
                for (sl in sublines){
                    var subline = sublines[sl];
                    if (!subline.length){ continue; }
                    var subclass = "";
                    if ((sl % 2) == 1){
                        subclass = "em";
                    }
                    tspans.push({ text: subline, class: subclass, newline: newline });
                    var newline = false;
                }
            } else {
                tspans.push({ text: line, class: "", newline: true });
            }
        }
        for (t in tspans){
            var line   = tspans[t];
            var y_attr = "dy";
            var y_val  = line_height;
            if (t == 0){
                y_attr = "y";
                y_val  = origin_y + line_height;
            }
            if (line.newline){
                selector.append("tspan")
                    .attr("class", line.class)
                    .attr("x", origin_x)
                    .attr(y_attr, y_val)
                    .text(line.text);
            } else {
                selector.append("tspan")
                    .attr("class", line.class)
                    .text(line.text);
            }
        }
    }

};
