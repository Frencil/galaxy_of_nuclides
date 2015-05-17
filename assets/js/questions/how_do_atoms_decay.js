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
        display.highlightElement(matter.elements[6]);

        this.setNuclide = function(){
            var p = document.getElementById("input_protons").value;
            var n = document.getElementById("input_neutrons").value;
            if (matter.nuclideExists(p, n)){
                this.bignucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                display.highlightElement(matter.elements[p]);
            }
        };

        // Make some links
        (function(nucleus){
            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 100 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("a");
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("(α) Alpha Decay");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 105 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b+");
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("(β-) Beta-Minus Decay");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 110 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b-");
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("(β+) Beta-Plus Decay");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 115 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("p");
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("(p) Proton-Emission Decay");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 10 * display.scale).attr("y", 120 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("n");
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("(n) Neutron-Emission Decay");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 100 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    var p = nucleus.count.proton + 1;
                    var n = nucleus.count.neutron;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        document.getElementById("input_protons").value = nucleus.count.proton;
                        document.getElementById("input_neutrons").value = nucleus.count.neutron;
                        display.highlightElement(nucleus.nuclide.parentElement);
                    }
                }).text("Add a Proton");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 105 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    var p = nucleus.count.proton + 1;
                    var n = nucleus.count.neutron;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        document.getElementById("input_protons").value = nucleus.count.proton;
                        document.getElementById("input_neutrons").value = nucleus.count.neutron;
                        display.highlightElement(nucleus.nuclide.parentElement);
                    }
                }).text("Add a Neutron");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","href").attr("x", 60 * display.scale).attr("y", 120 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.reset();
                    document.getElementById("input_protons").value = nucleus.count.proton;
                    document.getElementById("input_neutrons").value = nucleus.count.neutron;
                    display.highlightElement(nucleus.nuclide.parentElement);
                }).text("Reset (to Carbon-12)");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em3").attr("x", 137 * display.scale).attr("y", 26 * display.scale)
                .style("font-size", 5 * display.scale + "px")
                .text("Protons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 14 * display.scale).attr("height", 8.6 * display.scale)
                .attr("x", 164 * display.scale).attr("y", 20 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_protons\" class=\"nucleon\" value=\"" + nucleus.count.proton + "\" style=\"width: " + 12 * display.scale + "px;\" onChange=\"questions.current.setNuclide();\">");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em1").attr("x", 137 * display.scale).attr("y", 36 * display.scale)
                .style("font-size", 5 * display.scale + "px")
                .text("Neutrons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 14 * display.scale).attr("height", 8.6 * display.scale)
                .attr("x", 164 * display.scale).attr("y", 30 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_neutrons\" class=\"nucleon\" value=\"" + nucleus.count.neutron + "\" style=\"width: " + 12 * display.scale + "px;\" onChange=\"questions.current.setNuclide();\">");

        })(this.bignucleus);
            
        callback();

    }

};
