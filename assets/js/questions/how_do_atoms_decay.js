"use strict";

questions.cache['how_do_atoms_decay'] = {

    title: "How do Atoms Decay?",

    scale: "nuclide",

    components: {
        thumbnail: { x: 137, y: 98 },
    },
  
    periodic_table: {
        origin:  { x: 137, y: 64 },
        element: { w: 2.6, m: 0.288 },
        nuclide: { w: (2.6 / display.nuclides_per_row), m: 0 },
        show_labels: false,
        coordsFunction: display.periodic_table.getElementCoords
    },

    captions: [
        { x: 2, y: 8, line_height: 3.1,
          copy: "This page is currently under active development. When complete you will be able to experiment with different modes of nuclear[br]decay on the atomic nucleus below. Check back soon!"
        },
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Element?',
        'What is a Nuclide?'
    ],
    
    load: function(callback) {

        // Randomly select a starter nuclide from a curated list of good-sized familiar elements
        var starters = [ 26, 29, 47, 50, 79, 80, 82 ];
        var element = matter.elements[starters[Math.floor(Math.random()*starters.length)]];
        var nuclide = element.nuclides[element.stablest_neutrons];

        // Generate the starter nuclide
        this.bignucleus = new Nucleus(nuclide).attr("id","bignucleus").attr("show_labels",true).appendTo(d3.select("#specifics"));
        d3.select("#bignucleus").attr("transform","translate(" + 50 * display.scale + "," + 35 * display.scale + ") scale(" + 2.6 * display.scale + ")");

        

        callback();

    }

};
