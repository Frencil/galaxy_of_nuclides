"use strict";

questions.cache['what_are_atoms'] = {

    title: "What are Atoms?",

    scale: "nuclide",

    components: {
        thumbnail: { x: 137, y: 72, show: true }
    },
  
    periodic_table: {
        origin:  { x: 137, y: 38 },
        element: { w: 2.6, m: 0.288 }
    },

    captions: [

        { x: 36, y: 7, line_height: 3.1,
          copy: "Atoms make up all matter as we know it. Your body and the world around you are made up of trillions of them! Atoms come in 118[br]different varieties called [em2]elements[em2]. You may already know many of the elements, like [link]Oxygen[link], [link]Iron[link], or [link]Helium[link]. Some you may not[br]have heard of, like [link]Americium[link], [link]Yttrium[link], or [link]Krypton[link]."
        },
        { x: 36, y: 19, line_height: 3.1,
          copy: "Atoms are made of only three things: [em3]protons[em3], [em1]neutrons[em1], and [em2]electrons[em2]. Protons and Neutrons are about the same size and are[br]tightly packed in the atom's center, or nucleus. Electrons are much smaller than protons or neutrons and \"orbit\" around the nucleus,[br]somewhat like the planets orbiting around the sun."
        },
        { x: 2, y: 31, line_height: 3.1,
          copy: "The number of protons in an atoms nucleus is what determines what [em2]element[em2] it is. All atoms of [link]Silver[link] in all the[br]universe have exactly 47 protons just as all atoms of [link]Gold[link] in all the universe have 79 protons."
        }
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Periodic Table?',
        'What is the Chart of Nuclides?',
    ],
    
    load: function(callback) {

        // Draw basic atom diagram
        var atom = d3.select("#specifics").append("g").attr("id", "atom")
            .attr("transform","translate(" + 4 * display.scale + ", " + 9 * display.scale + ")");
        var dasharray = display.scale + "," + (1.5 * display.scale);
        var orbit1 = [ [1.5, 13.5], [11.5, 1], [27, 4.5], [17, 17] ];
        for (var o in orbit1){ orbit1[o][0] *= display.scale; orbit1[o][1] *= display.scale; }
        atom.append("path")
            .attr("id", "orbit1").data([orbit1])
            .attr("d", d3.svg.line().tension(0.5).interpolate("cardinal-closed"))
            .attr("fill", "none").attr("stroke-width", (0.1 * display.scale) + "px")
            .attr("stroke","rgb(128,128,128)").attr("stroke-dasharray",dasharray);
        var orbit2 = [ [24, 17.5], [8.3, 14.3], [4.5, 0.7], [20, 4] ];
        for (var o in orbit2){ orbit2[o][0] *= display.scale; orbit2[o][1] *= display.scale; }
        atom.append("path")
            .attr("id", "orbit2").data([orbit2])
            .attr("d", d3.svg.line().tension(0.5).interpolate("cardinal-closed"))
            .attr("fill", "none").attr("stroke-width", (0.1 * display.scale) + "px")
            .attr("stroke","rgb(128,128,128)").attr("stroke-dasharray",dasharray);
        var e1 = particles.electron(atom, "e1");
        var e2 = particles.electron(atom, "e2");
        var doOrbit1 = function() {
            e1.transition()
                .duration(4000).ease("out-in")
                .attrTween("transform", translateAlong(d3.select("#orbit1").node()))
                .each("end", doOrbit1);
        };
        var doOrbit2 = function() {
            e2.transition()
                .duration(4000).ease("out-in")
                .attrTween("transform", translateAlong(d3.select("#orbit2").node()))
                .each("end", doOrbit2);
        }
        var translateAlong = function(path) {
            var l = path.getTotalLength();
            return function(d, i, a) {
                return function(t) {
                    var p = path.getPointAtLength(t * l);
                    var s = 0.5 + (1.5 * Math.abs(t - 0.5));
                    return "translate(" + p.x + "," + p.y + ") scale(" + s + ")";
                };
            };
        };
        doOrbit1();
        doOrbit2();
        particles.proton(atom, "p1", 13.2, 6.5, 0.9);
        particles.neutron(atom, "n1", 16.5, 7.5, 1);
        particles.neutron(atom, "n2", 12, 9.5, 1);
        particles.proton(atom, "p2", 15.2, 10.2, 1.1);

        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, 500 * display.transition_speed);

    }

};
