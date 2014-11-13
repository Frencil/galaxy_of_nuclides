// Define master elements array
var elements = new Array();

// Define object for storing numerical limits on the data set (determined at parse)
var limits = {
    min_halflife_exp: 0,
    max_halflife_exp: 0,
    absolute_max_protons: 0,
    absolute_max_neutrons: 0,
    max_neutron_spread: 0,
    min_nuclides_per_element: 0,
    max_nuclides_per_element: 0
};

// Define object for tracking mouse position relative values
var mouse = {
    current_x: -1,
    current_y: -1,
    over: { panel_id: null,
            object_id: null
          },
    hitTest: function(x, y, width, height){
        if (    this.current_x >= x && this.current_x <= x + width
             && this.current_y >= y && this.current_y <= y + height){
            return true;
        } else {
            return false;
        }
    }
};

// We'll keep all panels in one top-level object variable
var panels = {};

// The stage - the main panel where elements and nuclides are displayed in various ways
panels.stage = new Panel();
panels.stage.id = 'stage';
panels.stage.setCoords = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.a = 1;
    this.w = 740;
    this.h = 496;
    this.mouse_over = mouse.hitTest(this.x, this.y, this.w, this.h);
    if (this.mouse_over){ mouse.over.panel_id = this.id; }
};
panels.stage.render = function() {
    context.shadowBlur = 0;
    for (e = 0; e < elements.length; e++) {
        element = elements[e];
        rect = this.transition.getElementRect(element.protons);
        if (rect[2] && rect[3] && rect[4] && element.base_color.a){
            fill_color = { h: element.base_color.h,  s: element.base_color.s, l: element.base_color.l, a: element.base_color.a };
            stroke_color = { h: element.base_color.h,  s: element.base_color.s, l: element.base_color.l, a: element.base_color.a };
            if (!this.transition.percentage && mouse.hitTest(rect[0], rect[1], rect[2], rect[3])){
                mouse.over_object = element;
                fill_color.l *= 1.25;
                mouse.style = "pointer";
            } else {
                stroke_color.l *= 0.5;
            }
            context.fillStyle = hsla(fill_color);
            context.strokeStyle = hsla(stroke_color);
            context.lineWidth = 1;
            context.beginPath();
            context.rect(rect[0], rect[1], rect[2], rect[3]);
            context.fill();
            context.stroke();
        }
        for (n = 0; n < element.nuclides.length; n++){
            nuclide = element.nuclides[n];
            rect = this.transition.getNuclideRect(nuclide.protons,nuclide.neutrons);
            if (rect[2] && rect[3] && rect[4] && nuclide.base_color.a){
                fill_color = { h: nuclide.base_color.h,  s: nuclide.base_color.s, l: nuclide.base_color.l, a: nuclide.base_color.a };
                stroke_color = { h: nuclide.base_color.h,  s: nuclide.base_color.s, l: nuclide.base_color.l, a: nuclide.base_color.a };
                if (!this.transition.percentage && mouse.hitTest(rect[0], rect[1], rect[2], rect[3])){
                    mouse.over_object = nuclide;
                    fill_color.l *= 1.25;
                    mouse.style = "pointer";
                } else {
                    stroke_color.l *= 0.5;
                }
                context.fillStyle = hsla(fill_color);
                context.strokeStyle = hsla(stroke_color);
                context.lineWidth = 1;
                context.beginPath();
                context.rect(rect[0], rect[1], rect[2], rect[3]);
                context.fill();
                context.stroke();
            }
        }
        //context.fillStyle = "hsla(0,0%,0%,0.85)";
        //render.renderLabel(element, rect);
    }

}

// The main logo panel
panels.logo = new Panel();
panels.logo.id = 'logo';
panels.logo.setCoords = function() {
    this.x = 740;
    this.y = 0;
    this.z = 0;
    this.a = 1;
    this.w = 220;
    this.h = 120;
    this.mouse_over = mouse.hitTest(this.x, this.y, this.w, this.h);
    if (this.mouse_over){ mouse.over.panel_id = this.id; }
};
panels.logo.render = function() {
    context.shadowColor = "white";
    context.shadowBlur  = 10;
    context.fillStyle   = "hsla(0,0%,100%,1)";
    context.font = "36px Arial";
    context.fillText("Galaxy of", this.x + 24, this.y + 48);
    context.fillText("Nuclides", this.x + 24, this.y + 88);
};

// Panels for the three main nav buttons and their highlight.
// All have the same render function, so define that independently.
renderViewButton = function() {
    // Backing rectangle
    context.shadowBlur  = 0;
    context.fillStyle   = this.mouse_over ? "hsla(190,31%,52%,1)" : "hsla(206,30%,28%,1)";
    context.strokeStyle = "hsla(0,0%,100%,1)";
    context.lineWidth   = 2;
    context.beginPath();
    context.rect(this.x, this.y, this.w, this.h);
    context.stroke();
    context.fill();
    // Icon
    icon = new Image() 
    icon.src = this.icon;
    context.drawImage(icon, this.x + 12, this.y + 10);
    // Label
    context.shadowColor = "white";
    context.shadowBlur  = 10;
    context.fillStyle   = "hsla(0,0%,100%,1)";
    context.font = "18px Arial";
    context.fillText(this.name, this.x + 80, this.y + 23);
    context.fillText("View", this.x + 80, this.y + 47);
};

