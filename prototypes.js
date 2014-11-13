// Define a prototpye "panel" - any independent graphic, static or interactive.
// A main menu button is an example of an interactive panel. All panels have geometric
// coordinates and an alpha value, along with methods to update their coordinates
// and render themselves.
function Panel() {
    this.id = '';
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.a = 0;
    this.mouse_over = false;
    this.setCoords = function() {
        this.a = 0;
    };
    this.render = function() {
        if (this.a){
            console.log("Error: can't render a protoype panel.");
        }
    };
    this.click = function() {
        console.log("prototype: " + this.id);
    };
}

// Nuclide View
function NuclideView () {
    this.name = 'nuclide';
    this.nuclide_size   = 4;
    this.nuclide_margin = 0;
    this.nuclide_left   = 12;
    this.nuclide_top    = 36;
    this.element_size   = 12;
    this.element_margin = 2;
    this.element_left   = 440;
    this.element_top    = 300;
    this.getElementRect = function(protons) {
        var rect = [ 0, 0, 0, 0, true ];
        var element = elements[protons];
        var root_x = this.getElementX(element);
        var root_y = this.getElementY(element);
        var rect = [ root_x - this.element_size/2, root_y - this.element_size/2, this.element_size, this.element_size, true ];
        return rect;
    };
    this.getNuclideRect = function(protons, neutrons) {
        var rect = [ 0, 0, 0, 0, true ];
        var root_x = this.getNuclideX(protons, neutrons);
        var root_y = this.getNuclideY(protons, neutrons);
        var rect = [ root_x - Math.floor(this.nuclide_size/2), root_y - Math.floor(this.nuclide_size/2), this.nuclide_size, this.nuclide_size, true ];
        return rect;
    };
    this.getNuclideX = function(protons, neutrons){
        return (neutrons * this.nuclide_size) + ((neutrons-1) * this.nuclide_margin) + this.nuclide_left;
    };
    this.getNuclideY = function(protons, neutrons){
        return panels.stage.h - ((protons * this.nuclide_size) + ((protons-1) * this.nuclide_margin) + this.nuclide_top);
    };
    this.getElementX = function(element){
        var temp_x = -9999;
        var group  = element.group > 18 ? element.group - 16 : element.group;
        if (element.group > 0) {
            temp_x = (group * this.element_size) + ((group-1) * this.element_margin) + this.element_size/2;
        }
        return this.element_left + temp_x;
    };
    this.getElementY = function(element){
        var temp_y = -9999; 
        var period = element.group > 18 ? element.period + 3 : element.period;
        if (element.group > 0) {
            temp_y = (period * this.element_size) + ((period-1) * this.element_margin) + this.element_size/2;
        }
        return this.element_top + temp_y;
    };
}

// Periodic View
function PeriodicView () {
    this.name = 'periodic';
    this.element_size = 34;
    this.element_margin = 4;
    this.left = 12;
    this.top = 40;
    this.getElementRect = function(protons) {
        var rect = [ 0, 0, 0, 0, true ];
        var element = elements[protons];
        var root_x = this.getX(element);
        var root_y = this.getY(element);
        var rect = [ root_x - this.element_size/2, root_y - this.element_size/2, this.element_size, this.element_size, true ];
        return rect;
    };
    this.getNuclideRect = function(protons, neutrons) {
        var rect = this.getElementRect(protons);
        rect[4] = false;
        return rect;
    };
    this.getX = function(element){
        var temp_x = -9999;
        var group  = element.group > 18 ? element.group - 16 : element.group;
        if (element.group > 0) {
            temp_x = (group * this.element_size) + ((group-1) * this.element_margin) + this.element_size/2;
        }
        return this.left + temp_x;
    };
    this.getY = function(element){
        var temp_y = -9999; 
        var period = element.group > 18 ? element.period + 3 : element.period;
        if (element.group > 0) {
            temp_y = (period * this.element_size) + ((period-1) * this.element_margin) + this.element_size/2;
        }
        return this.top + temp_y;
    };
}

// Transition prototype
function Transition () {
    this.percentage = 0;
    this.source = '';
    this.target = '';
    this.interval = null;
    this.framerate  = 24;
    this.step_count = 0;
    this.duration   = 720; // in milliseconds

    this.addTarget = function(view_name) {
        var view = panels.stage.views[view_name];
        if (this.source.name != view.name){
            this.target = panels.stage.views[view_name];
        }
        this.initialize();
    };

    this.reset = function(){
        this.percentage = 0;
    };

    this.force = function(){
        this.percentage = 1;
    };

    this.stepTo = function(percentage) {
        this.percentage = Math.max(Math.min(percentage, 1),0);
        if (this.percentage >= 1) {
            this.finalize();
        }
    }

    this.stepInterval = function(){
        this.step_count++;
        var destination = Math.log(this.step_count * (1/this.framerate) * 10) / Math.log(10);        
        this.stepTo(destination);
        renderScreen();
    }

    this.initialize = function(){
        var canvas = document.getElementById("main_canvas")
		    canvas.removeEventListener("mousemove", mouseMoveListener, false);
		    canvas.removeEventListener("mouseup", mouseUpListener, false);
        this.percentage = 0.1;
        this.step_count = 2;
        this.interval = setInterval( function(){ panels.stage.transition.stepInterval() }, Math.round(this.duration / this.framerate) );
    }

    this.finalize = function(){
        var canvas = document.getElementById("main_canvas")
		    canvas.addEventListener("mousemove", mouseMoveListener, false);
		    canvas.addEventListener("mouseup", mouseUpListener, false);
        this.percentage = 0;
        this.source = this.target;
        this.target = null;
        clearInterval(this.interval);
    }

    this.blend = function(source_value, target_value){
        source_muxed = source_value * (1 - this.percentage);
        target_muxed = target_value * this.percentage
        return Math.round(source_muxed + target_muxed);
    };

    this.getElementRect = function(protons) {
        if (this.percentage == 0){
            return this.source.getElementRect(protons);
        } else {
            var rect = [ 0, 0, 0, 0, true ];
            var source_rect = this.source.getElementRect(protons);
            var target_rect = this.target.getElementRect(protons);
            for (i = 0; i < 4; i++) {
                rect[i] = this.blend(source_rect[i], target_rect[i]);
            }
            return rect;
        }
    };

    this.getNuclideRect = function(protons, neutrons) {
        if (this.percentage == 0){
            return this.source.getNuclideRect(protons, neutrons);
        } else {
            var rect = [ 0, 0, 0, 0, true ];
            var source_rect = this.source.getNuclideRect(protons, neutrons);
            var target_rect = this.target.getNuclideRect(protons, neutrons);
            for (i = 0; i < 4; i++) {
                rect[i] = this.blend(source_rect[i], target_rect[i]);
            }
            return rect;
        }
    };

}
