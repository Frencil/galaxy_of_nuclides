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

    chart_of_nuclides: {
        origin:  { x: 174.2, y: 15 },
        nuclide: { w: 14.8, m: 0 },
        coordsFunction: function(){ return [174.2 * display.scale, 15 * display.scale]; },
        show_labels: true,
        show_hitboxes: false,
        highlight_row: false
    },

    captions: [
        { x: 2, y: 8, line_height: 3.1,
          copy: "Of the over 3,000 different types of nuclides most are [emi]unstable[emi], meaning they decay into other nuclides.[br]Atoms can decay in a variety of different ways. Five of the more common decay modes are modeled here."
        },
        { x: 137, y: 4, line_height: 6, id: "caption_nuclide_name",
          copy: "[em2]Carbon-12[em2]"
        },
        { x: 137, y: 34, line_height: 4, id: "caption_nuclide_halflife",
          copy: "[em4]Half-life:[em2] ..."
        },
        { x: 137, y: 40, line_height: 2.6, id: "caption_nuclide_caption",
          copy: " "
        },
    ],
        
    // Follow-up questions with which to populate the questions region
    questions: [
        'What is an Element?',
        'What is a Nuclide?'
    ],

    onload: function(){
        document.getElementById("input_protons").value = 6;
        document.getElementById("input_neutrons").value = 6;
        this.setNuclide("input");
        var coords = display.periodic_table.getElementCoords(matter.elements[6], this.periodic_table);
        var w = this.periodic_table.element.w * display.scale;
        d3.select("#element_highlightbox").style("display", "block")
            .attr("x", coords[0]).attr("y", coords[1]).attr("width", w).attr("height", w);
    },
    
    load: function(callback) {

        // Generate the starter nuclide
        this.bignucleus = new Nucleus(matter.elements[1].nuclides[0])
            .attr("id","bignucleus").attr("show_labels",true).appendTo(d3.select("#specifics"));
        d3.select("#bignucleus").attr("transform","translate(" + 50 * display.scale + "," + 31.5 * display.scale + ") scale(" + 2.6 * display.scale + ")");

        this.setNuclide = function(source){
            var changed = false;
            if (source == "input"){
                var p = document.getElementById("input_protons").value, n = document.getElementById("input_neutrons").value;
                if (matter.nuclideExists(p, n)){
                    this.bignucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                    changed = true;
                } else {
                    return;
                }
            } else {
                if (    document.getElementById("input_protons").value != this.bignucleus.count.proton
                     || document.getElementById("input_neutrons").value != this.bignucleus.count.neutron ){
                    changed = true;
                    document.getElementById("input_protons").value = this.bignucleus.count.proton;
                    document.getElementById("input_neutrons").value = this.bignucleus.count.neutron;
                }
            }
            if (changed){

                // Highlight the element in the thumbnail and periodic table
                display.highlightElement(this.bignucleus.nuclide.parentElement);

                // Show the nuclide from the dataset
                d3.selectAll("g.nuclide").style("display", "none");
                d3.select("#element_" + this.bignucleus.count.proton + "_nuclide_" + this.bignucleus.count.neutron + "_display").style("display", null);

                // Set the slider to the nuclide's halflife
                var exp = matter.max_halflife_exp;
                if (!this.bignucleus.nuclide.isStable){
                    exp = this.bignucleus.nuclide.halflife.exponent + Math.log10(this.bignucleus.nuclide.halflife.base) + 0.01;
                }
                display.time_slider.slideToExponent(exp);

                // Set nuclide name
                d3.select("#caption_nuclide_name").select("tspan").text(this.bignucleus.nuclide.name());

                // Set halflife caption
                var c = new Caption().text("[em4]Half-life:[em4] " + this.bignucleus.nuclide.halflife.repApproximate())
                    .x(137).y(34).lineHeight(4).appendTo(d3.select("#caption_nuclide_halflife"));

                // Set nuclide caption
                var c = new Caption().text(this.bignucleus.nuclide.caption)
                    .x(137).y(40).lineHeight(2.6).appendTo(d3.select("#caption_nuclide_caption"));

                // Enable/disable links
                d3.select("#link_decay_a").attr("class", "href" + (this.bignucleus.decay("a",true) ? "" : "_disabled"));
                d3.select("#link_decay_bp").attr("class", "href" + (this.bignucleus.decay("b+",true) ? "" : "_disabled"));
                d3.select("#link_decay_bm").attr("class", "href" + (this.bignucleus.decay("b-",true) ? "" : "_disabled"));
                d3.select("#link_decay_p").attr("class", "href" + (this.bignucleus.decay("p",true) ? "" : "_disabled"));
                d3.select("#link_decay_n").attr("class", "href" + (this.bignucleus.decay("n",true) ? "" : "_disabled"));
                var inc_p = matter.nuclideExists(this.bignucleus.count.proton + 1, this.bignucleus.count.neutron) ? "" : "_disabled";
                var dec_p = matter.nuclideExists(this.bignucleus.count.proton - 1, this.bignucleus.count.neutron) ? "" : "_disabled";
                var inc_n = matter.nuclideExists(this.bignucleus.count.proton, this.bignucleus.count.neutron + 1) ? "" : "_disabled";
                var dec_n = matter.nuclideExists(this.bignucleus.count.proton, this.bignucleus.count.neutron - 1) ? "" : "_disabled";
                d3.select("#link_inc_p").attr("class", "href" + inc_p);
                d3.select("#link_dec_p").attr("class", "href" + dec_p);
                d3.select("#link_inc_n").attr("class", "href" + inc_n);
                d3.select("#link_dec_n").attr("class", "href" + dec_n);
            }
        };

        // Make some links
        (function(nucleus){

            // Alpha Decay
            d3.select("#specifics").append("text").attr("id","decay_a_text").attr("class","caption")
            d3.select("#decay_a_text").append("tspan").attr("id","link_decay_a")
                .attr("class","href").attr("x", 4 * display.scale).attr("y", 90 * display.scale)
                .style("font-size", 3 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("a");
                    questions.current.setNuclide();
                }).text("(α) Alpha Decay");
            d3.select("#decay_a_text").append("tspan")
                .attr("x", 4 * display.scale).attr("y", 94 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject an alpha particle:");
            d3.select("#decay_a_text").append("tspan")
                .attr("x", 4 * display.scale).attr("y", 97.5 * display.scale).style("font-size", 2 * display.scale + "px")
                .text("(2 protons + 2 neutrons,");
            d3.select("#decay_a_text").append("tspan")
                .attr("x", 4 * display.scale).attr("y", 100 * display.scale).style("font-size", 2 * display.scale + "px")
                .text("or a Helium-4 nucleus)");
            new Nucleus(matter.elements[2].nuclides[2]).attr("id","a_decay_alpha")
                .attr("show_labels",true).appendTo(d3.select("#specifics"));
            d3.select("#a_decay_alpha").attr("transform","translate(" + 34 * display.scale + "," + 93 * display.scale + ") scale(" + 1.8 * display.scale + ")");

            // Proton Emission
            d3.select("#specifics").append("text").attr("id","decay_p_text").attr("class","caption")
            d3.select("#decay_p_text").append("tspan").attr("id","link_decay_p")
                .attr("class","href").attr("x", 4 * display.scale).attr("y", 109 * display.scale)
                .style("font-size", 3 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("p");
                    questions.current.setNuclide();
                }).text("(p) Proton-Emission Decay");
            d3.select("#decay_p_text").append("tspan")
                .attr("x", 4 * display.scale).attr("y", 113 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject a proton:");
            new Proton().attr("id","p_decay_proton").appendTo(d3.select("#specifics"));
            d3.select("#p_decay_proton").attr("transform","translate(" + 24 * display.scale + "," + 112 * display.scale + ") scale(" + 1.8 * display.scale + ")");

            // Neutron Emission
            d3.select("#specifics").append("text").attr("id","decay_n_text").attr("class","caption")
            d3.select("#decay_n_text").append("tspan").attr("id","link_decay_n")
                .attr("class","href").attr("x", 4 * display.scale).attr("y", 122 * display.scale)
                .style("font-size", 3 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("n");
                    questions.current.setNuclide();
                }).text("(n) Neutron-Emission Decay");
            d3.select("#decay_n_text").append("tspan")
                .attr("x", 4 * display.scale).attr("y", 126 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject a neutron:");
            new Neutron().attr("id","n_decay_neutron").appendTo(d3.select("#specifics"));
            d3.select("#n_decay_neutron").attr("transform","translate(" + 25 * display.scale + "," + 125 * display.scale + ") scale(" + 1.8 * display.scale + ")");

            // Beta-Minus Decay
            d3.select("#specifics").append("text").attr("id","decay_bm_text").attr("class","caption")
            d3.select("#decay_bm_text").append("tspan").attr("id","link_decay_bm")
                .attr("class","href").attr("x", 50 * display.scale).attr("y", 90 * display.scale)
                .style("font-size", 3 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b-");
                    questions.current.setNuclide();
                }).text("(β-) Beta-Minus Decay");
            d3.select("#decay_bm_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 94 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Convert a neutron to a proton:");
            d3.select("#decay_bm_text").append("tspan")
                .attr("x", 87.4 * display.scale).attr("y", 93.5 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("→");
            d3.select("#decay_bm_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 98 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject an electron:");
            d3.select("#decay_bm_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 102 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject an electron antineutrino:");
            new Neutron().attr("id","bm_decay_neutron").appendTo(d3.select("#specifics"));
            d3.select("#bm_decay_neutron").attr("transform","translate(" + 85 * display.scale + "," + 93 * display.scale + ") scale(" + 1.8 * display.scale + ")");
            new Proton().attr("id","bm_decay_proton").appendTo(d3.select("#specifics"));
            d3.select("#bm_decay_proton").attr("transform","translate(" + 92 * display.scale + "," + 93 * display.scale + ") scale(" + 1.8 * display.scale + ")");
            new Electron().attr("id","bm_decay_electron").appendTo(d3.select("#specifics"));
            d3.select("#bm_decay_electron").attr("transform","translate(" + 72 * display.scale + "," + 97 * display.scale + ") scale(" + 3.2 * display.scale + ")");
            new ElectronAntiNeutrino().attr("id","bm_decay_electronantineutrino").appendTo(d3.select("#specifics"));
            d3.select("#bm_decay_electronantineutrino").attr("transform","translate(" + 85 * display.scale + "," + 101 * display.scale + ") scale(" + 7 * display.scale + ")");

            // Beta-Plus Decay
            d3.select("#specifics").append("text").attr("id","decay_bp_text").attr("class","caption")
            d3.select("#decay_bp_text").append("tspan").attr("id","link_decay_bp")
                .attr("class","href").attr("x", 50 * display.scale).attr("y", 115 * display.scale)
                .style("font-size", 3 * display.scale + "px")
                .on("click", function(){
                    nucleus.decay("b+");
                    questions.current.setNuclide();
                }).text("(β+) Beta-Plus Decay");
            d3.select("#decay_bp_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 119 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Convert a neutron to a proton:");
            d3.select("#decay_bp_text").append("tspan")
                .attr("x", 87.5 * display.scale).attr("y", 118.5 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("→");
            d3.select("#decay_bp_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 123 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject a positron (anti-electron):");
            d3.select("#decay_bp_text").append("tspan")
                .attr("x", 50 * display.scale).attr("y", 127 * display.scale).style("font-size", 2.3 * display.scale + "px")
                .text("• Eject an electron neutrino:");
            new Proton().attr("id","bp_decay_proton").appendTo(d3.select("#specifics"));
            d3.select("#bp_decay_proton").attr("transform","translate(" + 85 * display.scale + "," + 118 * display.scale + ") scale(" + 1.8 * display.scale + ")");
            new Neutron().attr("id","bp_decay_neutron").appendTo(d3.select("#specifics"));
            d3.select("#bp_decay_neutron").attr("transform","translate(" + 92 * display.scale + "," + 118 * display.scale + ") scale(" + 1.8 * display.scale + ")");
            new Positron().attr("id","bp_decay_positron").appendTo(d3.select("#specifics"));
            d3.select("#bp_decay_positron").attr("transform","translate(" + 85.5 * display.scale + "," + 122.5 * display.scale + ") scale(" + 3.2 * display.scale + ")");
            new ElectronNeutrino().attr("id","bp_decay_electronneutrino").appendTo(d3.select("#specifics"));
            d3.select("#bp_decay_electronneutrino").attr("transform","translate(" + 81 * display.scale + "," + 126 * display.scale + ") scale(" + 7 * display.scale + ")");

            // Reset
            d3.select("#specifics").append("text").append("tspan").attr("id","link_reset")
                .attr("class","href").attr("x", 109 * display.scale).attr("y", 127.6 * display.scale)
                .style("font-size", 2.5 * display.scale + "px")
                .on("click", function(){
                    nucleus.setNuclide(matter.elements[6].nuclides[6]);                    
                    questions.current.setNuclide();
                }).text("Reset (to Carbon-12)");

            d3.select("#specifics").append("path")
                .attr("d",pathString([137, 12.4, 189, 12.4]))
                .attr("stroke","#FFFFFF").style("stroke-width","1")
                .attr("fill","none");
            d3.select("#specifics").append("path")
                .attr("d",pathString([137, 32.2, 189, 32.2]))
                .attr("stroke","#FFFFFF").style("stroke-width","1")
                .attr("fill","none");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em3").attr("x", 137 * display.scale).attr("y", 19.5 * display.scale)
                .style("font-size", 4 * display.scale + "px")
                .attr("textLength", 16 * display.scale + "px").attr("lengthAdjust", "spacingAndGlyphs")
                .text("Protons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 12.5 * display.scale).attr("height", 6.6 * display.scale)
                .attr("x", 155 * display.scale).attr("y", 14.7 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_protons\" class=\"nucleon\" maxlength=\"3\" value=\"" + nucleus.count.proton + "\" style=\"width: " + 11 * display.scale + "px;\" onChange=\"questions.current.setNuclide('input');\">");
            d3.select("#specifics").append("text").append("tspan").attr("id","link_inc_p")
                .attr("class","href").attr("x", 168.3 * display.scale).attr("y", 17.3 * display.scale)
                .style("font-size", 3.5 * display.scale + "px").style("text-decoration", "none")
                .on("click", function(){
                    var p = nucleus.count.proton + 1, n = nucleus.count.neutron;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclide();
                    }
                }).text("▲");
            d3.select("#specifics").append("text").append("tspan").attr("id","link_dec_p")
                .attr("class","href").attr("x", 168.3 * display.scale).attr("y", 21 * display.scale)
                .style("font-size", 3.5 * display.scale + "px").style("text-decoration", "none")
                .on("click", function(){
                    var p = nucleus.count.proton - 1, n = nucleus.count.neutron;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclide();
                    }
                }).text("▼");

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em1").attr("x", 137 * display.scale).attr("y", 28 * display.scale)
                .style("font-size", 4 * display.scale + "px")
                .attr("textLength", 16 * display.scale + "px").attr("lengthAdjust", "spacingAndGlyphs")
                .text("Neutrons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 12.5 * display.scale).attr("height", 6.6 * display.scale)
                .attr("x", 155 * display.scale).attr("y", 23.2 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_neutrons\" class=\"nucleon\" maxlength=\"3\" value=\"" + nucleus.count.neutron + "\" style=\"width: " + 11 * display.scale + "px;\" onChange=\"questions.current.setNuclide('input');\">");
            d3.select("#specifics").append("text").append("tspan").attr("id","link_inc_n")
                .attr("class","href").attr("x", 168.3 * display.scale).attr("y", 25.8 * display.scale)
                .style("font-size", 3.5 * display.scale + "px").style("text-decoration", "none")
                .on("click", function(){
                    var p = nucleus.count.proton, n = nucleus.count.neutron + 1;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclide();
                    }
                }).text("▲");
            d3.select("#specifics").append("text").append("tspan").attr("id","link_dec_n")
                .attr("class","href").attr("x", 168.3 * display.scale).attr("y", 29.5 * display.scale)
                .style("font-size", 3.5 * display.scale + "px").style("text-decoration", "none")
                .on("click", function(){
                    var p = nucleus.count.proton, n = nucleus.count.neutron - 1;
                    if (matter.nuclideExists(p, n)){
                        nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                        questions.current.setNuclide();
                    }
                }).text("▼");

        })(this.bignucleus);
            
        callback();

    }

};
