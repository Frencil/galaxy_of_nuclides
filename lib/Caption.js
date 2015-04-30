"use strict";

/*
   Define Caption Class

   Captions are blocks of artbitrarily long marked-up text. Rendering text as a caption
   allows for markup to be parsed in order to gracefully do line wrapping, positioning,
   emphasis, and linking.
*/

var Caption = function(){

    this.properties = {
        text: '',
        x: 0,
        y: 0,
        line_height: 1,
        tspans: []
    };

};

Caption.prototype.text = function(value){
    if (typeof value == "undefined"){
        return this.properties.text;
    } else {
        this.properties.text = value.toString();
        return this;
    }
}

Caption.prototype.x = function(value){
    if (typeof value == "undefined"){
        return this.properties.x;
    } else {
        this.properties.x = parseFloat(value);
        return this;
    }
};

Caption.prototype.y = function(value){
    if (typeof value == "undefined"){
        return this.properties.y;
    } else {
        this.properties.y = parseFloat(value);
        return this;
    }
};

Caption.prototype.lineHeight = function(value){
    if (typeof value == "undefined"){
        return this.properties.line_height;
    } else {
        this.properties.line_height = parseFloat(value);
        return this;
    }
};

// Render the caption text object as a child of the provided selector
Caption.prototype.appendTo = function(selector){

    // Parse text into tspans array
    this.properties.tspans = this.parse();

    // Remove all tspans from the selector
    selector.selectAll("tspan").remove();

    // Render new tspans to the selector
    for (var t in this.properties.tspans){
        var tspan = this.properties.tspans[t];
        if (tspan.class[1] != null){ tspan.class[1] = "small"; }
        var classes = tspan.class.join(" ").trim();
        var node = selector.append("tspan").text(tspan.text);
        if (classes.length){ node.attr("class", classes); }
        if (tspan.x != null){ node.attr("x", tspan.x); }
        if (tspan.y != null){ node.attr("y", tspan.y); }
        if (Math.abs(tspan.dy) > 0){ node.attr("dy", tspan.dy); }
        if (tspan.mouse == "repo"){
            node.on("click", function(){
                document.getElementById("link_repo_contrib").click();
            });
        } else if (tspan.mouse == "link"){
            var element = matter.element_name_map[tspan.text];
            var nuclide = matter.nuclide_name_map[tspan.text];
            if (typeof element != "undefined"){
                (function(tspan, node, element){
                    node.append("title").text("What is " + tspan.text + "?");
                    node.on("mouseover", function(){
                        display.highlightElement(element, true);
                    }).on("mouseout", function(){
                        display.highlightElement(element, false);
                    }).on("click", function(){
                        var id = questions.titleToId("What is " + tspan.text + "?");
                        questions.call(id);
                    });
                })(tspan, node, element);
            } else if (typeof nuclide != "undefined"){
                (function(tspan, node, nuclide){
                    node.append("title").text("What is " + tspan.text + "?");
                    node.on("mouseover", function(){
                        display.highlightNuclide(nuclide, true);
                    }).on("mouseout", function(){
                        display.highlightNuclide(nuclide, false);
                    }).on("click", function(){
                        var id = questions.titleToId("What is " + tspan.text + "?");
                        questions.call(id);
                    });
                })(tspan, node, nuclide);
            }
        } else if (tspan.mouse == "q"){
            (function(tspan, node){
                node.append("title").text(tspan.title);
                node.on("click", function(){
                    var id = questions.titleToID(tspan.title);
                    questions.call(id);
                });
            })(tspan, node);
        }
    }

    return true;
};

