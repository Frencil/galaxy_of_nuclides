"use strict";

var Nucleus = function(nuclide, id){

    if (typeof nuclide != "object"){ return; }

    // ID is required to render so seed all instances with a random ID if one isn't passed
    if (typeof id != "undefined"){
        this.id = id.toString();
    } else {
        this.id = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Date.now();
    }
    this.node = null;

    this.nuclide = nuclide;
    this.particles = {};
    this.force = null;
    this.collide = null;

    (function(nucleus){
        
        nucleus.particles = {};
        for (var p = 0; p < nucleus.nuclide.protons; p++){
            nucleus.add(new Proton());
        }
        for (var n = 0; n < nucleus.nuclide.neutrons; n++){
            nucleus.add(new Neutron());
        }

        var dim = Math.sqrt(nucleus.nuclide.protons + nucleus.nuclide.neutrons);

        nucleus.force = d3.layout.force()
            .nodes(nucleus.particlesArray()).links([])
            .size([dim, dim]).charge(-0.2).gravity(0.3);

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
                            r = (d.circle.r + quad.point.circle.r) * 0.8;
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

Nucleus.prototype.add = function(particle){
    this.particles[particle.id] = particle;
    return this.particles[particle.id];
}

Nucleus.prototype.remove = function(particle){
    d3.select("#" + particle.id).remove();
    delete this.particles[particle.id];
}

Nucleus.prototype.particlesArray = function(){
    var nucleus = this;
    return Object.keys(nucleus.particles).map(function (key) {return nucleus.particles[key]});
}

Nucleus.prototype.setId = function(value){
    if (!value.toString().length){
        console.log("Error - Nucleus cannot have a blank id");
        return this;
    }
    this.id = value.toString();
    return this;
};

Nucleus.prototype.appendTo = function(selector){
    this.node = selector.append("g").attr("id", this.id);
    this.restart();
    return this;
};

Nucleus.prototype.restart = function(){
    (function(nucleus){
        nucleus.node.selectAll("circle")
            .data(nucleus.particlesArray()).enter().append("circle")
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .attr("id", function(d) { return d.id; })
            .attr("r", function(d) { return d.circle.r; })
            .attr("fill", function(d) { return d.circle.fill; })
            .attr("stroke", function(d) { return d.circle.stroke; })
            .style("stroke-width", function(d) { return d.circle.stroke_width; })
            .call(nucleus.force.drag);
        nucleus.force.on("tick", function(e) {
            d3.select("#" + nucleus.id).selectAll("circle")
                .each(nucleus.collide(.5))
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
        nucleus.force.start();
    })(this);
}

Nucleus.prototype.alphaDecay = function(){
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
    var alpha_subparticles = [first];
    var index = 1;
    while (alpha_contents.proton < 2 || alpha_contents.neutron < 2){
        if (alpha_contents[ranked[index].particle.type] < 2){
            alpha_subparticles.push(ranked[index].particle);
            alpha_contents[ranked[index].particle.type]++;
        }
        index++;
        if (index >= ranked.length){
            console.log("Unable to alpha decay nucleus; not enough protons and neutrons found!");
            break;
            return;
        }
    }
    console.log(alpha_subparticles);
    // Eject that sucker!
    this.eject(alpha_subparticles);
}

// Todo: split into beta- and beta+ modes
Nucleus.prototype.betaDecay = function(type){
    if (typeof type == "undefined"){ var type = '-'; }
    if (type != '-' && type != '+'){ type = '-'; }
    // Identify a proton to split
    var proton = null;
    for (var p in this.particles){
        if (this.particles[p].type == 'proton'){ proton = this.particles[p]; }
    }
    if (proton == null){
        console.log("Unable to beta decay nucleus; no protons found!");
        return;
    }
    // Stop force
    this.force.stop();
    (function(nucleus, proton){
        proton.split(function(){
            var particle = d3.select("#" + proton.id);
            var daughter1 = nucleus.add( new Neutron().attr("x", particle.attr("cx")).attr("y", particle.attr("cy")) );
            var daughter2 = nucleus.add( new Electron().attr("x", particle.attr("cx")).attr("y", particle.attr("cy")) );
            nucleus.remove(proton);
            nucleus.restart();
            nucleus.eject([daughter1]);
            nucleus.eject([daughter2]);
        });
    })(this, proton);
};

Nucleus.prototype.eject = function(particles){
    (function (nucleus, particles){
        var angle = Math.random() * 360;
        var distance = Math.sqrt(nucleus.particlesArray().length) * 10;
        var x_final = Math.cos(angle) * distance;
        var y_final = Math.sin(angle) * distance;
        for (var p in particles){
            d3.select("#" + particles[p].id).transition().duration(3000).ease("cubic-out")
                .attr("cx", x_final).attr("cy", y_final).style("opacity", 0).each("end", function(d){
                    nucleus.remove(d);
                    nucleus.restart();
                });
        }
    })(this, particles);
}

/*
var n = new Nucleus(matter.elements[6].nuclides[8]).setId("foo").appendTo(d3.select("#specifics"));
d3.select("#foo").attr("transform","translate(300,300) scale(15)");
*/