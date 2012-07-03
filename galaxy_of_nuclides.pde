// Global vars
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
int min_halflife_exp = 0;
int max_halflife_exp = 0;
Time now = new Time(0, -50);
Layout current_layout;
Transition trans;
boolean in_transition = false;

// Enums
RegressionType regressionType;

void setup() {

  // Display  
  size(950,650);
  
  // Layouts
  createLayouts(); 
  current_layout = (Layout) layouts.get("standard");
  
  // Slurp in data
  elements[0] = new Element(0);
  parseElements("/home/chris/sketchbook/galaxy_of_nuclides/data/elements.csv");
  parseNuclides("/home/chris/sketchbook/galaxy_of_nuclides/data/nuclides.csv");
  
  // Transition
  // ...
  
}

void draw() {
  background(0);
  
  /*
  if (in_transition){
    trans.stepForward(1);
    if (trans.percentage == 100){
      in_transition = false;
    }
  }
  */
  
  now.exponent++;
  if (now.exponent > 50) now.exponent = -50;
  for (int e = 0; e < elements.length; e = e+1) {
    elements[e].display();
  }

}

