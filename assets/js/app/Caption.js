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
        width: null,
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

// Maximum line width in the same units as x, y, and line_height (null for no automatic wrapping)
Caption.prototype.width = function(value){
    if (typeof value == "undefined"){
        return this.properties.width;
    } else {
        this.properties.width = (value == null ? null : parseFloat(value));
        return this;
    }
};

// Render the caption text object as a child of the provided selector
Caption.prototype.appendTo = function(selector){

    // Parse text into tspans array, inserting line breaks to fit the width if one is set
    var text = (this.properties.width == null) ? this.properties.text : this.wrap(selector);
    this.properties.tspans = this.parse(text);

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
                        display.next_element = element.protons;
                        questions.call('what_is_element');
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
                        display.next_element = nuclide.protons;
                        questions.call('what_is_element');
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

// Private method to return the caption text with [br] added wherever a word would otherwise run
// past this.properties.width. Words are measured as rendered (emphasis, sub/superscript) in the
// provided selector. Existing [br] elements are kept and start a new line.
Caption.prototype.wrap = function(selector){
    var max = this.properties.width * display.scale;
    var measurements = {};
    var measure = function(text, classes){
        var key = classes + "|" + text;
        if (!(key in measurements)){
            var node = selector.append("tspan").text(text);
            if (classes.length){ node.attr("class", classes); }
            measurements[key] = node.node().getComputedTextLength();
            node.remove();
        }
        return measurements[key];
    };

    var out = '';
    var line_w = 0;       // width of the current line so far
    var word = '';        // markup for the word being accumulated (tags attach to adjacent words)
    var word_w = 0;
    var word_state = null;
    var space = null;     // whitespace between the previous word and the word being accumulated
    var emphasis = null;
    var position = false;
    var mouse = null;

    // Close any markup still open at a break and reopen it on the next line (a [br] starts a fresh tspan)
    var lineBreak = function(state){
        var close = '', open = '';
        if (state.mouse == 'repo'){ close += '[repo]'; open = '[repo]' + open; }
        if (state.emphasis != null){ close += '[' + state.emphasis + ']'; open = '[' + state.emphasis + ']' + open; }
        return close + '[br]' + open;
    };

    var classes = function(){
        return [emphasis, position ? 'small' : null].filter(function(c){ return c != null; }).join(' ');
    };

    var flushWord = function(){
        if (!word.length){ return; }
        if (line_w == 0){
            out += (space == null ? '' : space.text);
            line_w = word_w;
        } else if (line_w + space.w + word_w > max){
            out += lineBreak(word_state);
            line_w = word_w;
        } else {
            out += space.text;
            line_w += space.w + word_w;
        }
        out += word;
        word = '';
        word_w = 0;
        space = null;
    };

    var nodes = this.properties.text.split(/(\[\w+\])/);
    for (var n = 0; n < nodes.length; n++){
        var node = nodes[n];
        if (node == ''){ continue; }
        if (/^\[\w+\]$/.test(node)){
            if (node == '[br]'){
                flushWord();
                out += (space == null ? '' : space.text) + node;
                space = null;
                line_w = 0;
                continue;
            }
            if (!word.length){ word_state = { emphasis: emphasis, mouse: mouse }; }
            switch (node){
            case '[em1]':
            case '[em2]':
            case '[em3]':
            case '[em4]':
            case '[emi]':
                emphasis = (emphasis == null ? node.slice(1,4) : null);
                break;
            case '[sub]':
            case '[sup]':
            case '[sml]':
                position = !position;
                break;
            case '[q]':
            case '[link]':
            case '[repo]':
                mouse = (mouse == null ? node.slice(1,-1) : null);
                break;
            }
            word += node;
        } else if (position || mouse == 'q' || mouse == 'link'){
            // Never break inside subscripts, superscripts, question links, or element links
            if (!word.length){ word_state = { emphasis: emphasis, mouse: mouse }; }
            word += node;
            word_w += measure(mouse == 'q' ? node.split("|")[0] : node, classes());
        } else {
            var parts = node.split(/( +)/);
            for (var p = 0; p < parts.length; p++){
                var part = parts[p];
                if (part == ''){ continue; }
                if (/^ +$/.test(part)){
                    flushWord();
                    var space_w = (measure("x x", classes()) - measure("xx", classes())) * part.length;
                    space = (space == null ? { text: part, w: space_w } : { text: space.text + part, w: space.w + space_w });
                } else {
                    if (!word.length){ word_state = { emphasis: emphasis, mouse: mouse }; }
                    word += part;
                    word_w += measure(part, classes());
                }
            }
        }
    }
    flushWord();
    out += (space == null ? '' : space.text);
    return out;
};

// Private method to parse text (default this.propteries.text) into this.properties.tspan array
Caption.prototype.parse = function(text){
    var tspans = [];
    var nodes = (typeof text == "string" ? text : this.properties.text).split(/(\[\w+\])/);
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
        case '[em4]':
        case '[emi]':
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
                    tspans[t].class.push("href");
                    tspans[t].mouse = "link";
                } else {
                    tspans.push({ text: '', class: ["href"], mouse: "link", title: null, x: null, y: null, dy: null });
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
    if (tspans[tspans.length-1].text == ''){ tspans.pop(); }
    return tspans;
};