"use strict";

var Nucleus = function(nuclide, id){

    if (typeof nuclide != "object"){ return; }

    // ID is required to render so seed all instances with a random ID if one isn't passed
    if (typeof id != "undefined"){
        this.id = id.toString();
    } else {
        this.id = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();
    }

    this.selector = null;
    this.nucleons_selector = null;
    this.ejecta_selector = null;

    this.original_nuclide = null;
    this.nuclide = null;
    this.particles = {};
    this.count = { proton: 0, neutron: 0 };
    this.width_sum = 0;
    this.show_labels = false;
    this.force = null;
    this.gravity = 0.9;
    this.collide = null;

    // If a nuclide has been passed set it with the special setter method
    if (nuclide instanceof Nuclide){
        this.setNuclide(nuclide);
    }

    return this;

};

Nucleus.prototype.setNuclide = function(nuclide){
    if (this.nuclide == null){
        this.original_nuclide = nuclide;
    }
    this.nuclide = nuclide;
    (function(nucleus){
        while (nucleus.count.proton != nucleus.nuclide.protons){
            if (nucleus.count.proton < nucleus.nuclide.protons){
                nucleus.add(new Proton());
            } else {
                nucleus.removeByType("proton");
            }
        }
        while (nucleus.count.neutron != nucleus.nuclide.neutrons){
            if (nucleus.count.neutron < nucleus.nuclide.neutrons){
                nucleus.add(new Neutron());
            } else {
                nucleus.removeByType("neutron");
            }
        }
        nucleus.collide = function(alpha){
            var quadtree = d3.geom.quadtree(nucleus.particlesArray());
            return function(d) {
                var r = d.circle.r * 1.7,
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                            y = d.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = (d.circle.r + quad.point.circle.r) - 6.28 * Math.abs(d.circle.r - quad.point.circle.r);
                        if (l < r && l != 0) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        };
    })(this);
    return this;
};

Nucleus.prototype._settableAttributes = { id: "string",
                                          gravity: "float",
                                          show_labels: "boolean" };

Nucleus.prototype.attr = function(attr, value){
    if (typeof this._settableAttributes[attr] == "undefined"){
        console.log("Particle error: " + attr + " is not a valid attribute");
        return;
    }
    if (typeof value == "undefined"){
        return this[attr];
    } else {
        switch (this._settableAttributes[attr]){
        case "int":
            this[attr] = parseInt(value);
            break;
        case "float":
            this[attr] = parseFloat(value);
            break;
        case "boolean":
            this[attr] = Boolean(value);
        case "string":
            this[attr] = value.toString();
            break;
        default:
            this[attr] = value;
            break;
        }
        return this;
    }
};

Nucleus.prototype.add = function(particle){
    this.count[particle.type]++;
    this.particles[particle.id] = particle;
    this.width_sum += particle.circle.r;
    return this;
}

Nucleus.prototype.remove = function(particle){
    this.count[particle.type]--;
    d3.select("#" + particle.id).remove();
    this.width_sum -= particle.circle.r;
    delete this.particles[particle.id];
    return this;
}

Nucleus.prototype.removeByType = function(type){
    var particle = null; var p = 0;
    while (particle == null && p < this.particlesArray().length){
        if (this.particlesArray()[p].type == type){ particle = this.particlesArray()[p]; }
        p++;
    }
    if (particle != null){
        this.remove(particle);
    }
    return particle;
}

Nucleus.prototype.reset = function(){
    this.force.stop();
    if (this.nuclide != this.original_nuclide){
        this.setNuclide(this.original_nuclide);
    }
    this.restart();
}

Nucleus.prototype.particlesArray = function(){
    var nucleus = this;
    return Object.keys(nucleus.particles).map(function (key) {return nucleus.particles[key]});
}

Nucleus.prototype.appendTo = function(parentSelector){
    this.selector = parentSelector.append("g").attr("id", this.id);
    this.nucleons_selector = this.selector.append("g");
    this.ejecta_selector = this.selector.append("g");
    this.restart();
    return this;
};

Nucleus.prototype.restart = function(){
    (function(nucleus){
        var dim = Math.sqrt(nucleus.width_sum);
        var chargeDist = Math.sqrt(nucleus.width_sum) / 2;
        nucleus.force = d3.layout.force()
            .nodes(nucleus.particlesArray()).links([])
            .size([dim, dim]).charge(-2).chargeDistance(chargeDist).gravity(nucleus.gravity).friction(0.5);
        nucleus.nucleons_selector.selectAll("g.nucleon").remove();
        var nodes = nucleus.nucleons_selector.selectAll("g.nucleon")
            .data(d3.shuffle(nucleus.particlesArray())).enter().append("g")
            .attr("class", "nucleon")
            .attr("id", function(d) { return d.id; })
            .call(nucleus.force.drag);
        nodes.append("circle")
            .attr("r", function(d) { return d.circle.r; })
            .attr("fill", function(d) { return d.circle.fill; })
            .attr("stroke", function(d) { return d.circle.stroke; })
            .style("stroke-width", function(d) { return d.circle.stroke_width; })
        if (nucleus.show_labels){
            nodes.append("text")
                .attr("fill", function(d) { return d.text.fill; })
                .attr("transform", function(d){ return "translate(" + [d.text.x, d.text.y] + ")"; })
                .style("font-size", function(d){ return d.text.font_size + "px"; })
                .text(function(d){ return d.text.text; });
        }
        nucleus.force.on("tick", function(e) {
            nucleus.nucleons_selector.selectAll("g.nucleon")
                .each(nucleus.collide(.1))
                .attr("transform", function(d){ return "translate(" + [d.x, d.y] + ")"; });
        });
        nucleus.force.start();
    })(this);
};

Nucleus.prototype._decayModes = [
    "a", "b+", "b-", "p", "n",
    ["b+","b+"], ["b-","b-"], ["p","p"], ["n","n"], 
    ["b+","a"], ["b-","a"], ["b+","p"], ["b-","n"],
    ["b-","n","n"], ["b-","n","n","n"], ["b-","n","n","n","n"],
    ["b+","a","a"], ["b+","a","a","a"], ["b+","p", "p"]
];

// Pass an array of valid decay mode strings to decay the nucleus.
// Optionally pass the test flag (true) to get a boolean signifying if the decay modes are valid or not.
Nucleus.prototype.decay = function(modes, test){
    if (typeof test == "undefined"){ var test = false; }
    var p = this.count.proton;
    var n = this.count.neutron;
    var ejecta = [];
    if (typeof modes == 'string'){ modes = [modes]; }
    for (var m in modes){
        var mode = modes[m];
        switch(mode){
        case 'a': // Alpha
            p -= 2; n -= 2;
            ejecta.push(new Nucleus(matter.elements[2].nuclides[2]).attr("show_labels", true));
            break;
        case 'b+': // Beta-Plus
            p -= 1; n += 1;
            ejecta.push(new Electron());
            ejecta.push(new ElectronNeutrino());
            break;
        case 'b-': // Beta-Minus
            p += 1; n -= 1;
            ejecta.push(new Positron());
            ejecta.push(new ElectronAntiNeutrino());
            break;
        case 'p':
            p -= 1; // Proton Emission
            ejecta.push(new Proton());
            break;
        case 'n':
            n -= 1; // Neutron Emission
            ejecta.push(new Neutron());
            break;
        default:
            console.log("Invalid decay mode: " + mode);
            return false;
            break;
        }
    }
    if (test){
        return matter.nuclideExists(p, n);
    } else {
        if (!matter.nuclideExists(p, n)){
            console.log("Unable to decay: " + modes + "; target nuclide outside of dataset");
        } else {
            this.setNuclide(matter.elements[p].nuclides[n]);
            this.restart();
            for (var e in ejecta){
                ejecta[e].appendTo(this.ejecta_selector);
                this.eject(ejecta[e]);
            }
        }
    }
    return this;
};

Nucleus.prototype.eject = function(particle){
    var angle = Math.random() * 360;
    var xy_init = Math.sqrt(this.width_sum) / 2;
    var x_final = Math.cos(angle) * Math.sqrt(this.width_sum) * 6;
    var y_final = Math.sin(angle) * Math.sqrt(this.width_sum) * 6;
    d3.select("#" + particle.id).attr("transform","translate(" + xy_init + "," + xy_init + ")");
    d3.select("#" + particle.id).transition().duration(3000).ease("cubic-out")
        .attr("transform","translate(" + x_final + "," + y_final + ")").style("opacity", 0).remove();
};