// Private method to parse this.propteries.text into this.properties.tspan array
Caption.prototype.parse = function(){
    var tspans = [];
    var nodes = this.properties.text.split(/(\[\w+\])/);
    var emphasis = null;
    var position = null;
    var dy_adjustments = { 'sup': -1 * display.scale,
                           'sub': 0.5 * display.scale,
                           'sml': 0 };
    var n = 0, t = 0;
    var x = this.properties.x * display.scale;
    var y = (this.properties.y + this.properties.line_height) * display.scale;
    var lh = this.properties.line_height * display.scale
    tspans.push({ text: '', class: [], mouse: null, title: null, x: x, y: y, dy: null });
    while (n < nodes.length){
        switch (nodes[n]){
            // Line breaks
        case '[br]':
            var dy = lh;
            if (t > 0){
                if (tspans[t-1].class[1] != null){
                    dy += -1 * dy_adjustments[tspans[t-1].class[1]];
                }
            }
            tspans.push({ text: '', class: [], mouse: null, title: null, x: x, y: null, dy: dy,  });
            t++;
            break;
            // Emphasis
        case '[em1]':
        case '[em2]':
        case '[em3]':
            var node_class = nodes[n].slice(1,4);
            if (emphasis == null){
                emphasis = node_class;
                if (!tspans[t].text.length){
                    tspans[t].class[0] = emphasis;
                } else {
                    tspans.push({ text: '', class: [emphasis, position], title: null, mouse: null, x: null, y: null, dy: null });
                    t++;
                }
            } else {
                emphasis = null;
                if (!tspans[t].text.length){
                    tspans[t].class[0] = null;
                } else {
                    tspans.push({ text: '', class: [emphasis, position], title: null, mouse: null, x: null, y: null, dy: null });
                    t++;
                }
            }
            break;
            // Subscript / Superscript / Small
        case '[sub]':
        case '[sup]':
        case '[sml]':
            var node_class = nodes[n].slice(1,4);
            if (position == null){
                position = node_class;
                var dy = dy_adjustments[position];
                if (!tspans[t].text.length){
                    tspans[t].class[1] = node_class;
                    tspans[t].dy += dy;
                } else {
                    tspans.push({ text: '', class: [emphasis, position], title: null, mouse: null, x: null, y: null, dy: dy });
                    t++;
                }
            } else {
                var dy = -1 * dy_adjustments[position];
                position = null;
                if (!tspans[t].text.length){
                    tspans[t].class[1] = null;
                    tspans[t].dy += dy;
                } else {
                    tspans.push({ text: '', class: [emphasis, position], title: null, mouse: null, x: null, y: null, dy: dy });
                    t++;
                }
            }
            break;
            // Question links
        case '[q]':
            if (tspans[t].mouse == null){
                if (tspans[t].text.length == 0){
                    tspans[t].mouse = "q";
                    tspans[t].class.push("href");
                } else {
                    tspans.push({ text: '', class: ["href"], mouse: "q", title: null, x: null, y: null, dy: null });
                    t++;
                }
            } else {
                tspans.push({ text: '', class: [], mouse: null, title: null, x: null, y: null, dy: null });
                t++;
            }
            break;
            // Links (requires match to matter.element_name_map or matter.nuclide_name_map)
        case '[link]':
            if (tspans[t].mouse == null){
                if (tspans[t].text.length == 0){
                    tspans[t].class.push("link");
                    tspans[t].mouse = "link";
                } else {
                    tspans.push({ text: '', class: ["link"], mouse: "link", title: null, x: null, y: null, dy: null });
                    t++;
                }
            } else {
                tspans.push({ text: '', class: [], mouse: null, x: null, title: null, y: null, dy: null });
                t++;
            }
            break;
            // Repo links (common while many element info blocks remain unwritten)
        case '[repo]':
            if (tspans[t].mouse == null){
                if (tspans[t].text.length == 0){
                    tspans[t].class.push("href");
                    tspans[t].mouse = "repo";
                } else {
                    tspans.push({ text: '', class: ["href"], mouse: "repo", title: null, x: null, y: null, dy: null });
                    t++;
                }
            } else {
                tspans.push({ text: '', class: [], mouse: null, title: null, x: null, y: null, dy: null });
                t++;
            }
            break;
        default:
            if (tspans[t].mouse == 'q'){
                var text = nodes[n].split("|");
                tspans[t].text  = text[0];
                tspans[t].title = text[1];
            } else {
                tspans[t].text += nodes[n];
            }
            break;
        }
        n++;
    }
    return tspans;
};