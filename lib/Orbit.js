"use strict";

/**
   Orbit - A path along which a Particle can be made to travel
   Example usage:
   var o = new Orbit().path([ [0, 1], [1, 1], [1, 0], [0, 0] ]).appendTo(parent);
   var p = new Particle().type("foo").appendTo(parent);
   o.attachParticle(p.node);
*/

var Orbit = function(){
    this.node = null;
    this.properties = {
        id: '',
        path: 1,
        stroke: "rgb(128,128,128)",
        stroke_width: 0.1,
        stroke_dasharray: "1, 2",
        tension: 0.5,
        interpolate: "cardinal-closed",
        duration: 1000,
        ease: "out-in",
        scaleFunction: null,
        animateFunction: null
    };
};

Orbit.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
};

// Path should be provided as an array of two-value arrays (e.g. [ [x1, y1], [x2, y2], ... ])
Orbit.prototype.path = function(value){
    if (typeof value == "undefined"){
        return this.properties.path;
    } else {
        this.properties.path = value;
        return this;
    }
};

Orbit.prototype.stroke = function(value){
    if (typeof value == "undefined"){
        return this.properties.stroke;
    } else {
        this.properties.stroke = value.toString();
        return this;
    }
};

Orbit.prototype.stroke_width = function(value){
    if (typeof value == "undefined"){
        return this.properties.stroke_width;
    } else {
        this.properties.stroke_width = parseFloat(value);
        return this;
    }
};

Orbit.prototype.stroke_dasharray = function(value){
    if (typeof value == "undefined"){
        return this.properties.stroke_dasharray;
    } else {
        this.properties.stroke_dasharray = value.toString();
        return this;
    }
};

// Tension is a float between 0 and 1
Orbit.prototype.tension = function(value){
    if (typeof value == "undefined"){
        return this.properties.tension;
    } else {
        this.properties.tension = parseFloat(value);
        return this;
    }
};

// See d3 documentation on line interpolation: https://github.com/mbostock/d3/wiki/SVG-Shapes#line_interpolate
Orbit.prototype.interpolate = function(value){
    if (typeof value == "undefined"){
        return this.properties.interpolate;
    } else {
        this.properties.interpolate = value.toString();
        return this;
    }
};

// Time for a particle to travel the full length of the path once, in milliseconds
Orbit.prototype.duration = function(value){
    if (typeof value == "undefined"){
        return this.properties.duration;
    } else {
        this.properties.duration = parseInt(value);
        return this;
    }
};

// See d3 documentation on easing: https://github.com/mbostock/d3/wiki/Transitions#d3_ease
Orbit.prototype.ease = function(value){
    if (typeof value == "undefined"){
        return this.properties.ease;
    } else {
        this.properties.ease = value.toString();
        return this;
    }
};

// Scale is a function that converts a particle's position along the path (float from 0 to 1)
// to scaling transformation on the particle itself (an arbitrary float).
// E.g.: new Orbit().scale(function(t){ return 1 + t; }); will scale a particle from 1x to 2x
// as it travels along the full length of the path from t = 0 to t = 1.
Orbit.prototype.scaleFunction = function(value){
    if (typeof value == "undefined"){
        return this.properties.scaleFunction;
    } else if (typeof value == "function") {
        this.properties.scaleFunction = value;
        return this;
    }
};

// Render the path SVG object as a child of the provided selector
Orbit.prototype.appendTo = function(selector){
    this.node = selector.append("path")
        .attr("id", this.properties.id)
        .attr("class", "orbit")
        .attr("fill", "none")
        .attr("stroke-width", this.properties.stroke_width)
        .attr("stroke", this.properties.stroke)
        .attr("stroke-dasharray", this.properties.stroke_dasharray)
        .data([this.properties.path])
        .attr("d", d3.svg.line().tension(this.properties.tension).interpolate(this.properties.interpolate));
    return this;
};

// Attach an existing particle to the path to animate its motion along the path.
// Note: path and particle must already be rendered as SVG objects before this is called.
Orbit.prototype.attachParticle = function(particle){
    var orbit = this;
    (function(orbit, particle){
        orbit.animateFunction = function(){
            particle.node.transition()
                .duration(orbit.duration()).ease(orbit.ease())
                .attrTween("transform", orbit.transformAlong(orbit.node.node()))
                .each("end", orbit.animateFunction);
        };
    })(orbit, particle);
    this.animateFunction();
};

// Private function used to generate transform values for every step in a particle's animation along a path
Orbit.prototype.transformAlong = function(path){
    var l = path.getTotalLength();
    var orbit = this;
    return function(d, i, a) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            var transform = "translate(" + p.x + "," + p.y + ")";
            if (typeof orbit.properties.scaleFunction == "function"){
                var s = orbit.properties.scaleFunction(t); 
                transform += " scale(" + s + ")";
            }
            return transform;
        };
    };
};