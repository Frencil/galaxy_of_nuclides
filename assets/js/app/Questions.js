"use strict";

/*
   Define Questions Class
*/

var Questions = function(){
    this.attempt = null;
    this.current = null;
    this.next = null;
    this.cache = {};
};

Questions.prototype.titleToID = function(question_title){
    return question_title.toLowerCase().replace("?","").replace(/\W/g,"_");
};

Questions.prototype.call = function(question_id, callback){
    var questions = this;
    if (typeof callback == 'undefined'){
        callback = function(){ questions.finalize(); };
    }
    if (question_id != this.titleToID(question_id)){
        console.log("Attempted to call invalid question ID: " + question_id);
        callback();
    }
    // Interrupt all in-progress transitions and null out the next question
    d3.select("#stage").selectAll("*").interrupt();
    this.next = null;
    // Fetch the question
    (function(callback){
        questions.fetch(question_id, function(){
            // Unload the current and load the next question
            questions.unloadCurrent();
            questions.current.halt_animation = true;
            d3.timer(function(){
                // Show or hide full data sets as needed
                var pt = (typeof questions.next.periodic_table == 'object');
                var cn = (typeof questions.next.chart_of_nuclides == 'object');
                var ig = (typeof questions.next.isotopes_grid == 'object');
                if (!pt){ display.hideDataset('element'); }
                if (!cn){ display.hideDataset('nuclide'); }
                if (pt){ display.showDataset('element', questions.next.periodic_table); }
                if (cn){ display.showDataset('nuclide', questions.next.chart_of_nuclides); }
                if (ig){ display.showDataset('nuclide', questions.next.isotopes_grid); }
                // Show title, captions, components, questions, ans scale
                display.setTitle();
                display.setCaptions();
                display.setComponents();
                display.setQuestions();
                display.setScale();
                // Call the next question's load() method to define specifics
                display.fadeIn(d3.select("#specifics"), 500);
                questions.next.load(function(){
                    callback();
                    if (typeof questions.current.animate == "function"){
                        questions.current.halt_animation = false;
                        questions.current.animate();
                    }
                    if (typeof questions.current.onload == "function"){
                        questions.current.onload();
                    }
                });
                return true
            }, 1000 * display.transition_speed);
        });
    })(callback);
};

Questions.prototype.fetch = function(question_id, callback){
    if (question_id != this.titleToID(question_id)){
        console.log("Attempted to fetch invalid question ID: " + question_id);
        callback();
    }
    if (typeof this.cache[question_id] != "undefined"){
        this.next = this.cache[question_id];
        callback();
    } else {
        if (question_id != '404'){ this.attempt = question_id; }
        (function(questions, question_id, callback){
            var src = 'assets/js/questions/' + question_id + '.js?t=' + new Date().getTime();
            var head = document.getElementsByTagName("head")[0] || document.documentElement;
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = src;
            script.onload = function(){
                questions.next = questions.cache[question_id];
                callback();
            }
            script.onerror = function(){
                questions.next = questions.cache["404"];
                callback();
            }
            head.appendChild(script);
        })(this, question_id, callback);
    }
};

Questions.prototype.unloadCurrent = function(){
    display.highlightElement(null);
    if (display.transition_speed > 0){
        display.fadeOut(d3.select("#captions"), 500);
        display.fadeOut(d3.select("#specifics"), 500);
        display.fadeOut(d3.select("#components"), 500);
        d3.timer(function(){
            d3.select("#floating_element_highlightbox").style("display","none");
            d3.select("#captions").selectAll("*").remove();
            d3.select("#specifics").selectAll("*").remove();
            d3.select("#components").selectAll("g.component").style("display", "none");
            return true;
        }, 500 * display.transition_speed);
    } else {
        d3.select("#captions").selectAll("*").remove();
        d3.select("#specifics").selectAll("*").remove();
        d3.select("#components").selectAll("g.component").style("display", "none");
    }
};

Questions.prototype.finalize = function(skip_url_push){
    this.current = this.next;
    this.next = null;
    if (display.next_element != null){
        display.current_element = display.next_element;
        display.next_element = null;
    }
    if (typeof skip_url_push == 'undefined'){
        this.pushUrl();
    }
};

// Push URL and history for enabled browsers
Questions.prototype.pushUrl = function(){
    if (Modernizr.history){
        var id = this.titleToID(this.current.title);
        var title = this.current.title;
        var hash = '';
        if (this.current.element_specific && display.current_element > 0){
            id = 'what_is_element';
            title = 'Nuclides.org - What is ' + matter.elements[display.current_element].name + '?';
            hash = '#' + matter.elements[display.current_element].name;
        }
        if (typeof this.current.is404 != "undefined"){
            id = this.attempt;
            title = 'Nuclides.org - 404 - Page Not Found';
        }
        var state = { question: id, elements: display.current_element };
        var uri = "?" + id + hash;
        history.pushState(state, title, uri);
        // Track the pageview in piwik
        _paq.push(['trackPageView', title]);
    }
};

Questions.prototype.parseUrl = function(){
    var ret = { id: null, element: null };
    if (window.location.search.length > 1){
        ret.id = window.location.search.slice(1);
        if (window.location.hash.length > 1){
            var hash = window.location.hash.slice(1);
            if (ret.id == 'what_is_element' && typeof matter.element_name_map[hash] == "object"){
                ret.element = matter.element_name_map[hash].protons;
            }
        }
    }
    return ret;
};
