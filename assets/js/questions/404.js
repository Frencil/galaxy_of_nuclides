"use strict";
/*

404 - a catch-all question for questions that don't exist (yet or ever)

*/

questions.cache['404'] = {

    is404: true,

    title: "That page doesn't exist yet!",

    scale: "nuclide",

    components: {},

    captions: [
        { x: 2, y: 8, line_height: 3.1,
          copy: "Sorry, that page hasn't been written yet. [em4]Nuclides.org[em4] is still a work in progress.[br]If you got here by clicking a link on Nuclides.org then it's on the list to be written soon!"
              + "[br] [br][em3]You can help write pages like this![em3] Nuclides.org is open source, so [repo]visit the repository[repo] to get started.[br]Contributions are [emi]always[emi] welcome!"
        },

    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Element?',
        'What is a Nuclide?'
    ],
    
    load: function(callback) {

        // Draw stable Helium-4 atom diagram in the bottom right
        var he4 = d3.select("#specifics").append("g")
            .attr("transform","translate(" + 156 * display.scale + "," + 100 * display.scale + ") scale(" + display.scale + ")");
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

        callback();
    }

};
