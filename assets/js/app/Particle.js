"use strict";

var Particle = function(){
    this.id = null;
    this.type = null;
    this.x = null;
    this.y = null;
    this.circle = null;
    this.text = null;
    this.index = null;
    this.show_labels = true;
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
                                           index: "int",
                                           show_labels: "boolean" };

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

var Proton = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Proton.prototype = new Particle();
Proton.prototype.type = "proton";
Proton.prototype.circle = { r: 1, stroke_width: 0.1, fill: "rgb(170,255,186)", stroke: "rgb(102,153,112)" };
Proton.prototype.text = { text: 'p+', x: -0.65, y: 0.4, fill: "rgb(15,15,15)", font_size: 1.3 };

var Neutron = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Neutron.prototype = new Particle();
Neutron.prototype.type = "neutron";
Neutron.prototype.circle = { r: 0.9, stroke_width: 0.1, fill: "rgb(255,213,170)", stroke: "rgb(153,128,102)" };
Neutron.prototype.text = { text: 'n', x: -0.4, y: 0.35, fill: "rgb(15,15,15)", font_size: 1.3 };

var Electron = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Electron.prototype = new Particle();
Electron.prototype.type = "electron";
Electron.prototype.circle = { r: 0.4, stroke_width: 0.05, fill: "rgb(170,227,255)", stroke: "rgb(102,136,153)" };
Electron.prototype.text = { text: 'e-', x: -0.24, y: 0.18, fill: "rgb(15,15,15)", font_size: 0.6 };

var Positron = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
Positron.prototype = new Particle();
Positron.prototype.type = "positron";
Positron.prototype.circle = { r: 0.4, stroke_width: 0.05, fill: "rgb(102,136,153)", stroke: "rgb(170,227,255)" };
Positron.prototype.text = { text: 'e+', x: -0.23, y: 0.2, fill: "rgb(240,240,240)", font_size: 0.5, text_decoration: "overline" };

var ElectronNeutrino = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
ElectronNeutrino.prototype = new Particle();
ElectronNeutrino.prototype.type = "electronneutrino";
ElectronNeutrino.prototype.circle = { r: 0.2, stroke_width: 0.03, fill: "rgb(243,170,255)", stroke: "rgb(145,102,153)" };
ElectronNeutrino.prototype.text = { text: 'νₑ', x: -0.14, y: 0.1, fill: "rgb(15,15,15)", font_size: 0.3 };

var ElectronAntiNeutrino = function(){
    this.id = this.getRandomId();
    this.x = Math.random();
    this.y = Math.random();
    return this;
};
ElectronAntiNeutrino.prototype = new Particle();
ElectronAntiNeutrino.prototype.type = "electronantineutrino";
ElectronAntiNeutrino.prototype.circle = { r: 0.2, stroke_width: 0.03, fill: "rgb(145,102,153)", stroke: "rgb(243,170,255)" };
ElectronAntiNeutrino.prototype.text = { text: 'νₑ', x: -0.12, y: 0.1, fill: "rgb(240,240,240)", font_size: 0.25, text_decoration: "overline" };

// Render the particle SVG object group as a child of the provided selector
Particle.prototype.appendTo = function(selector){
    if (this.type == null){
        console.log("Error - particle type not set");
        return false;
    }
    this.node = selector.append("g").attr("id", this.id)
        .attr("transform", "translate(" + this.x + "," + this.y + ")");
    if (this.show_labels){
        var objects = ['circle', 'text'];
    } else {
        var objects = ['circle'];
    }
    for (var o in objects){
        var object = this[objects[o]];
        var subnode = this.node.append(objects[o]).attr("class","particle");
        for (var attr in object){
            var val = object[attr];
            var css_attr = attr.replace("_","-");
            switch(css_attr){
            case 'text':
                subnode.text(val);
                break;
            case 'text-decoration':
                subnode.style(css_attr, val);
                break;
            case 'font-size':
                subnode.style(css_attr, val + "px");
                break;
            default:
                subnode.attr(css_attr, val);
                break;
            }
        }
    }
    return this;
};
