"use strict";

questions.cache['what_is_a_nuclide'] = {

    title: "What is a Nuclide?",

    scale: "nuclide",

    components: {
        thumbnail: { x: 132, y: 94 },
        nuclide_hover: { x: 0, y: -100 }
    },
  
    periodic_table: {
        origin:  { x: 132, y: 60 },
        element: { w: 2.6, m: 0.288 },
        nuclide: { w: (2.6 / display.nuclides_per_row), m: 0 },
        show_labels: false,
        transition: { duration: 2000, delay: 500, stagger_delay: 0 },
        coordsFunction: display.periodic_table.getElementCoords
    },

    chart_of_nuclides: {
        origin:  { x: 5, y: 7, w: 180, h: 120 },
        nuclide: { w: .7, m: .3 },
        transition: { duration: 2000, delay: 0, stagger_delay: 0 },
        coordsFunction: display.chart_of_nuclides.getNuclideCoords,
        show_labels: false,
        highlight_row: true
    },

    captions: [
        { x: 10, y: 8, line_height: 3.1,
          copy: "Atoms are made of [q]protons|What is a Proton?[q], [q]neutrons|What is a Neutron?[q], and [q]electrons|What is an Electron?[q]. The number of in an atom determines what element it is (and therefore its chemistry).[br]Atoms of the same element can, however, have different numbers of neutrons inside their nuclei. More neutrons make an element[br]heavier without changing its chemistry. [em1]Atoms of the same element with different numbers of neutrons in the nucleus[em1][br][em1]are called \"isotopes\" of that element.[em1]"
          + "[br] [br][em2]Every distinct isotope is a nuclide, or a type of atom found in nature.[em2] Put another way, a nuclide is any[br]combination of protons and neutrons that can be observed. [em2]Science has discovered " + (matter.total_nuclides.toString().slice(0,1)+','+matter.total_nuclides.toString().slice(1)) + " nuclides to date[em2][br]and new ones are still being discovered as time goes on in laboratories around the world!"
          + "[br] [br][em3]All nuclides are shown here on the Chart of Nuclides.[em3] It plots neutrons along the[br]x-axis and protons along the y-axis. The dark line up the middle are the stable[br]nuclides. These are the versions of elements most commonly found in[br]nature, like most of the [link]Carbon[link] in your body and most of the[br][link]Oxygen[link] in the air you're breathing."
          + "[br] [br][em4]Most nuclides are unstable.[em4] When a nuclide is unstable[br]it will [q]decay|How do atoms decay?[q] over time, releasing energy known as[br][q]radiation|What is Radiation?[q] and turning into a more stable nuclide."
        },
        { x: 156, y: 40, line_height: 2.5,
          copy: "[em4]Use the slider to simulate the[em4][br][em4]passage of time and see how[em4][br][em4]all the different nuclides decay[em4][br][em4]at very different rates →[em4]"
        }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Atom?',
        'What is an Element?',
        'What is a Proton?',
        'What is a Neutron?',
        'How do Atoms Decay?',
        'What makes an Atom Stable?',
    ],
    
    load: function(callback) {

        // Hide all nuclide labels
        d3.selectAll("text.nuclide_label").style("display", "none");   

        // Draw chart axes
        var start_x   = 3;
        var start_y   = display.regions.stage.h - 3
        var end_x     = display.regions.stage.w - 6
        var end_y     = 9;
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
        
        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, (1000) * display.transition_speed);

    }

}

