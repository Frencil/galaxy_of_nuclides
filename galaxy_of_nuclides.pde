// Imports
import controlP5.*;
//import gifAnimation.*;

// Objects
ControlP5 cp5;
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
Time now = new Time(1, -35);
Layout current_layout;
Transition trans;
RegressionType regressionType;

// Data boundaries
int min_halflife_exp = 0;
int max_halflife_exp = 0;
int absolute_max_protons  = 0;
int absolute_max_neutrons = 0;
int max_neutron_spread = 0;

// Display basics
int display_width  = 800;
int display_height = 550;
int margin = 20;

// Display adjustments
boolean same_stroke = false;
float cell_padding = 0;

// Status booleans
boolean in_transition = false;

/**
  Setup() :: parse data, further define some globals
*/
void setup() {

  // Display  
  size(display_width, display_height);
  
  // Slurp in data
  elements[0] = new Element(0,1,0);
  parseElements("data/elements.csv");
  parseNuclides("data/nuclides.csv");
  
  // Layouts and Transitions
  createLayouts();
  trans = new Transition( (Layout) layouts.get("standard") );
  
  // Time Slider
  cp5 = new ControlP5(this);
  cp5.addSlider("timeSlider")
     .setPosition(margin,margin)
     .setSize(width-(2*margin),12)
     .setRange(min_halflife_exp,max_halflife_exp)
     .setDefaultValue(min_halflife_exp)
     .setValue(min_halflife_exp)
     .setCaptionLabel("Elapsed Time")
     .setNumberOfTickMarks(max_halflife_exp-min_halflife_exp+1)
     .showTickMarks(true)
     .snapToTickMarks(true);
  cp5.getController("timeSlider").getValueLabel().align(ControlP5.LEFT, ControlP5.BOTTOM_OUTSIDE).setPaddingX(0).setPaddingY(12);
  cp5.getController("timeSlider").getCaptionLabel().align(ControlP5.RIGHT, ControlP5.BOTTOM_OUTSIDE).setPaddingX(0).setPaddingY(12);
  
}

void draw() {
  
  background(0);
  
  // Run transition
  if (in_transition) {
    trans.stepForward(4);
    if (trans.percentage == 100){
      in_transition = false;
    } else {
      showProgress(float(trans.percentage)/100);
    }
  }
  
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
     /*
     case 'e':  //export an animated gif
        exportGif();
        break;
     */
  }
  
  if (newLayout != null){
    trans.addTarget( (Layout) layouts.get(newLayout) );
    trans.reset();
    in_transition = true;
    println("selected layout: " + newLayout);
  }
  
}

void timeSlider(float value) {
  now.exponent = round(constrain(value,min_halflife_exp,max_halflife_exp));
  cp5.getController("timeSlider").setValueLabel(now.humanReadable());
  //println(now.humanReadable());
}

void showProgress(float value) {
  fill(255); stroke(255);
  rect(0, height - 3, float(width) * value, 3);
}

