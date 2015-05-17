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
        show_hitboxes: false,
        coordsFunction: display.periodic_table.getElementCoords
    },

    captions: [
        { x: 2, y: 8, line_height: 3.1,
          copy: "This page is currently under active development. Use the links below to decay the nucleus, or edit the inputs directly."
        },
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Element?',
        'What is a Nuclide?'
    ],
    
    load: function(callback) {

        // Generate the starter nuclide
        this.bignucleus = new Nucleus(matter.elements[6].nuclides[6])
            .attr("id","bignucleus").attr("show_labels",true).appendTo(d3.select("#specifics"));
        d3.select("#bignucleus").attr("transform","translate(" + 50 * display.scale + "," + 35 * display.scale + ") scale(" + 2.6 * display.scale + ")");
        d3.timer(function(){
            display.highlightElement(matter.elements[6]);
            return true;
        }, 500);

        this.setNuclideFromInput = function(){
            var p = document.getElementById("input_protons").value;
            var n = document.getElementById("input_neutrons").value;
            if (matter.nuclideExists(p, n)){
                this.bignucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                display.highlightElement(matter.elements[p]);
                this.enableLinks();
            }
        };

        this.setNuclideFromLink = function(){
            document.getElementById("input_protons").value = this.bignucleus.count.proton;
            document.getElementById("input_neutrons").value = this.bignucleus.count.neutron;
            display.highlightElement(this.bignucleus.nuclide.parentElement);
            this.enableLinks();
        };

        this.enableLinks = function(){
            d3.select("#link_decay_a").attr("class", "href" + (this.bignucleus.decay("a",true) ? "" : "_disabled"));
            d3.select("#link_decay_bp").attr("class", "href" + (this.bignucleus.decay("b+",true) ? "" : "_disabled"));
            d3.select("#link_decay_bm").attr("class", "href" + (this.bignucleus.decay("b-",true) ? "" : "_disabled"));
            d3.select("#link_decay_p").attr("class", "href" + (this.bignucleus.decay("p",true) ? "" : "_disabled"));
            d3.select("#link_decay_n").attr("class", "href" + (this.bignucleus.decay("n",true) ? "" : "_disabled"));
            var p = matter.nuclideExists(this.bignucleus.count.proton + 1, this.bignucleus.count.neutron) ? "" : "_disabled";
            d3.select("#link_add_p").attr("class", "href" + p);
            var n = matter.nuclideExists(this.bignucleus.count.proton, this.bignucleus.count.neutron + 1) ? "" : "_disabled";
            d3.select("#link_add_p").attr("class", "href" + n);
        };

        // Make some links
        (function(nucleus){
            d3.select("#specifics").append("text").append("tspan").attr("id","link_decay_a")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 105 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("a");
                    questions.current.setNuclideFromLink();
                }).text("(α) Alpha Decay");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_decay_bp")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 110 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b+");
                    questions.current.setNuclideFromLink();
                }).text("(β-) Beta-Minus Decay");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_decay_bm")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 115 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b-");
                    questions.current.setNuclideFromLink();
                }).text("(β+) Beta-Plus Decay");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_decay_p")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 120 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("p");
                    questions.current.setNuclideFromLink();
                }).text("(p) Proton-Emission Decay");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_decay_n")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 125 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("n");
                    questions.current.setNuclideFromLink();
                }).text("(n) Neutron-Emission Decay");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_add_p")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 105 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    var p = nucleus.count.proton + 1;
                    var n = nucleus.count.neutron;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclideFromLink();
                    }
                }).text("Add a Proton");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_add_n")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 110 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    var p = nucleus.count.proton;
                    var n = nucleus.count.neutron + 1;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclideFromLink();
                    }
                }).text("Add a Neutron");

            d3.select("#specifics").append("text").append("tspan").attr("id","link_reset")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 125 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.reset();
                    questions.current.setNuclideFromLink();
                }).text("Reset (to Carbon-12)");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em3").attr("x", 137 * display.scale).attr("y", 26 * display.scale)
                .style("font-size", 5 * display.scale + "px")
                .text("Protons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 14 * display.scale).attr("height", 8.6 * display.scale)
                .attr("x", 164 * display.scale).attr("y", 20 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_protons\" class=\"nucleon\" value=\"" + nucleus.count.proton + "\" style=\"width: " + 12 * display.scale + "px;\" onChange=\"questions.current.setNuclideFromInput();\">");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em1").attr("x", 137 * display.scale).attr("y", 36 * display.scale)
                .style("font-size", 5 * display.scale + "px")
                .text("Neutrons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 14 * display.scale).attr("height", 8.6 * display.scale)
                .attr("x", 164 * display.scale).attr("y", 30 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_neutrons\" class=\"nucleon\" value=\"" + nucleus.count.neutron + "\" style=\"width: " + 12 * display.scale + "px;\" onChange=\"questions.current.setNuclideFromInput();\">");

        })(this.bignucleus);
            
        callback();

    }

};
