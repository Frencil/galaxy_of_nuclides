"use strict";
/*

What is Nuclides.org?

This is the welcome / home / help page for Nuclides.org. It should always appear at the top of the questions list.

*/

questions.cache['what_is_nuclides_org'] = {

    title: "What is Nuclides.org?",

    scale: "nuclide",

    components: {
        thumbnail: { x: 90, y: 100.5 },
        nuclide_hover: { x: 0, y: -100 }
    },

    periodic_table: {
        origin:  { x: 2, y: 84 },
        element: { w: 4.3, m: 0.4 },
        coordsFunction: display.periodic_table.getElementCoords,
        show_labels: true
    },

    isotopes_grid: {
        origin:  { x: 141, y: 15 },
        nuclide: {
            w: function(){ return (50 / display.nuclides_per_row) * 0.9; },
            m: function(){ return (50 / display.nuclides_per_row) * 0.1; }
        },
        coordsFunction: display.isotopes_grid.getNuclideCoords,
        show_labels: true,
        next_element: 79
    },

    captions: [
        { x: 2, y: 8, line_height: 4,
          copy: "[em4]Welcome to Nuclides.org[em4]—an interactive platform for questions about atoms using [emi]real atomic data[emi]."
        },

        { x: 33.5, y: 15.5, line_height: 3,
          copy: "[em1]Every page on Nuclides.org answers a question about atoms.[em3][br]Questions can appear as links in text [q]like this|What is a Nuclide?[q]. The far left column will show additional[br]relevant questions on every page. Questions work just like pages on any other website so[br][em1]you can use your browser's back button to revisit questions you've already seen[em1][br]and you can bookmark/copy the URL on any page to return to that question any time."
        },

        { x: 33.5, y: 34, line_height: 3,
          copy: "There are 120 different kinds of atoms and each different kind is called an element. You[br]can probably already name several of the elements, such as [link]Carbon[link] or [link]Oxygen[link]."
        },

        { x: 33.5, y: 43.5, line_height: 3,
          copy: "[em2]All the elements are usually shown on a chart called The Periodic Table of Elements.[em2][br]This chart can be seen here in the lower left and it's interactive too. Any time you see the[br][q]Periodic Table|What is an Element?[q] you can click any square to see a picture of that element and learn more[br]about it. [em2]The interactive Periodic Table appears on most pages on Nuclides.org[em2]"
        },

        { x: 33.5, y: 60, line_height: 3,
          copy: "Atoms are made of [q]protons|What is a Proton?[q], [q]neutrons|What is a Neutron?[q], and [q]electrons|What is an Electron?[q]. Protons and neutrons live in an atom's[br]nucleus. [em3]The number of protons determines what element an atom is[em3] (and therefore its[br]chemical properties). [em3]When two atoms of the same element have a different number of[em3][br][em3]neutrons they are called different isotopes of that element.[em3] Some elements only have a few different isotopes and some have a lot,[br]like [link]Gold[link] with 41 (shown at top right). [link]Mercury[link] has the most of any element with 46 but new nuclides are discovered over time."
        },

        { x: 90, y: 78.5, line_height: 3,
          copy: "[em4]All the isotopes of all the elements are known as the nuclides.[em4] There are close to[br]3,200 known nuclides and you can see them all in one place on the [q]Chart of Nuclides|What is a Nuclide?[q]."},

        { x: 90, y: 88, line_height: 3,
          copy: "Some atoms are [q]stable|What makes an Atom Stable?[q] and others [q]decay|How do Atoms Decay?[q] into more stable nuclides, releasing [q]radiation|What is Radiation?[q][br]in the process. Atoms decay randomly so the best we can do is measure how long it will[br]take for half of a group of the same nuclide to decay on average, or the nuclide's [q]half-life|What is Half-Life?[q]."
        },

        { x: 144, y: 100.5, line_height: 3,
          copy: "[em4]Use the slider to the right to simulate[em4][br][em4]time elapsing and see how decay and[em4][br][em4]half-life work at different time scales.[em4][br]The scale is [emi]enormous[emi]—from extremely[br]tiny fractions of a second to many times[br]the age of the universe. Try loading the[br][q]Chart of Nuclides|What is a Nuclide?[q] and playing with the[br]slider to see how half-lives compare[br]across all nuclides known to science!"
        },

        { x: 5, y: 41, line_height: 2.3,
          copy: "[link]Carbon-12[link] is stable nuclide."
        },

        { x: 2, y: 70, line_height: 2.3,
          copy: "[link]Carbon-9[link] can decay into [link]Lithium-5[link]."
        },

        { x: 16.5, y: 87, line_height: 2.3,
          copy: "[q]The Periodic Table[q] shows all 120 known[br]elements. The darker the color the more[br][q]isotopes|What are isotopes?[q] the element has."
        },

        { x: 141, y: 58, line_height: 2.3,
          copy: "All 41 isotopes (nuclides) of [link]Gold[link]. The number is the[br]sum of protons and neutrons in each nuclide. Gold only[br]has one stable nuclide (shown in dark brown). Move the[br]time slider to the right to see these nuclides decay."
        },

    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Element?',
        'What is a Nuclide?',
        'What is an Atom?',
        'What makes an Atom Stable?',
        'How do Atoms Decay?'
    ],
    
    load: function(callback) {

        // Draw stable Carbon-12 nuclide in the top left
        this.carbon12 = new Nucleus(matter.elements[6].nuclides[6]).attr("id","carbon-12").attr("show_labels",true).appendTo(d3.select("#specifics"));
        d3.select("#carbon-12").attr("transform","translate(" + 13 * display.scale + "," + 22 * display.scale + ") scale(" + 2 * display.scale + ")");

        // Draw unstable Carbon-9 below
        this.carbon9 = new Nucleus(matter.elements[6].nuclides[3]).attr("id","carbon-9").attr("show_labels",true).appendTo(d3.select("#specifics"));
        d3.select("#carbon-9").attr("transform","translate(" + 13 * display.scale + "," + 54 * display.scale + ") scale(" + 2 * display.scale + ")");

        callback();

    },

    animate: function(){
        if (!this.halt_animation){
            (function(question){
                d3.timer(function(){
                    question.carbon9.decay(["alpha","beta-plus"]);
                    d3.timer(function(){
                        question.carbon9.reset();
                        question.animate();
                        return true;
                    }, 3000);
                    return true;
                }, 2000);
            })(this);
        }
        return true;
    }

};
