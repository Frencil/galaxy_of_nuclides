// Render object and methods
function RenderClass(){

    this.hit_rect = null

	  this.renderElements = function() {
        context.shadowBlur = 0;
        this.hit_rect = null;
        for (e = 0; e < elements.length; e++) {
            element = elements[e];
            for (n = 0; n < element.nuclides.length; n++){
                nuclide = element.nuclides[n];
                if (!transition.isShown(nuclide.protons,nuclide.neutrons)){
                    continue;
                }
                rect = transition.getRect(nuclide.protons,nuclide.neutrons);
                context.fillStyle   = nuclide.getColor(1);
                context.strokeStyle = nuclide.getColor(0.5);
                if (transition.percentage == 0){
                    potential_hit_rect = transition.source.getHitRect(nuclide.protons,nuclide.neutrons);
                    if (render.hitTest(potential_hit_rect)){
                        this.hit_rect = potential_hit_rect;
                        mouse.over_protons  = nuclide.protons;
                        mouse.over_neutrons = nuclide.neutrons;
                    }
                }
                context.lineWidth = 2;
                context.beginPath();
                context.rect(rect[0], rect[1], rect[2], rect[3]);
                context.fill();
                context.stroke();
            }
            context.fillStyle = "hsla(0,0%,0%,0.85)";
            render.renderLabel(element, rect);
        }
    };

    this.renderLabel = function(element, rect) {
        if (transition.percentage != 0){ return; }
        context.font = (element.symbol.length == 3 ? scale.element_text_size - scale.element_margin : scale.element_text_size) + "px Arial";
        var text_x = rect[0] + scale.element_margin;
        var text_y = rect[1] + scale.element_text_size + scale.element_margin;
        context.fillText(element.symbol, text_x, text_y);
    };

    this.renderHitBox = function() {
        if (this.hit_rect){
            context.shadowColor = "white";
            context.shadowBlur  = 10;
            context.fillStyle   = "hsla(0,0%,100%,0.9)";
            context.strokeStyle = "hsla(0,0%,100%,0.9)";
            context.lineWidth   = 1;
            context.beginPath();
            context.rect(this.hit_rect[0], this.hit_rect[1], this.hit_rect[2], this.hit_rect[3]);
            context.stroke();
        }
    };

    this.renderScale = function() {
        context.shadowBlur = 0;
        var fill_gradient = context.createLinearGradient(30,0,770,0);
        fill_gradient.addColorStop(0,palette.getColor(0,1));
        fill_gradient.addColorStop(0.49,palette.getColor(0.49,1));
        fill_gradient.addColorStop(0.51,palette.getColor(0.51,1));
        fill_gradient.addColorStop(1,palette.getColor(1,1));
        context.fillStyle = fill_gradient;
        var stroke_gradient = context.createLinearGradient(30,0,770,0);
        stroke_gradient.addColorStop(0,palette.getColor(0,0.5));
        stroke_gradient.addColorStop(0.49,palette.getColor(0.49,0.5));
        stroke_gradient.addColorStop(0.51,palette.getColor(0.51,0.5));
        stroke_gradient.addColorStop(1,palette.getColor(1,0.5));
        context.strokeStyle = stroke_gradient;
        context.beginPath();
        context.rect(30,500,740,40);
        context.fill();
        context.stroke();
    };

    this.renderScreen = function() {
		    context.fillStyle = "#000000";
		    context.fillRect(0,0,canvas.width,canvas.height);
        
        mouse.over_protons  = -1;
        mouse.over_neutrons = -1;
        
        // The old way
		    this.renderElements();
        
        this.renderScale();
        this.renderHitBox();

        // The new way!
        canvas.style.cursor = "";
        for (p in panels){
            panel = panels[p];
            panel.setCoords();
            if (panel.a > 0){
                panel.render();
            }
        }

    };

	  this.hitTest = function(rect) {
		    return (mouse.current_x >= rect[0] && mouse.current_x <= rect[0] + rect[2]) &&
               (mouse.current_y >= rect[1] && mouse.current_y <= rect[1] + rect[3]);
	  };

}

var render = new RenderClass();
