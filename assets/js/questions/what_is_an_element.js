"use strict";

questions.cache['what_is_an_element'] = {

    title: "What is an Element?",

    scale: "element",

    components: {
        thumbnail: { x: 125, y: 3 },
        nuclide_hover: { x: 0, y: -100 }
    },
    
    periodic_table: {        
        origin:  { x: 2, y: 26 },
        element: { w: 9.5, m: 1 },
        nuclide: { w: (9 / display.nuclides_per_row) * 0.9, m: (9 / display.nuclides_per_row) * 0.1 },
        show_labels: true,
        transition: { duration: 2000, delay: 1000 },
        coordsFunction: display.periodic_table.getElementCoords
    },

    captions: [
        { x: 15, y: 7.5, line_height: 2.9,
          copy: "[em1]Elements are the building blocks of all chemistry[em1]. All the \"stuff\" in the universe is made of[br][q]atoms|What is an atom?[q] that come in various types and each type of atom is called an element. Science has[br]found " + (matter.elements.length-1) + " total elements and they are usually shown like you see here on a chart called the[br][em1]Periodic Table of Elements[em1]."
        },
        { x: 15, y: 21.5, line_height: 2.9,
          copy: "[em2]The original idea of an element is something that's \"indivisible\"[em2]. Some metals found in[br]nature with primitive technology like [link]Gold[link], [link]Silver[link], and [link]Copper[link] have been considered since[br]ancient times to be elements. The Enlightenment of the 1600s refined the definition to be[br][em2]any substance that can't be broken into a simpler substance by a chemical reaction[em2]."
        },
        { x: 25.5, y: 35.5, line_height: 2.9,
          copy: "[em3]Today we know that atoms are made of still smaller particles.[em3] [q]Protons|What is a Proton?[q] and [q]neutrons|What is a Neutrons?[q][br]are bundled together in an atom's nucleus around which orbit tiny [q]electrons|What is an Electron?[q]. [em3]The number[em3][br][em3]of protons determine an atom's properties, and therefore what element it is.[em3] That[br]number, called the [em4]Atomic Number[em4], is the most important number for an element and[br]so it appears on the Periodic Table."
        }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is a Nuclide?',
        'How do Atoms Decay?'
    ],
    
    load: function(callback) {
        callback();
    }

};

