"use strict";

var Particle = function(){
    this.id = null;
    this.type = null;
    this.x = null;
    this.y = null;
    this.circle = null;
    this.text = null;
    this.index = null;
    return this;
}

Particle.prototype.getRandomId = function(){
    var id = '';
    for (var i = 0; i < 5; i++){
        id +=  String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    id += Date.now();
    return id;
}

Particle.prototype._settableAttributes = { id: "string",
                                           x: "float",
                                           y: "float",
                                           index: "int" };

Particle.prototype.attr = function(attr, value){
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

Particle.prototype.split = function(callback){
    d3.select("#" + this.id)
        .attr("filter", "url(#highlight-glow)");
    d3.select("#" + this.id)
        .transition().duration(900)
        .attr("fill", "rgb(255,255,255)").attr("stroke", "rgb(255,255,255)")
        .transition().duration(100)
        .attr("transform", "scale(2)").style("opacity", 0)
        .each("end", callback);
};

var Proton = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Proton.prototype = new Particle();
Proton.prototype.type = "proton";
Proton.prototype.circle = { r: 1, stroke_width: 0.1, fill: "rgb(170,255,186)", stroke: "rgb(102,153,112)" };
Proton.prototype.text = { text: 'p+', x: -0.65, y: 0.4, font_size: 1.3 };

var Neutron = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Neutron.prototype = new Particle();
Neutron.prototype.type = "neutron";
Neutron.prototype.circle = { r: 0.9, stroke_width: 0.1, fill: "rgb(255,213,170)", stroke: "rgb(153,128,102)" };
Neutron.prototype.text = { text: 'n', x: -0.4, y: 0.35, font_size: 1.3 };

var Electron = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Electron.prototype = new Particle();
Electron.prototype.type = "electron";
Electron.prototype.circle = { r: 0.4, stroke_width: 0.05, fill: "rgb(170,227,255)", stroke: "rgb(102,136,153)" };
Electron.prototype.text = { text: 'e-', x: -0.24, y: 0.18, font_size: 0.6 };

// Render the particle SVG object group as a child of the provided selector
/*
Particle.prototype.appendTo = function(selector){
    var particle = this.types[this.properties.type];
    if (typeof particle == "undefined"){
        console.log("Error - particle type not set");
        return false;
    }
    this.node = selector.append("g")
        .attr("transform", "translate(" + this.properties.x + "," + this.properties.y + ")");
    for (var object in particle){
        var o = this.node.append(object).attr("class","particle " + this.properties.type);
        for (var attr in particle[object]){
            var val = particle[object][attr];
            var css_attr = attr.replace("_","-");
            switch(css_attr){
            case 'text':
                o.text(val);
                break;
            case 'font-size':
                o.style(css_attr, (val * this.properties.scale) + "px");
                break;
            case "stroke-width":
            case "r":
            case "x":
            case "y":
                val *= this.properties.scale;
            default:
                o.attr(css_attr, val);
                break;
            }
        }
    }
    return this;
};
*/