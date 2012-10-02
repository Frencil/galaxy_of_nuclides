// Imports
import controlP5.*;
//import gifAnimation.*;

// Objects
ControlP5 cp5;
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
Time now = new Time(1, -35);
Layout current_layout;
Layout unfocused_layout;
Transition trans;
RegressionType regressionType;

// Data boundaries
int min_halflife_exp = 0;
int max_halflife_exp = 0;
int absolute_max_protons  = 0;
int absolute_max_neutrons = 0;
int max_neutron_spread = 0;

// Display stuff
float aspect_ratio     = 0.5625;
int   margin           = 20;
float display_scale    = 1;
int   full_scale_width = 1700 + 3 * margin;
int   display_width    = full_scale_width;
int   display_height   = round(display_width * aspect_ratio);
float cell_padding = -1.5;
int focus_atomic_number = 0;
boolean same_stroke = true;

// Status booleans
boolean in_transition = false;
boolean transitions_loaded = false;

// Mouse position relative to specific nuclide
int hover_protons  = -1;
int hover_neutrons = -1;

/**
  Setup() :: parse data, further define some globals
*/
void setup() {
  
  // Scale the size to the screen width in 50% steps
  while (display_width > screen.width) {
    display_scale  = display_scale * 0.5;
    display_width  = round(full_scale_width * display_scale);
    display_height = round(display_width * aspect_ratio);
  }

  size(display_width, display_height);
  
  // Slurp in data
  elements[0] = new Element(0,1,0);
  parseElements("data/elements.csv");
  parseNuclides("data/nuclides.csv");
  
  // Set element base colors
  colorMode(HSB, 360, 100, 100);
  for (int e = 0; e < elements.length; e = e+1) {
    int bright_sum = 0;
    int sat_sum    = 0;
    int elem_hue   = 0;
    for (int n = 0; n < elements[e].nuclides.length; n++) {
      if (!elements[e].nuclides[n].isStable){
        elem_hue = round(hue(elements[e].nuclides[n].base_c));
      }
      bright_sum += brightness(elements[e].nuclides[n].base_c);
      sat_sum    += saturation(elements[e].nuclides[n].base_c);
    }
    int avg_s = round(sat_sum/elements[e].nuclides.length);
    int avg_b = round(bright_sum/elements[e].nuclides.length);
    elements[e].base_c = color(elem_hue, avg_s, avg_b);
    elements[e].hlgt_c = color(elem_hue, avg_s, round(map(avg_b, 20, 100, 50, 100)));
  }
  
  // Layouts and Transitions
  createLayouts();
  trans = new Transition( (Layout) layouts.get("periodic") );
  trans.addTarget( (Layout) layouts.get(trans.source.name()), -1 );
  trans.force();
  
  // Initialize GUI controls class, add slider
  cp5 = new ControlP5(this);
  addTimeSlider();
  
}

void draw() {
  
  background(0);
  
  // If resizing has occurred (or this is the first draw), redraw everything
  /*
  if (width != stored_width || height != stored_height){
    // Force a 16:9 perspective
    height = round(width * 0.5625);
    // Update stored dimensions
    stored_width  = width;
    stored_height = height;
    println(width + " x " + height);
    // Redraw slider and reload layouts
    addTimeSlider();
    createLayouts();
    // Kill any transition in progress and transition into current layout, resized
    trans.addTarget( (Layout) layouts.get(trans.source.name()), -1 );
    if (transitions_loaded){
      trans.reset();
    } else {
      trans.force();
    }
    in_transition = true;
  }
  */
  
  // Run transition
  if (in_transition) {
    trans.stepForward(4);
    if (trans.percentage == 100){
      in_transition = false;
      trans.source_focus_protons = trans.target_focus_protons;
    } else {
      showProgress(float(trans.percentage)/100);
    }
  }
  
  // Reset mouse hover values
  hover_protons  = -1;
  hover_neutrons = -1;
  
  // Display the elements!
  for (int e = 0; e < elements.length; e = e+1) {
    elements[e].display();
  }
  
}


