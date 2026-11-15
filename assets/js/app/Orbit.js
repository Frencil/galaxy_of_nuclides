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
        tension: -0.5,
        curve: d3.curveCardinalClosed,
        duration: 1000,
        ease: d3.easeLinear,
        scaleFunction: null,
        opacityFunction: null,
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

// Tension for cardinal curves (and beta for d3.curveBundle). See https://d3js.org/d3-shape/curve#curveCardinal
// Note: d3 v7 measures tension differently than d3 v3 did; v3 tension t looks the same as v7 tension 3t - 2,
// so the default of -0.5 here matches the 0.5 this used under d3 v3.
Orbit.prototype.tension = function(value){
    if (typeof value == "undefined"){
        return this.properties.tension;
    } else {
        this.properties.tension = parseFloat(value);
        return this;
    }
};

// Curve factory used to draw the path through its points, e.g. d3.curveCardinalClosed
// See d3 documentation on curves: https://d3js.org/d3-shape/curve
Orbit.prototype.curve = function(value){
    if (typeof value == "undefined"){
        return this.properties.curve;
    } else if (typeof value == "function") {
        this.properties.curve = value;
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

// Easing function for the particle's motion along the path, e.g. d3.easeLinear
// See d3 documentation on easing: https://d3js.org/d3-ease
Orbit.prototype.ease = function(value){
    if (typeof value == "undefined"){
        return this.properties.ease;
    } else if (typeof value == "function") {
        this.properties.ease = value;
        return this;
    }
};

// scaleFunction is a function that converts a particle's position along the path (float from 0 to 1)
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

// opacityFunction is a function that converts a particle's position along the path (float from 0 to 1)
// to an opacity value for the particle (float from 0 to 1)
Orbit.prototype.opacityFunction = function(value){
    if (typeof value == "undefined"){
        return this.properties.opacityFunction;
    } else if (typeof value == "function") {
        this.properties.opacityFunction = value;
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
        .attr("d", d3.line().curve(this.curveWithTension()));
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
                .styleTween("opacity", orbit.opacityAlong(orbit.node.node()))
                .on("end", orbit.animateFunction);
        };
    })(orbit, particle);
    this.animateFunction();
};

// Private function to apply the tension setting to the curve, for curve types that support one
Orbit.prototype.curveWithTension = function(){
    var curve = this.properties.curve;
    if (typeof curve.tension == "function"){ return curve.tension(this.properties.tension); }
    if (typeof curve.beta == "function"){ return curve.beta(this.properties.tension); }
    return curve;
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

// Private function used to generate opacity values for every step in a particle's animation along a path
Orbit.prototype.opacityAlong = function(path){
    var l = path.getTotalLength();
    var orbit = this;
    return function(d, i, a) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            var opacity = 1;
            if (typeof orbit.properties.opacityFunction == "function"){
                opacity = orbit.properties.opacityFunction(t); 
            }
            return opacity;
        };
    };
};