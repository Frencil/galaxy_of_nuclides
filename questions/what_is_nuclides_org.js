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
        show_labels: true
    },

    isotopes_grid: {
        origin:  { x: 141, y: 15 },
        nuclide: { w: ((50 / display.nuclides_per_row) * 0.9), m: ((50 / display.nuclides_per_row) * 0.1) },
        coordsFunction: display.isotopes_grid.getNuclideCoords,
        show_labels: true,
        next_element: 79
    },

    captions: [
        { x: 2, y: 8, line_height: 4,
          copy: "[em4]Welcome to Nuclides.org[em4]—an interactive platform for questions about [q]atoms|What are atoms?[q] using [emi]real atomic data[emi]."
        },

        { x: 33.5, y: 15.5, line_height: 3,
          copy: "[em1]Every page on Nuclides.org answers a question about atoms.[em3][br]Questions can appear as links in text [q]like this|What are atoms?[q]. The far left column will show additional[br]relevant questions on every page. Questions work just like pages on any other website so[br][em1]you can use your browser's back button to revisit questions you've already seen[em1][br]and you can bookmark/copy the URL on any page to return to that question any time."
        },

        { x: 33.5, y: 34, line_height: 3,
          copy: "There are 120 different kinds of atoms and each different kind is called an element. You[br]can probably already name several of the elements, such as [q]Carbon[q] or [q]Oxygen[q]."
        },

        { x: 33.5, y: 43.5, line_height: 3,
          copy: "[em2]All the elements are usually shown on a chart called The Periodic Table of Elements.[em2][br]This chart can be seen here in the lower left and it's interactive too. Any time you see the[br][q]Periodic Table|What is the Periodic Table?[q] you can click any square to see a picture of that element and learn more[br]about it. [em2]The interactive Periodic Table appears on most pages on Nuclides.org[em2]"
        },

        { x: 33.5, y: 60, line_height: 3,
          copy: "Atoms are made of [q]protons|What is a Proton?[q], [q]neutrons|What is a Neutron?[q], and [q]electrons|What is an Electron?[q]. Protons and neutrons live in an atom's[br]nucleus. [em3]The number of protons determines what element an atom is[em3] (and therefore its[br]chemical properties). [em3]When two atoms of the same element have a different number of[em3][br][em3]neutrons they are called different isotopes of that element.[em3] Some elements only have a few different isotopes and some have a lot,[br]like [link]Gold[link] with 41 (shown at top right). [link]Mercury[link] has the most of any element with 46 but new nuclides are discovered over time."
        },

        { x: 90, y: 78.5, line_height: 3,
          copy: "[em4]All the isotopes of all the elements are known as the nuclides.[em4] There are close to[br]3,200 known nuclides and you can see them all in one place on the [q]Chart of Nuclides|What is the Chart of Nuclides?[q]."},

        { x: 90, y: 88, line_height: 3,
          copy: "Some atoms are [q]stable|What makes an atom stable?[q] and others [q]decay|How do atoms decay?[q] into more stable nuclides, releasing [q]radiation|What is Radiation?[q][br]in the process. Atoms decay randomly so the best we can do is measure how long it will[br]take for half of a group of the same nuclide to decay on average, or the nuclide's [q]half-life|What is Half-Life?[q]."
        },

        { x: 144, y: 100.5, line_height: 3,
          copy: "[em4]Use the slider to the right to simulate[em4][br][em4]time elapsing and see how decay and[em4][br][em4]half-life work at different time scales.[em4][br]The scale is [emi]enormous[emi]—from extremely[br]tiny fractions of a second to many times[br]the age of the universe. Try loading the[br][q]Chart of Nuclides|What is the Chart of Nuclides?[q] and playing with the[br]slider to see how half-lives compare[br]across all nuclides known to science!"
        },

        { x: 5, y: 41, line_height: 2.3,
          copy: "[link]Helium-4[link] is stable nuclide."
        },

        { x: 3, y: 70, line_height: 2.3,
          copy: "[link]Carbon-9[link] decays into [link]Lithium-5[link]."
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

        // Draw stable Helium-4 atom diagram in the top left
        var he4 = d3.select("#specifics").append("g")
            .attr("transform","translate(" + 1.5 * display.scale + "," + 15 * display.scale + ") scale(" + display.scale + ")");
        var orbit1 = new Orbit().duration(4000)
            .path([ [10.760, 21.414], [1.811, 15.268], [19.108, 3.128], [28.234, 9.598] ])
            .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
            .appendTo(he4);
        var orbit2 = new Orbit().duration(4000)
            .path([ [19.604, 23.821], [3.677, 7.278], [9.904, 1.179], [26.476, 17.737] ])
            .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
            .appendTo(he4);
        var e1 = new Particle().type("electron").appendTo(he4);
        var e2 = new Particle().type("electron").appendTo(he4);
        orbit1.attachParticle(e1);
        orbit2.attachParticle(e2);
        new Particle().type("proton").x(13.7).y(10).scale(1.9).appendTo(he4);
        new Particle().type("neutron").x(17).y(11).scale(2).appendTo(he4);
        new Particle().type("neutron").x(12.5).y(13).scale(2).appendTo(he4);
        new Particle().type("proton").x(15.6).y(13.5).scale(2.1).appendTo(he4);

        // Draw Carbon-9 decaying to Lithium-5 (beta+ and alpha)
        var c9 = d3.select("#specifics").append("g")
            .attr("transform","translate(" + 4 * display.scale + "," + 50 * display.scale + ") scale(" + 1.5 * display.scale + ")");
        new Particle().type("proton").x(1.177).y(0.751).appendTo(c9);
        new Particle().type("neutron").x(0.615).y(2.049).appendTo(c9);
        new Particle().type("proton").x(1.273).y(3.404).appendTo(c9);
        new Particle().type("proton").x(1.952).y(2.330).appendTo(c9);

        var c9_beta_e_orbit = new Orbit().duration(4000).path([ [2.820, 0.815], [17, 0.185] ]).appendTo(c9);
        var beta_e = new Particle().type("electron").scale(3).appendTo(c9);
        c9_beta_e_orbit.attachParticle(beta_e);
        var c9_beta_n_orbit = new Orbit().duration(4000).path([ [2.804, 0.752], [2.683, 1.057] ])
            .opacityFunction(function(t){ return Math.min(t*8,1); }).appendTo(c9);
        var beta_n = new Particle().type("neutron").appendTo(c9);
        c9_beta_n_orbit.attachParticle(beta_n);
        var c9_beta_p_orbit = new Orbit().duration(4000).path([ [2.804, 0.752], [2.683, 1.057] ])
            .opacityFunction(function(t){ return Math.abs(Math.max(1-t*8,0)); }).appendTo(c9);
        var beta_p = new Particle().type("proton").appendTo(c9);
        c9_beta_p_orbit.attachParticle(beta_p);

        var c9_alpha_n1_orbit = new Orbit().duration(4000).stroke("none").path([ [2.388, 3.772], [16.530, 12.347] ]).appendTo(c9);
        var c9_alpha_p1_orbit = new Orbit().duration(4000).stroke("none").path([ [3.856, 3.488], [17.998, 12.063] ]).appendTo(c9);
        var c9_alpha_n2_orbit = new Orbit().duration(4000).stroke("none").path([ [3.919, 1.815], [18.061, 10.390] ]).appendTo(c9);
        var c9_alpha_p2_orbit = new Orbit().duration(4000).path([ [2.858, 2.425], [17, 11] ]).appendTo(c9);

        var alpha_n1 = new Particle().type("neutron").appendTo(c9);
        var alpha_p1 = new Particle().type("proton").appendTo(c9);
        var alpha_n2 = new Particle().type("neutron").appendTo(c9);
        var alpha_p2 = new Particle().type("proton").appendTo(c9);

        c9_alpha_n1_orbit.attachParticle(alpha_n1);
        c9_alpha_p1_orbit.attachParticle(alpha_p1);
        c9_alpha_n2_orbit.attachParticle(alpha_n2);
        c9_alpha_p2_orbit.attachParticle(alpha_p2);

        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, 500 * display.transition_speed);

    }

};
