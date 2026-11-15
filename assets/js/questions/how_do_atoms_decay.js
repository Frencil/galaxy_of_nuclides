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
          copy: "[em4]Half-life:[em4] ..."
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
            .attr("id","bignucleus").attr("show_labels",true).attr("jitter",500).appendTo(d3.select("#specifics"));
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
                var p = this.bignucleus.count.proton, n = this.bignucleus.count.neutron;
                d3.select("#link_inc_p").classed("disabled", !matter.nuclideExists(p + 1, n));
                d3.select("#link_dec_p").classed("disabled", !matter.nuclideExists(p - 1, n));
                d3.select("#link_inc_n").classed("disabled", !matter.nuclideExists(p, n + 1));
                d3.select("#link_dec_n").classed("disabled", !matter.nuclideExists(p, n - 1));
            }
        };

        // Make some links
        (function(nucleus){

            // Up/down buttons beside the proton and neutron inputs. Each is an invisible rect (the click
            // target, so neighboring buttons' click areas can't overlap) with an equilateral triangle
            // centered on it pointing up (dir = -1) or down (dir = 1).
            var stepper = function(id, y, dp, dn, dir){
                var size = 3.3 * display.scale;
                var g = d3.select("#specifics").append("g")
                    .attr("id", id).attr("class", "stepper")
                    .attr("transform", "translate(" + 167.8 * display.scale + "," + y * display.scale + ")")
                    .on("click", function(){
                        var p = nucleus.count.proton + dp, n = nucleus.count.neutron + dn;
                        if (matter.nuclideExists(p, n)){
                            nucleus.setNuclide(matter.elements[p].nuclides[n]).restart();
                            questions.current.setNuclide();
                        }
                    });
                g.append("rect").attr("width", size).attr("height", size);
                var side = 2.2 * display.scale, h = side * Math.sqrt(3) / 2, c = size / 2;
                g.append("path")
                    .attr("d", "M" + (c - side / 2) + "," + (c - dir * h / 2)
                             + "L" + (c + side / 2) + "," + (c - dir * h / 2)
                             + "L" + c + "," + (c + dir * h / 2) + "Z");
            };

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
                .text("• Convert a proton to a neutron:");
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
                .style("font-size", 3.2 * display.scale + "px")
                .text("Protons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 12.5 * display.scale).attr("height", 6.6 * display.scale)
                .attr("x", 155 * display.scale).attr("y", 14.7 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_protons\" class=\"nucleon\" maxlength=\"3\" value=\"" + nucleus.count.proton + "\" style=\"width: " + 11 * display.scale + "px;\" onChange=\"questions.current.setNuclide('input');\">");
            stepper("link_inc_p", 14.7, 1, 0, -1);
            stepper("link_dec_p", 18.0, -1, 0, 1);

            d3.select("#specifics").append("text").append("tspan")
                .attr("class","em1").attr("x", 137 * display.scale).attr("y", 28 * display.scale)
                .style("font-size", 3.2 * display.scale + "px")
                .text("Neutrons:");
            d3.select("#specifics").append("foreignObject")
                .attr("width", 12.5 * display.scale).attr("height", 6.6 * display.scale)
                .attr("x", 155 * display.scale).attr("y", 23.2 * display.scale)
                .append("xhtml:body")
                .html("<input id=\"input_neutrons\" class=\"nucleon\" maxlength=\"3\" value=\"" + nucleus.count.neutron + "\" style=\"width: " + 11 * display.scale + "px;\" onChange=\"questions.current.setNuclide('input');\">");
            stepper("link_inc_n", 23.2, 0, 1, -1);
            stepper("link_dec_n", 26.5, 0, -1, 1);

            // Make the mini periodic table clickable: each element shows its most stable nuclide.
            // The dashed highlight box marks the current element; while the mouse is over an element
            // that element gets the hover outline instead (hiding the dashed box if it's the current one).
            var periodic_table = questions.cache.how_do_atoms_decay.periodic_table;
            var element_w = periodic_table.element.w * display.scale;
            var hovered = null;
            var mostStableNuclide = function(element){
                var best = null, best_hl = -Infinity;
                for (var n in element.nuclides){
                    var nuclide = element.nuclides[n];
                    var hl = nuclide.isStable ? Infinity : nuclide.halflife.exponent + Math.log10(nuclide.halflife.base);
                    // Strictly greater, scanning in order of increasing neutrons, keeps the fewest neutrons on ties
                    if (best == null || hl > best_hl || (hl == best_hl && nuclide.neutrons < best.neutrons)){
                        best = nuclide; best_hl = hl;
                    }
                }
                return best;
            };
            var showCurrentBox = function(show){
                d3.select("#element_highlightbox").style("display", show ? "block" : "none");
            };
            d3.select("#specifics").append("g").attr("id", "element_buttons")
                .selectAll("rect")
                .data(matter.elements.filter(function(e){ return mostStableNuclide(e) != null; }))
                .enter().append("rect")
                .attr("class", "element_button")
                .attr("transform", function(d){
                    var c = display.periodic_table.getElementCoords(d, periodic_table);
                    return "translate(" + c[0] + "," + c[1] + ")";
                })
                .attr("width", element_w).attr("height", element_w)
                .attr("rx", 0.4 * display.scale).attr("ry", 0.4 * display.scale)
                .on("mouseover", function(event, d){
                    hovered = d.protons;
                    if (d.protons == nucleus.count.proton){ showCurrentBox(false); }
                    display.setThumbnail(d.protons);
                })
                .on("mouseout", function(event, d){
                    hovered = null;
                    if (d.protons == nucleus.count.proton){ showCurrentBox(true); }
                    display.setThumbnail(nucleus.count.proton);
                })
                .on("click", function(event, d){
                    var nuclide = mostStableNuclide(d);
                    nucleus.setNuclide(nuclide).restart();
                    questions.current.setNuclide();
                    // The clicked element is now the current one and is still under the mouse
                    if (hovered == d.protons){ showCurrentBox(false); }
                })
                .append("title").text(function(d){ return "Show the most stable nuclide of " + d.name; });

        })(this.bignucleus);
            
        callback();

    }

};