// Period View button
panels.periodic_view_button = new Panel();
panels.periodic_view_button.id = 'periodic_view_button';
panels.periodic_view_button.name = "Periodic";
panels.periodic_view_button.icon = "assets/icon_periodic_view.png";
panels.periodic_view_button.setCoords = function() {
    this.x = 760;
    this.y = 128;
    this.z = 0;
    this.a = 100;
    this.w = 180;
    this.h = 56;
    this.mouse_over = mouse.hitTest(this.x, this.y, this.w, this.h);
    if (this.mouse_over){
        mouse.over.panel_id = this.id;
        mouse.style = "pointer";
    }
};
panels.periodic_view_button.render = renderViewButton;
panels.periodic_view_button.click = function() {
    if (!panels.stage.transition.percentage && panels.stage.transition.source.name != 'periodic'){
        panels.stage.transition.addTarget("periodic");
    }
}

// Nuclide View button
panels.nuclide_view_button = new Panel();
panels.nuclide_view_button.id = 'nuclide_view_button';
panels.nuclide_view_button.name = "Nuclide";
panels.nuclide_view_button.icon = "assets/icon_nuclide_view.png";
panels.nuclide_view_button.setCoords = function() {
    this.x = 760;
    this.y = 192;
    this.z = 0;
    this.a = 100;
    this.w = 180;
    this.h = 56;
    this.mouse_over = mouse.hitTest(this.x, this.y, this.w, this.h);
    if (this.mouse_over){
        mouse.over.panel_id = this.id;
        mouse.style = "pointer";
    }
};
panels.nuclide_view_button.render = renderViewButton;
panels.nuclide_view_button.click = function() {
    if (!panels.stage.transition.percentage && panels.stage.transition.source.name != 'nuclide'){
        panels.stage.transition.addTarget("nuclide");
    }
}

// Element View button
panels.element_view_button = new Panel();
panels.element_view_button.id = 'element_view_button';
panels.element_view_button.name = "Element";
panels.element_view_button.icon = "assets/icon_element_view.png";
panels.element_view_button.setCoords = function() {
    this.x = 760;
    this.y = 256;
    this.z = 0;
    this.a = 100;
    this.w = 180;
    this.h = 56;
    this.mouse_over = mouse.hitTest(this.x, this.y, this.w, this.h);
    if (this.mouse_over){
        mouse.over.panel_id = this.id;
        mouse.style = "pointer";
    }
};
panels.element_view_button.render = renderViewButton;



/*
panels.view_button_highlight = new Panel();

panels.time_slider = new Panel();
*/


// Define scales - discrete dimensions for the canvas that have
// a consistent aspect ratio (96x128) and result in rendering
// elements and nuclides with whole numbers of pixels
var scales = [
    { canvas_width: 960, canvas_height: 576, canvas_margin: 20,
      element_size: 34, element_margin: 5, element_text_size: 18,
      nuclide_size: 2, nuclide_margin: 2 }
];

var palette = {
    scheme_low:  { h: 200, s_min: 75, s_max: 0, l_min: 35, l_max: 75 },
    scheme_high: { h: 30, s_min: 0, s_max: 70, l_min: 70, l_max: 40 },
    getColor: function(normalized_value, alpha){
        if (normalized_value < 0.5){
            return { h: this.scheme_low.h,
                     s: map_range(normalized_value, 0, 0.5, this.scheme_low.s_min, this.scheme_low.s_max),
                     l: map_range(normalized_value, 0, 0.5, this.scheme_low.l_min, this.scheme_low.l_max),
                     a: alpha };
        } else {
            return { h: this.scheme_high.h,
                     s: map_range(normalized_value, 0.5, 1, this.scheme_high.s_min, this.scheme_high.s_max),
                     l: map_range(normalized_value, 0.5, 1, this.scheme_high.l_min, this.scheme_high.l_max),
                     a: alpha };
        }
    }
}

// Parse all elements and nuclides into the master elements array
parseElements();
parseNuclides();

// Update some more global data boundaries and apply colors to all elements and nuclides
for (e = 0; e < elements.length; e++){
    limits.min_nuclides_per_element = Math.min(limits.min_nuclides_per_element, elements[e].nuclides.length);
    limits.max_nuclides_per_element = Math.max(limits.max_nuclides_per_element, elements[e].nuclides.length);
    limits.max_neutron_spread = Math.max(limits.max_neutron_spread, elements[e].max_neutrons - elements[e].min_neutrons);
    elements[e].setBaseColor();
    for (n = 0; n < elements[e].nuclides.length; n++){
        elements[e].nuclides[n].setBaseColor();
    }
}
limits.max_halflife_exp += 1;
