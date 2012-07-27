//import gifAnimation.*;

/**
  Set up global vars
*/

// Objects
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
Time now = new Time(0, -35);
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
boolean in_decay = false;
boolean in_recay = false;


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
  
}

void draw() {
  
  background(0);
  
  // Run the transition
  if (in_transition) {
    trans.stepForward(4);
    if (trans.percentage == 100){
      in_transition = false;
    } else {
      showProgress(float(trans.percentage)/100);
    }
  }
  
  // Run the clock forward (decay)
  if (in_decay) {
    now.exponent++;
    if (now.exponent > 35){
      in_decay = false;
    } else {
      showProgress((float(now.exponent) + 35)/70);
    }
  }
  
  // Run the clock backward (recay)
  if (in_recay) {
    now.exponent--;
    if (now.exponent < -35){
      in_recay = false;
    } else {
      showProgress((float(now.exponent) + 35)/70);
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
        in_decay = true;
        in_recay = false;
        break;
     case 'r':
        in_recay = true;
        in_decay = false;
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

void showProgress(float value) {
  fill(255); stroke(255);
  rect(0, height - 3, float(width) * value, 3);
}

/*
void exportGif() {
  
  GifMaker gifExport = new GifMaker(this, "trippy.gif");
  gifExport.setSize(700,450);
  gifExport.setRepeat(0);
  gifExport.setDelay(250);
  
  background(0);
  for (int e = 0; e < elements.length; e = e+1) {
    elements[e].display();
  }
  gifExport.addFrame();
  gifExport.setDelay(40);
  
  while (in_transition) {
    
    background(0);
  
    // Run the transition
    trans.stepForward(4);
    println(trans.percentage + "%");
    if (trans.percentage == 100){
      if (layouts_i.hasNext()){
        Map.Entry next_layout = (Map.Entry) layouts_i.next();
        println("next layout: " + next_layout.getKey());
        trans.addTarget( (Layout) next_layout.getValue() );
        trans.reset();
        transition_delay = 0;
      } else {     
        in_transition = false;
      }
    }
    
    for (int e = 0; e < elements.length; e = e+1) {
      elements[e].display();
    }
    
    gifExport.addFrame();
    
  }
  
  // Run the clock
  println("decaying...");
  while (now.exponent < 35) {
    now.exponent += 3;
    println(now.exponent);
    background(0);
    for (int e = 0; e < elements.length; e = e+1) {
      elements[e].display();
    }
    gifExport.addFrame();
  }
  
  gifExport.finish();
  println("done!");

}
*/

