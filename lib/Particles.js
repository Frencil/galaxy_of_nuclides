"use strict";

// Define Particle and Orbit Class

var Particle = function() {

    this.properties = {
        type: null,
        id: '',
        x: 0,
        y: 0,
        scale: 1
    };

    this.types = {
        proton: {
            circle: { r: 1, stroke_width: 0.1 },
            text: { text: 'p+', x: -0.65, y: 0.4, font_size: 1.3 }
        },
        neutron: {
            circle: { r: 0.9, stroke_width: 0.1 },
            text: { text: 'n', x: -0.4, y: 0.35, font_size: 1.3 }
        },
        electron: {
            circle: { r: 0.1, stroke_width: 0.02 },
            text: { text: 'e-', x: -0.06, y: 0.045, font_size: 0.15 }
        }
    };

}


Particle.prototype.type = function(value){
    if (typeof value == "undefined"){
        return this.properties.type;
    } else {
        this.properties.type = value.toString();
        return this;
    }
}

Particle.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
}

Particle.prototype.x = function(value){
    if (typeof value == "undefined"){
        return this.properties.x;
    } else {
        this.properties.x = parseFloat(value);
        return this;
    }
}

Particle.prototype.y = function(value){
    if (typeof value == "undefined"){
        return this.properties.y;
    } else {
        this.properties.y = parseFloat(value);
        return this;
    }
}

Particle.prototype.scale = function(value){
    if (typeof value == "undefined"){
        return this.properties.scale;
    } else {
        this.properties.scale = parseFloat(value);
        return this;
    }
}

Particle.prototype.appendTo = function(selector){

    var particle = this.types[this.properties.type];
    if (typeof particle == "undefined"){
        console.log("Error - particle type not set");
        console.log(this);
        return;
    }

    var g = selector.append("g").attr("id", this.properties.id)
        .attr("transform", "translate(" + (this.properties.x * display.scale) + "," + (this.properties.y * display.scale) + ")");

    for (var object in particle){
        var o = g.append(object).attr("class","particle " + this.properties.type);
        for (var attr in particle[object]){
            var val = particle[object][attr];
            var css_attr = attr.replace("_","-");
            switch(css_attr){
            case 'text':
                o.text(val);
                break;
            case 'font-size':
                o.style(css_attr, (val * this.properties.scale * display.scale) + "px");
                break;
            case "stroke-width":
            case "r":
            case "x":
            case "y":
                val *= this.properties.scale * display.scale;
            default:
                o.attr(css_attr, val);
                break;
            }
        }
    }

    return g;

}

////////////////////////////////////////////////////

var Orbit = function() {
    this.properties = {
        id: '',
        path: 1,
        tension: 0.5,
        interpolate: "cardinal-closed"
    };
}

Orbit.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
}

Orbit.prototype.tension = function(value){
    if (typeof value == "undefined"){
        return this.properties.tension;
    } else {
        this.properties.tension = parseFloat(value);
        return this;
    }
}

Orbit.prototype.interpolate = function(value){
    if (typeof value == "undefined"){
        return this.properties.interpolate;
    } else {
        this.properties.interpolate = value.toString();
        return this;
    }
}

Orbit.prototype.path = function(value){
    if (typeof value == "undefined"){
        return this.properties.path;
    } else {
        for (var v in value){
            value[v][0] *= display.scale;
            value[v][1] *= display.scale;
        }
        this.properties.path = value;
        return this;
    }
}

Orbit.prototype.appendTo = function(selector){
    var g = selector.append("path")
        .attr("id", this.properties.id)
        .attr("fill", "none").attr("stroke-width", 0.3 * display.scale)
        .attr("stroke", "rgb(128,128,128)").attr("stroke-dasharray", display.scale + "," + (1.5 * display.scale))
        .data([this.properties.path])
        .attr("d", d3.svg.line().tension(this.properties.tension).interpolate(this.properties.interpolate));
    return g;
}
