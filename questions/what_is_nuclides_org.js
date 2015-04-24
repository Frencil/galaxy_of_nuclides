"use strict";
/*

What is Nuclides.org?

This is the welcome / home / help page for Nuclides.org. It should always appear at the top of the questions list.
Ideally this question should be able to serve as the "default" or "template" question when writing other questions.

*/

var question = {

    filename: "what_is_nuclides_org.js",

    // Title should always be a function
    title: function(){
        return "What is Nuclides.org?";
    },

    dataset_state: {
        elements_shown: true,
        some_nuclides_shown: false,
        all_nuclides_shown: false,
        scale: "nuclides"
    },

    components: {
        thumbnails: { x: 6, y: 28, show: true }
    },
    
    periodic_table: {
        origin:  { x: 6, y: 28 },
        element: { w: 9, m: 1 }
    },

    captions: [
        { x: 28, y: 5, line_height: 3.1,
          copy: "Nuclides.org is an interactive platform for questions about some of the smallest stuff in the universe: atoms."
        },

        { x: 28, y: 5, line_height: 3.1,
          copy: "Atoms are what matter is made of. Atoms come in 118 different varieties called elements. You may already know many of the elements, like [link]Oxygen[link], [link]Iron[link], or [link]Helium[link]. Some you may not have heard of, like [link][link], [link][link], or [link][link]. But whether you know them or not you're made of them, and so is the entire world around you!"
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "Atoms are made of only three things: protos, neutrons, and electrons. Protons and Neutrons are tightly packed in the atom's center, or nucleus. Around the nucleus are where electrons are found, somewhat like the planets orbiting around the sun."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "The number of protons in an atoms nucleus is what determines what element it is. All atoms of [link]Silver[link] in the universe have exactly 47 protons just as all atoms of [link]Gold[link] in the entire universe have 79 protons."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "Some atoms last forever, or at least we think they do. We call those atoms stable. But not all atoms are stable. Some of them fall apart over time, and some of them fall apart really really fast. When an atom falls apart releases a lot of energy called radiation and changes into another atom entirely. Radiation is very dangerous and can kill a person, but it's also very useful for all sorts of things like cancer treatments and detecting explosives."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "Why do some atoms fall apart? It all comes back to those neutrons. Most atoms have some neutrons in them, but the amount can vary without changing what element the atom is. Most atoms of [link]Gold[link] have 118 neutrons to go with those 79 protons (making 197 "things" in the nucleus), but some atoms of [link]Gold[link] have 117, or 119 neutrons. Too many or not enough neutrons and an atom becomes unstable, or radioactive."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "So let's say we have a stable Gold atom with 197 things in the nucleus. We'll call that [link]Gold-197[link]. Then let's say we had another atom that had one extra neutron in it - [link]Gold-198[link]. They're both Gold, but they're not the same. The stable one will (as far as we know) always exist and the unstable one could decay (release radiation and turn into another element) any time at random."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "These two atoms are different isotopes of Gold. Another way to think about it is like dogs or cats. All dogs are dogs but there are different breeds; atoms of the same element (same number of protons) with different numbers of neutrons are like different breeds of that element. Some elements have more isotopes than others. [link]Gold[link] has 41 that we know of. [link]Silver[link] has 37 and [link]Copper[link] has only 30. [link]Mercury[link] has the most with 46."
        },
        { x: 28, y: 5, line_height: 3.1,
          copy: "How many total isotopes can there be? Turns out it's a lot - over 3,000! The universal name for a single isotope is a Nuclide, and that's where Nuclides.org gets its name. This website has information on every isotope of every element - all the nuclides that make up all the matter in the entire universe."
        }
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Periodic Table?',
        'What is the Chart of Nuclides?',
    ],
    
    load: function(previous_question, callback) {
        
        // Hide element labels
        d3.selectAll("text.element_display").style("opacity", 0);

        // Hide all nuclides if necessary (500ms)
        if (previous_question.some_nuclides_shown){
            display.hideAllNuclides(500);
        }

        // Move the elements to their proper position
        display.showPeriodicTable(this.periodic_table, 1000);

        // Show captions and components
        display.showCaptions(500, 0, 50);
        display.showComponents(500, 500);
        
        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, (1000) * display.transition_speed);

    }

};
