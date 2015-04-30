"use strict";

/*
   Define Particle Class

   Particles are simple shapes with labels to depict particles such as protons or neutrons
   Example usage:
   
   var p = new Particle().type("foo").appendTo(parent);
*/

var Particle = function(){

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

};

// Type is a required string and must match a type in this.types
Particle.prototype.type = function(value){
    if (typeof value == "undefined"){
        return this.properties.type;
    } else {
        if (typeof this.types[value] == "undefined"){
            console.log("Error - invalid particle type:" + value);
        } else {
            this.properties.type = value.toString();
        }
        return this;
    }
};

Particle.prototype.id = function(value){
    if (typeof value == "undefined"){
        return this.properties.id;
    } else {
        this.properties.id = value.toString();
        return this;
    }
};

Particle.prototype.x = function(value){
    if (typeof value == "undefined"){
        return this.properties.x;
    } else {
        this.properties.x = parseFloat(value);
        return this;
    }
};

Particle.prototype.y = function(value){
    if (typeof value == "undefined"){
        return this.properties.y;
    } else {
        this.properties.y = parseFloat(value);
        return this;
    }
};

// An arbitrary float to scale the particle's radius and label.
// All particles have a radius relative to the proton, which has a radius of 1.
Particle.prototype.scale = function(value){
    if (typeof value == "undefined"){
        return this.properties.scale;
    } else {
        this.properties.scale = parseFloat(value);
        return this;
    }
};

// Render the particle SVG object group as a child of the provided selector
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

};