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

    this.nuclide = nuclide;
    this.particles = {};
    this.count = { proton: 0, neutron: 0 };
    this.width_sum = 0;
    this.show_labels = false;
    this.force = null;
    this.gravity = 0.8;
    this.collide = null;

    (function(nucleus){
        
        nucleus.particles = {};
        for (var p = 0; p < nucleus.nuclide.protons; p++){
            nucleus.add(new Proton());
        }
        for (var n = 0; n < nucleus.nuclide.neutrons; n++){
            nucleus.add(new Neutron());
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
    while (this.count.proton != this.nuclide.protons){
        if (this.count.proton < this.nuclide.protons){
            this.add(new Proton());
        } else {
            this.removeByType("proton");
        }
    }
    while (this.count.neutron != this.nuclide.neutrons){
        if (this.count.neutron < this.nuclide.neutrons){
            this.add(new Neutron());
        } else {
            this.removeByType("neutron");
        }
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
        nucleus.force = d3.layout.force()
            .nodes(nucleus.particlesArray()).links([])
            .size([dim, dim]).charge(-0.2).gravity(nucleus.gravity).friction(0.5);
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
}

Nucleus.prototype.alphaDecay = function(){
    this.force.stop();
    // Start with the first particle in the nucleus
    var first = this.particlesArray()[0];
    // Build a ranked list of particles in ascending order of distance from the first particle
    var ranked = [];
    var quadtree = d3.geom.quadtree(this.particlesArray().slice(1));
    quadtree.visit(function(node, x1, y1, x2, y2) {
        if (!node.leaf){ return; }
        var distance = Math.sqrt(Math.pow(first.px - node.point.px, 2) + Math.pow(first.py - node.point.py, 2));
        ranked.push({ particle: node.point, distance: distance });
    });
    ranked.sort(function(a, b){ return a.distance-b.distance; });
    // Build an alpha particle from the closest particles
    var alpha_contents = { proton: (first.type == "proton" ? 1 : 0), neutron: (first.type == "neutron" ? 1 : 0) };
    var alpha_nucleons = [first];
    var index = 1;
    while (alpha_contents.proton < 2 || alpha_contents.neutron < 2){
        if (alpha_contents[ranked[index].particle.type] < 2){
            alpha_nucleons.push(ranked[index].particle);
            alpha_contents[ranked[index].particle.type]++;
        }
        index++;
        if (index >= ranked.length){
            console.log("Unable to alpha decay nucleus; not enough protons and neutrons found!");
            this.restart();
            return this;
            break;
        }
    }
    // Pop the alpha nucleons out of existence and pop a Helium-4 nucleus into existence on the same spot to be ejected
    var alpha_id = this.id + "_alpha_" + Date.now();
    var alpha_particle = new Nucleus(matter.elements[2].nuclides[2]).attr("show_labels", this.show_labels)
        .attr("id",alpha_id).attr("gravity",3).appendTo(this.ejecta_selector);
    d3.select("#"+alpha_id).attr("transform","translate(" + first.px + "," + first.py + ")");
    for (var n in alpha_nucleons){
        this.remove(alpha_nucleons[n]);
    }
    this.restart();
    this.eject(alpha_particle);
    return this;
}

// Todo: split into beta- and beta+ modes
Nucleus.prototype.betaDecay = function(type){
    if (typeof type == "undefined"){ var type = '-'; }
    if (type != '-' && type != '+'){ type = '-'; }
    // Remove a proton
    this.force.stop();
    var proton = this.removeByType("proton");
    if (proton == null){
        console.log("Unable to beta decay nucleus; no protons found!");
        this.restart();
        return this;
    }
    // Add a neutron and electron; eject the electron
    this.add(new Neutron().attr("id",proton.id+"_daughterneutron").attr("x", proton.px).attr("y", proton.py));
    this.restart();
    var electron = new Electron().attr("id",proton.id+"_daughterelectron")
        .attr("x", proton.px).attr("y", proton.py).appendTo(this.ejecta_selector);
    this.eject(electron);
    return this;
};

Nucleus.prototype.eject = function(particle){
    var angle = Math.random() * 360;
    var x_final = Math.cos(angle) * Math.sqrt(this.width_sum) * 6;
    var y_final = Math.sin(angle) * Math.sqrt(this.width_sum) * 6;
    d3.select("#" + particle.id).transition().duration(3000).ease("cubic-out")
        .attr("transform","translate(" + x_final + "," + y_final + ")").style("opacity", 0).remove();
}
