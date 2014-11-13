function StandardLayout () {
    this.name = 'standard';
    this.display_mode = 'nuclide';
    this.getCoordinates = function(protons, neutrons) {
        var coords = [ {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0} ];
        var root_x = (neutrons * scale.element_size) + scale.canvas_margin;
        var root_y = scale.canvas_height - (protons * scale.element_size) - scale.canvas_margin;
        coords[0] = { x: root_x + 2, y: root_y + 2 };
        coords[1] = { x: root_x + scale.element_size - 2, y: root_y + 2 };
        coords[2] = { x: root_x + scale.element_size - 2, y: root_y + scale.element_size - 2 };
        coords[3] = { x: root_x + 2, y: root_y + scale.element_size - 2 };
        return coords;
    };
    this.getRect = function(protons, neutrons) {
        var rect = [ 0, 0, 0, 0 ];
        var root_x = this.getX(protons, neutrons);
        var root_y = this.getY(protons, neutrons);
        var rect = [ root_x - Math.floor(scale.nuclide_size/2), root_y - Math.floor(scale.nuclide_size/2), scale.nuclide_size, scale.nuclide_size ];
        return rect;
    };
    this.getHitRect = function(protons, neutrons) {
        var min_rect = this.getRect(protons, elements[protons].min_neutrons);
        var max_rect = this.getRect(protons, elements[protons].max_neutrons);
        var width    = max_rect[0] - min_rect[0] + scale.nuclide_margin + scale.nuclide_size;
        var rect = [ min_rect[0], min_rect[1], width, scale.nuclide_size ];
        return rect;
    };
    this.getX = function(protons, neutrons){
        return (neutrons * scale.nuclide_size) + ((neutrons-1) * scale.nuclide_margin) + scale.canvas_margin;
    };
    this.getY = function(protons, neutrons){
        return (scale.canvas_height - 100) - ((protons * scale.nuclide_size) + ((protons-1) * scale.nuclide_margin) + scale.canvas_margin);
    };
    this.isShown = function(protons, neutrons){
        return true;
    }
}

function PeriodicLayout () {
    this.name = 'periodic';
    this.display_mode = 'element';
    this.getCoordinates = function(protons, neutrons) {
        var coords = [ {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0} ];
        element = elements[protons];
        var root_x = this.getX(element);
        var root_y = this.getY(element);
        var radius = scale.element_size/2;
        coords[0] = { x: root_x - radius, y: root_y + radius };
        coords[1] = { x: root_x + radius, y: root_y + radius };
        coords[2] = { x: root_x + radius, y: root_y - radius };
        coords[3] = { x: root_x - radius, y: root_y - radius };
        return coords;
    };
    this.getRect = function(protons, neutrons) {
        var rect = [ 0, 0, 0, 0 ];
        var element = elements[protons];
        var root_x = this.getX(element);
        var root_y = this.getY(element);
        var rect = [ root_x - scale.element_size/2, root_y - scale.element_size/2, scale.element_size, scale.element_size ];
        return rect;
    };
    this.getHitRect = function(protons, neutrons) {
        return this.getRect(protons, neutrons);
    };
    this.getX = function(element){
        var temp_x = -9999;
        var group  = element.group > 18 ? element.group - 16 : element.group;
        if (element.group > 0) {
            temp_x = (group * scale.element_size) + ((group-1) * scale.element_margin) + scale.element_size/2;
        }
        return scale.canvas_margin + temp_x;
    };
    this.getY = function(element){
        var temp_y = -9999; 
        var period = element.group > 18 ? element.period + 3 : element.period;
        if (element.group > 0) {
            temp_y = (period * scale.element_size) + ((period-1) * scale.element_margin) + scale.element_size/2;
        }
        return scale.canvas_margin + temp_y;
    };
    this.isShown = function(protons, neutrons){
        var element = elements[protons];
        if (element.nuclides[element.stablest_nuclide_idx].neutrons == neutrons){
            return true;
        } else {
            return false;
        }
    }
}

// Transition class
function Transition () {
    this.percentage = 0;
    this.source = '';
    this.target = '';
    this.interval = null;
    this.framerate  = 24;
    this.step_count = 0;
    this.duration   = 720; // in milliseconds

    this.addTarget = function(layout_name) {
        var layout = layouts[layout_name];
        if (this.source.name != layout.name){
            this.target = layout;
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
        render.renderScreen();
    }

    this.initialize = function(){
        var canvas = document.getElementById("main_canvas")
		    canvas.removeEventListener("mousemove", mouseMoveListener, false);
		    canvas.removeEventListener("mouseup", mouseUpListener, false);
        this.percentage = 0.1;
        this.step_count = 2;
        this.interval = setInterval( function(){ transition.stepInterval() }, Math.round(this.duration / this.framerate) );
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

    this.isShown = function(protons, neutrons){
        if (this.percentage != 0){
            if (elements[protons].nuclides[elements[protons].stablest_nuclide_idx].neutrons == neutrons){
                return true;
            } else {
                return false;
            }
        } else {
            return this.source.isShown(protons, neutrons);
        }
    };

    this.blend = function(source_value, target_value){
        source_muxed = source_value * (1 - this.percentage);
        target_muxed = target_value * this.percentage
        return Math.round(source_muxed + target_muxed);
    };

    this.getRect = function(protons, neutrons) {
        if (this.percentage == 0){
            return this.source.getRect(protons, neutrons);
        } else {
            var rect = [ 0, 0, 0, 0 ];
            var source_rect = this.source.getHitRect(protons, neutrons);
            var target_rect = this.target.getHitRect(protons, neutrons);
            for (i = 0; i < 4; i++) {
                rect[i] = this.blend(source_rect[i], target_rect[i]);
            }
            return rect;
        }
    };

}