//Simple control scheme  
void keyPressed() {
  
  String newLayout = null;
  
  switch (key) {
     case '1':
        newLayout = "standard";
        break;
     case '2':
        newLayout = "periodic";
        break;
     case '3':
        newLayout = "periodic2";
        break;
     case '4':
        newLayout = "crunched";
        break;       
     case '5':
        newLayout = "linear";
        break;
     case '6':
        newLayout = "poly2";
        break;
     case '7':
        newLayout = "poly3";
        break;
     case '8':
        newLayout = "exponential";
        break;
     case '9':
        newLayout = "logarithmic";
        break;
     case '0':
        newLayout = "power";
        break;
     case 'q':
        newLayout = "stacked";
        break;
     case 'w':
        newLayout = "radial";
        break;
     case 'a':
        newLayout = "periodicdetailed";
        break;
     case 'd':
        cp5.getController("timeSlider").setValue(now.exponent+1);
        break;
     case 'r':
        cp5.getController("timeSlider").setValue(now.exponent-1);
        break;
     case 'g':
        same_stroke = !same_stroke;
        break;
     case '+':
        cell_padding += 0.5;
        break;
     case '-':
        cell_padding -= 0.5;
        break;
     case '=':
        cell_padding = 0;
        break;
     case CODED:
        if (!in_transition && trans.target.name() == "oneelement"){
          int new_protons = -1;
          switch (keyCode){
            case UP:
              trans.target_focus_protons = min(trans.target_focus_protons + 1, elements.length - 1);
              break;
            case DOWN:
              trans.target_focus_protons = max(trans.target_focus_protons - 1, 1);
              break;
            case LEFT:
              trans.target_focus_protons = max(trans.target_focus_protons - 1, 1);
              break;
            case RIGHT:
              trans.target_focus_protons = min(trans.target_focus_protons + 1, elements.length - 1);
              break;
          }
        }
        break;
     /*
     case 'e':  //export an animated gif
        exportGif();
        break;
     */
  }
  
  if (newLayout != null){
    trans.addTarget( (Layout) layouts.get(newLayout), -1 );
    trans.reset();
    in_transition = true;
    println("selected layout: " + newLayout);
  }
  
}

// Mouse control
void mouseClicked(){
  if (hover_protons > -1){
    HashMap parameters = new HashMap();
    parameters.put("protons", new Integer(hover_protons));
    trans.addTarget( (Layout) layouts.get("oneelement"), hover_protons );
    trans.reset();
    in_transition = true;
    println("Highlighting element: "+elements[hover_protons].name);
    // Add back button and store unfocused layout
    if (-1 == trans.source_focus_protons){
      unfocused_layout = trans.source;
      cp5.addButton("Back")
         .setPosition(width - 50 - margin, height - 20 - margin)
         .setSize(50,20);
    } else {
      trans.force();
    }
  }
}

void addTimeSlider(){
  float slider_value = min_halflife_exp - 1;
  if (cp5.getController("timeSlider") != null){
    slider_value = cp5.getController("timeSlider").getValue();
    cp5.getController("timeSlider").remove();
  }
  cp5.addSlider("timeSlider")
     .setPosition(margin,margin)
     .setSize(width-(2*margin),12)
     .setRange(min_halflife_exp-1,max_halflife_exp+6)
     .setDefaultValue(min_halflife_exp-1)
     .setValue(slider_value)
     .setCaptionLabel("Elapsed Time")
     .setNumberOfTickMarks(max_halflife_exp-min_halflife_exp+8)
     .showTickMarks(true)
     .snapToTickMarks(true);
  cp5.getController("timeSlider").getValueLabel().align(ControlP5.LEFT, ControlP5.BOTTOM_OUTSIDE).setPaddingX(0).setPaddingY(12);
  cp5.getController("timeSlider").getCaptionLabel().align(ControlP5.RIGHT, ControlP5.BOTTOM_OUTSIDE).setPaddingX(0).setPaddingY(12);
}

void timeSlider(float value) {
  now.exponent = round(constrain(value,min_halflife_exp-1,max_halflife_exp+6));
  cp5.getController("timeSlider").setValueLabel(now.humanReadable());
  //println(now.humanReadable());
}

void showProgress(float value) {
  fill(255); stroke(255);
  rect(0, height - 3, float(width) * value, 3);
}

void controlEvent(ControlEvent theEvent) {
  if (theEvent.isController()) { 
    if (theEvent.controller().name() == "Back") {
      println("returning to layout: " + unfocused_layout.name());
      trans.addTarget( unfocused_layout, -1 );
      trans.reset();
      in_transition = true;
      cp5.getController("Back").remove();
    }
  }
}
