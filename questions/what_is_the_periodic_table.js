"use strict";

questions.cache['what_is_the_periodic_table'] = {

    title: "What is the Periodic Table",

    state: {
        elements_shown: true,
        some_nuclides_shown: false,
        all_nuclides_shown: false,
        scale: "elements"
    },

    components: {
        thumbnails: { x: 6, y: 28, show: true }
    },
    
    periodic_table: {
        origin:  { x: 6, y: 28 },
        element: { w: 9, m: 1 },
        nuclide: { w: (9 / display.nuclides_per_row) * 0.9, m: (9 / display.nuclides_per_row) * 0.1 },
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

    captions: [
        { x: 28, y: 5, line_height: 3.1,
          copy: "[em1]Elements[em1] are the building blocks of all [em2]chemistry[em2]. All stuff in the universe[br]is made of [em1]atoms[em1] and an element is just one type of atom. Science has[br]found [em3]" + (matter.elements.length-1) + " total elements[em3]. They are all arranged here in what's called the[br][em3]Periodic Table of Elements[em3]."
              + "[br] [br]If it's an element that exists in nature, or even if it only exists in laboratories,[br]it's on this table. There are many familiar ones such as [link]Carbon[link], [link]Oxygen[link],[br][link]Gold[link], and [link]Silver[link], as well as some that may seem unfamiliar such as[br][link]Ytterbium[link], [link]Antimony[link], or [link]Bismuth[link]."
              + "[br] [br]While each element is a distinct \"flavor\" of atom, each element in turn has[br]many \"flavors\" called [em2]isotopes[em2]. Click any element here to learn more or[br]use the navigation on the left to explore."
        }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Chart of Nuclides?',
    ],
    
    load: function(callback) {
        
        // Hide standard scale
        d3.select("#key_nuclide_scale").transition()
            .duration(500 * display.transition_speed)
            .style("opacity", 0);
        d3.select("#key_elapsed_time").transition()
            .duration(500 * display.transition_speed)
            .style("opacity", 0);

        // Hide element labels
        d3.selectAll("text.element_display").style("opacity", 0);

        // Hide all nuclides if necessary
        if (questions.current.some_nuclides_shown){
            display.hideAllNuclides(500);
        }     

        // Move the elements to their proper position
        //showPeriodicTable( coords, duration, delay, stagger_delay )
        if (questions.current.all_nuclides_shown){
            var wait_to_finalize = 11000;
            display.showPeriodicTable(2000, 1000, 64);
        } else {
            var wait_to_finalize = 500;
            display.showPeriodicTable(500);
        }

        // Show captions and components
        display.showCaptions(500, wait_to_finalize);
        display.showComponents(500, wait_to_finalize);

        // Show element scale
        d3.select("#key_element_scale").transition()
            .delay(wait_to_finalize * display.transition_speed).duration(500 * display.transition_speed)
            .style("opacity", 1);

        // Show element labels
        d3.selectAll("text.element_display").transition()
            .delay((wait_to_finalize + 500) * display.transition_speed)
            .duration(500 * display.transition_speed)
            .selectAll("text.element_display").style("opacity",1);

        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, (wait_to_finalize + 1000) * display.transition_speed);
        
    },

    setHitboxes: function(){
        var w = display.scale * (this.periodic_table.element.w + this.periodic_table.element.m);
        d3.selectAll(".hitbox.element")
            .attr("display", null)
            .attr("width", w).attr("height", w)
            .attr("transform", function(d){
                var coords = this.periodic_table.getElementCoords(d);
                return "translate(" + coords[0] + "," + coords[1] + ")";
            });
    }

};

