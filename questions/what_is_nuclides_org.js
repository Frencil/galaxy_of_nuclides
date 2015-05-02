"use strict";
/*

What is Nuclides.org?

This is the welcome / home / help page for Nuclides.org. It should always appear at the top of the questions list.

*/

questions.cache['what_is_nuclides_org'] = {

    title: "What is Nuclides.org?",

    scale: "nuclide",

    components: {
        thumbnail: { x: 137, y: 72, show: true }
    },
  
    periodic_table: {
        origin:  { x: 137, y: 38 },
        element: { w: 2.6, m: 0.288 }
    },

    captions: [
        { x: 2, y: 7, line_height: 3.1,
          copy: "Nuclides.org is an interactive platform for questions about some of the smallest stuff in the universe: [em1]atoms![em2]"
        },

        { x: 34, y: 12, line_height: 3.1,
          copy: "Atoms make up all matter as we know it. Your body and the world around you are made up of trillions of them! Atoms come in 118[br]different varieties called elements. You may already know many of the elements, like [link]Oxygen[link], [link]Iron[link], or [link]Helium[link]. Some you may not[br]have heard of, like [link]Americium[link], [link]Yttrium[link], or [link]Krypton[link]."
        },
        { x: 34, y: 24, line_height: 3.1,
          copy: "Atoms are made of only three things: [em3]protons[em3], [em1]neutrons[em1], and [em2]electrons[em2]. Protons and Neutrons are about the same size and are[br]tightly packed in the atom's center, or nucleus. Electrons are much smaller than protons or neutrons and \"orbit\" around the nucleus,[br]somewhat like the planets orbiting around the sun."
        },
        { x: 2, y: 36, line_height: 3.1,
          copy: "The number of protons in an atoms nucleus is what determines what element it is. All atoms of [link]Silver[link] in all the[br]universe have exactly 47 protons just as all atoms of [link]Gold[link] in all the universe have 79 protons."
        },
        { x: 2, y: 45, line_height: 3.1,
          copy: "Some atoms last forever, or at least we think they do. We call those atoms [q]stable|What makes atoms stable?[q]. But not all atoms are stable.[br]Some of them fall apart over time, and some of them fall apart really really fast. When an atom falls apart it[br]releases a lot of energy called [q]radiation|What is Radiation?[q] and changes into another atom entirely. Radiation is very dangerous[br]and can kill a person, but it also has many beneficial uses like cancer treatments and detecting explosives."
        },
        { x: 2, y: 60, line_height: 3.1,
          copy: "[q]Why do some atoms fall apart?|Why do some atoms fall apart?[q] It all comes back to those neutrons. Most atoms have some neutrons in them,[br]but the amount can vary without changing what element the atom is. Most atoms of Gold have 118 neutrons to[br]go with those 79 protons (making 197 \"things\" in the nucleus), but some atoms of Gold have 117 or 119 neutrons.[br]Too many or not enough neutrons and an atom becomes unstable, or [q]radioactive|What is Radioactivity?[q]."
        },
        { x: 2, y: 75, line_height: 3.1,
          copy: "So let's say we have a stable Gold atom with 197 things in the nucleus. We'll call that [link]Gold-197[link]. Then let's say[br]we had another atom that had one extra neutron in it - [link]Gold-198[link]. They're both Gold, but they're not the same.[br]The stable one will (as far as we know) always exist and the unstable one could decay (release radiation and[br]turn into another element) any time at random."
        },
        { x: 2, y: 90.5, line_height: 3.1,
          copy: "These two atoms are different [em2]isotopes[em2] of Gold. Isotopes are to elements like breeds are to dogs; all dogs are[br]the same species but different breeds have different characteristics. Likewise, different isotopes of the same[br]element (same number of [em3]protons[em3], different numbers of [em1]neutrons[em1]) can have different properties. Some elements[br]have more isotopes than others. [link]Gold[link] has 41 isotopes that we know of. [link]Silver[link] has 37 and [link]Copper[link] has only 30.[br][link]Mercury[link] has the most isotopes of any element with 46."
        },
        { x: 2, y: 109, line_height: 3.1,
          copy: "[q]How many total isotopes can there be?|How many total isotopes can there be?[q] Turns out it's a lot - over 3,000! The universal name for a single isotope is a Nuclide, and that's where [em2]Nuclides.org[em2] gets[br]its name. This website has information on every isotope of every element - all the nuclides that make up all the matter in the entire universe."
        }
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What are Atoms?',
        'What is the Periodic Table?',
        'What is the Chart of Nuclides?',
    ],
    
    load: function(callback) {

        // Draw basic atom diagram in the top left
        var atom = d3.select("#specifics").append("g")
            .attr("transform","translate(" + 1.5 * display.scale + "," + 12.5 * display.scale + ") scale(" + display.scale + ")");
        var orbit1 = new Orbit().duration(4000)
            .path([ [10.760, 21.414], [1.811, 15.268], [19.108, 3.128], [28.234, 9.598] ])
            .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
            .appendTo(atom);
        var orbit2 = new Orbit().duration(4000)
            .path([ [19.604, 23.821], [3.677, 7.278], [9.904, 1.179], [26.476, 17.737] ])
            .scaleFunction(function(t){ return 5 + (10 * Math.abs(t - 0.5)); })
            .appendTo(atom);
        var e1 = new Particle().type("electron").appendTo(atom);
        var e2 = new Particle().type("electron").appendTo(atom);
        orbit1.attachParticle(e1);
        orbit2.attachParticle(e2);
        new Particle().type("proton").x(13.7).y(10).scale(1.9).appendTo(atom);
        new Particle().type("neutron").x(17).y(11).scale(2).appendTo(atom);
        new Particle().type("neutron").x(12.5).y(13).scale(2).appendTo(atom);
        new Particle().type("proton").x(15.6).y(13.5).scale(2.1).appendTo(atom);

        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, 500 * display.transition_speed);

    }

};
