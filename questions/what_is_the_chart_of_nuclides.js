"use strict";

questions.cache['what_is_the_chart_of_nuclides'] = {

    title: "What is The Chart of Nuclides",

    state: {
        elements_shown: true,
        some_nuclides_shown: true,
        all_nuclides_shown: true,
        scale: "nuclides"
    },

    components: {
        thumbnails: { x: 132, y: 94, show: true }
    },
    
    periodic_table: {
        origin:  { x: 132, y: 60 },
        element: { w: 2.6, m: 0.288 },
        nuclide: { w: (2.6 / display.nuclides_per_row), m: 0 },
        getElementCoords: function(element){
            var base = display.scale * (this.periodic_table.element.w + this.periodic_table.element.m);
            var x = display.scale * this.periodic_table.origin.x;
            var y = display.scale * this.periodic_table.origin.y;
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
        getNuclideCoords: function(nuclide){
            var base   = display.scale * (this.periodic_table.nuclide.w + this.periodic_table.nuclide.m);
            var origin = this.periodic_table.getElementCoords(nuclide.parentElement);
            var index  = nuclide.neutrons - element.min_neutrons;
            var x = origin[0] + (index % display.nuclides_per_row) * base;
            var y = origin[1] + Math.floor(index / display.nuclides_per_row) * base;
            return [x, y];
        }
    },

    chart_of_nuclides: {
        origin:  { x: 5, y: 7, w: 180, h: 120 },
        nuclide: { w: .7, m: .3 },
        getNuclideCoords: function(nuclide){
            var base = display.scale * (this.chart_of_nuclides.nuclide.w + this.chart_of_nuclides.nuclide.m);
            var x = display.scale * this.chart_of_nuclides.origin.x + nuclide.neutrons * base;
            var y = display.scale * this.chart_of_nuclides.origin.y + (120 - nuclide.protons) * base;
            return [x, y];
        },
        drawAxes: function(){
            var start_x   = 3;
            var start_y   = display.regions.stage.h - 3
            var end_x     = display.regions.stage.w - 6
            var end_y     = 6;
            var origin_x  = this.chart_of_nuclides.origin.x;
            var origin_y  = display.regions.stage.h - this.chart_of_nuclides.origin.y;
            var tick_step = 10 * (this.chart_of_nuclides.nuclide.w + this.chart_of_nuclides.nuclide.m);
            var axes = d3.select("#specifics").append("g")
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
                    var tick_y = (this.chart_of_nuclides.origin.h - t) + this.chart_of_nuclides.origin.y;
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
        }
    },

    captions: [
        { x: 12, y: 8, line_height: 3.1,
          copy:  "Atoms are made of [em1]protons[em1], [em2]neutrons[em2], and [em3]electrons[em3]. The number of [em1]protons[em1] in an atom determines its[br][em1]chemistry[em1] and thus what [em1]element[em1] it is. The number of [em2]neutrons[em2] an atom has can vary for every element.[br]More neutrons make the element [em2]heavier[em2] without changing its chemistry. Atoms of the same[br]element with different numbers of neutrons are called [em3]isotopes[em3] of that element."
               + "[br] [br]Every isotope is a [em3]nuclide[em3], or a type of atom found in nature. There are [em1]" + (matter.elements.length-1) + "[em1] total[br]elements and [em2]each has between 1 and " + matter.max_nuclides_per_element + " known isotopes[em2], making for[br][em3]" + matter.total_nuclides + " total known nuclides[em3]. All nuclides are shown here on[br]the [em3]Chart of Nuclides[em3]."
               + "[br] [br]Some nuclides have particular significance and may even[br]sound familiar, such as [link]Carbon-14[link], [link]Uranium-235[link],[br]or [link]Americium-241[link]. Click anywhere on the[br][em3]Chart of Nuclides[em3] or the [em1]Periodic Table[em1][br]guide to the right for a closer look at[br]isotopes and for a single element."
        }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Periodic Table?',
    ],
    
    load: function(callback) {
        
        // Show all nuclides if not yet shown
        if (!questions.current.all_nuclides_shown){
            display.hideAllNuclides(500);
        }

        // Move the elements to their proper position
        display.showPeriodicTable(1000);

        // Show captions and components
        display.showCaptions(500, 0, 50);
        display.showComponents(500, 500);
        
        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, (1000) * display.transition_speed);

    },

    setHitboxes: function(){
        var ew = display.scale * (this.periodic_table.element.w + this.periodic_table.element.m);
        d3.selectAll(".hitbox.element")
            .attr("display", null)
            .attr("width", ew).attr("height", ew)
            .attr("transform", function(d){
                var coords = this.periodic_table.getElementCoords(d);
                return "translate(" + coords[0] + "," + coords[1] + ")";
            });
        var nw = display.scale * (this.chart_of_nuclides.nuclide.w + this.chart_of_nuclides.nuclide.m);
        d3.selectAll(".hitbox.nuclide")
            .attr("display", null)
            .attr("width", nw).attr("height", nw)
            .attr("transform", function(d){
                var coords = this.chart_of_nuclides.getNuclideCoords(d);
                return "translate(" + coords[0] + "," + coords[1] + ")";
            });
    }

}

