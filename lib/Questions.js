"use strict";

/*
   Define Questions Class
*/

var Questions = function(){
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
            if (questions.next == null){
                console.log("Error - unable to fetch question: " + question_id);
                callback()
            } else {
                // Unload the current and load the next question
                questions.unloadCurrent();
                d3.timer(function(){
                    // Set Title
                    d3.select("#question_title").text(questions.next.title);
                    // Show or hide full data sets as needed
                    var pt = (typeof questions.next.periodic_table == 'object');
                    var cn = (typeof questions.next.chart_of_nuclides == 'object');
                    if (!pt){ display.hidePeriodicTable(); }
                    if (!cn){ display.hideChartOfNuclides(); }
                    if (pt){ display.showPeriodicTable(questions.next.periodic_table); }
                    if (cn){ display.showChartOfNuclides(questions.next.chart_of_nuclides); }
                    // Show captions, components, and specifics
                    display.showCaptions();
                    display.showComponents();
                    display.fadeIn(d3.select("#specifics"), 500);
                    // Set the correct scale
                    if (questions.current.scale != questions.next.scale){
                        display.fadeOut(d3.select("#key_" + questions.current.scale + "_scale"), 500);
                        display.fadeIn(d3.select("#key_" + questions.next.scale + "_scale"), 500);
                    }
                    // Call the next question's load() method
                    questions.next.load(callback);
                    return true;
                }, 1000 * display.transition_speed);
            }
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
        var questions = this;
        (function(question_id, callback){
            questions.loadScript('questions/' + question_id + '.js', function(){
                questions.next = questions.cache[question_id];
                callback();
            });
        })(question_id, callback);
    }
};

Questions.prototype.loadScript = function(src, callback){
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.onload = callback;
    script.onreadystatechange = function() {
        if (this.readyState == 'complete') { callback(); }
    }
    head.appendChild(script);
};

Questions.prototype.unloadCurrent = function(){
    if (display.transition_speed > 0){
        display.fadeOut(d3.select("#captions"), 500);
        display.fadeOut(d3.select("#specifics"), 500);
        display.fadeOut(d3.select("#components"), 500);
        d3.timer(function(){
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

Questions.prototype.finalize = function(){
    this.current = this.next;
    this.next = null;
    display.showQuestions(this.current.questions);
};

/*
    // Call up a question, as in load it into the interface start-to-finish
    call: function(question_id, callback){
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
                if (questions.next == null){
                    console.log("Error - unable to fetch question: " + question_id);
                    callback()
                } else {
                    // Unload the current and load the next question
                    questions.unloadCurrent();
                    d3.timer(function(){
                        // Set Title
                        d3.select("#question_title").text(questions.next.title);
                        // Show or hide full data sets as needed
                        var pt = (typeof questions.next.periodic_table == 'object');
                        var cn = (typeof questions.next.chart_of_nuclides == 'object');
                        if (!pt){ display.hidePeriodicTable(); }
                        if (!cn){ display.hideChartOfNuclides(); }
                        if (pt){ display.showPeriodicTable(questions.next.periodic_table); }
                        if (cn){ display.showChartOfNuclides(questions.next.chart_of_nuclides); }
                        // Show captions, components, and specifics
                        display.showCaptions();
                        display.showComponents();
                        display.fadeIn(d3.select("#specifics"), 500);
                        // Set the correct scale
                        if (questions.current.scale != questions.next.scale){
                            display.fadeOut(d3.select("#key_" + questions.current.scale + "_scale"), 500);
                            display.fadeIn(d3.select("#key_" + questions.next.scale + "_scale"), 500);
                        }
                        // Call the next question's load() method
                        questions.next.load(callback);
                        return true;
                    }, 1000 * display.transition_speed);
                }
            });
        })(callback);
    },
    // Fetch a question (either from server or cache) and load into this.next
    fetch: function(question_id, callback){
        if (question_id != this.titleToID(question_id)){
            console.log("Attempted to fetch invalid question ID: " + question_id);
            callback();
        }
        if (typeof this.cache[question_id] != "undefined"){
            this.next = this.cache[question_id];
            callback();
        } else {
            (function(question_id, callback){
                questions.loadScript('questions/' + question_id + '.js', function(){
                    questions.next = questions.cache[question_id];
                    callback();
                });
            })(question_id, callback);
        }
    },
    // Load a script from the server and plop it into the DOM
    loadScript: function(src, callback) {
        var head = document.getElementsByTagName("head")[0] || document.documentElement;
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = callback;
        script.onreadystatechange = function() {
            if (this.readyState == 'complete') { callback(); }
        }
        head.appendChild(script);
    },
    // Unload the current question
    unloadCurrent: function(){
        if (display.transition_speed > 0){
            display.fadeOut(d3.select("#captions"), 500);
            display.fadeOut(d3.select("#specifics"), 500);
            display.fadeOut(d3.select("#components"), 500);
            d3.timer(function(){
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
    },
    // Complete the transition to a new question
    finalize: function(){
        questions.current = questions.next;
        questions.next = null;
        display.showQuestions(questions.current.questions);
    }
*/