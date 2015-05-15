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
        'What is a Nuclide?',
        'How do Atoms Decay?'
    ],
    
    load: function(callback) {

        // Draw a rendom nucleus to animate
        var protons = Math.floor((Math.random()*114)+5);
        var count = 0; var neutrons = 0;
        for (var n in matter.elements[protons].nuclides){
            if (Math.random() < 1/++count){ neutrons = n; }
        }
        this.bignuc = new Nucleus(matter.elements[protons].nuclides[neutrons])
            .attr("id","bignuc").attr("show_labels",true)
            .appendTo(d3.select("#specifics"));
        d3.select("#bignuc").attr("transform","translate(" + 100 * display.scale + "," + 60 * display.scale + ") scale(" + 2 * display.scale + ")");

        callback();
    },

    animate: function(){
        if (!this.halt_animation){
            (function(question){
                d3.timer(function(){
                    if (question.bignuc.count.proton < 2 || question.bignuc.count.neutron < 2){
                        question.bignuc.reset();
                    } else {
                        var decay = Nucleus.prototype._decayModes[Math.floor(Math.random()*Nucleus.prototype._decayModes.length)];
                        question.bignuc.decay(decay);
                    }
                    d3.timer(function(){
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
