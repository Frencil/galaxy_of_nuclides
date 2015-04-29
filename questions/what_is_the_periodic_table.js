"use strict";

questions.cache['what_is_the_periodic_table'] = {

    title: "What is the Periodic Table?",

    scale: "element",

    components: {
        thumbnail: { x: 122, y: 5, show: true }
    },
    
    periodic_table: {        
        origin:  { x: 6, y: 28 },
        element: { w: 9, m: 1 },
        nuclide: { w: (9 / display.nuclides_per_row) * 0.9, m: (9 / display.nuclides_per_row) * 0.1 },
        show_labels: true,
        transition: { duration: 2000, delay: 1000, stagger_delay: 64 }
    },

    captions: [
        { x: 28, y: 8, line_height: 3.1,
          copy: "[em1]Elements[em1] are the building blocks of all [em2]chemistry[em2]. All stuff in the universe[br]is made of [em1]atoms[em1] and an element is just one type of atom. Science has[br]found [em3]" + (matter.elements.length-1) + " total elements[em3]. They are all arranged here in what's called the[br][em3]Periodic Table of Elements[em3]."
              + "[br] [br]If it's an element that exists in nature, or even if it only exists in laboratories,[br]it's on this table. There are many familiar ones such as [link]Carbon[link], [link]Oxygen[link],[br][link]Gold[link], and [link]Silver[link], as well as some that may seem unfamiliar such as[br][link]Ytterbium[link], [link]Antimony[link], or [link]Bismuth[link]."
              + "[br] [br]While each element is a distinct \"flavor\" of atom, each element in turn has[br]many \"flavors\" called [em2]isotopes[em2]. Click any element here to learn more or[br]use the navigation on the left to explore."
        }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Chart of Nuclides?',
        'Why is the Periodic Table shaped the way it is?'
    ],
    
    load: function(callback) {
        
        var wait_to_finalize = questions.current.all_nuclides_shown ? 11000 : 0;

        // Hide all nuclides if necessary
        if (questions.current.some_nuclides_shown){
            display.hideAllNuclides(500);
        }

        // Set element hitboxes
        var w = display.scale * (this.periodic_table.element.w + this.periodic_table.element.m);
        d3.selectAll(".hitbox.element")
            .attr("width", w).attr("height", w)
            .attr("transform", function(d){
                var settings = questions.cache['what_is_the_periodic_table'].periodic_table;
                var coords = display.periodic_table.getElementCoords(d, settings);
                return "translate(" + coords[0] + "," + coords[1] + ")";
            });

        // Finish
        d3.timer(function(){
            d3.selectAll(".hitbox.element").style("display", null);
            callback();
            return true;
        }, (wait_to_finalize + 1000) * display.transition_speed);
        
    }

};

