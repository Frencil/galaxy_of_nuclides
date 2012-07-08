// Global vars
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
int min_halflife_exp = 0;
int max_halflife_exp = 0;
Time now = new Time(0, -50);

Layout current_layout;
Transition trans;
boolean in_transition = false;
int transition_delay  = 0;
Iterator layouts_i;

// Enums
RegressionType regressionType;

void setup() {

  // Display  
  size(950,650);
  
  // Slurp in data
  elements[0] = new Element(0);
  parseElements("data/elements.csv");
  parseNuclides("data/nuclides.csv");
  
  // Layouts and Transitions
  createLayouts();
  layouts_i = layouts.entrySet().iterator();
  Map.Entry first_layout = (Map.Entry) layouts_i.next();
  println("first layout: " + first_layout.getKey());
  trans = new Transition( (Layout) first_layout.getValue() );
  Map.Entry second_layout = (Map.Entry) layouts_i.next();
  println("second layout: " + second_layout.getKey());
  trans.addTarget( (Layout) second_layout.getValue() ); 
  //trans.addTarget( (Layout) layouts.get("standard") );
  
}

void draw() {
  background(0);
  
  // Run the transition
  if (in_transition){
    trans.stepForward(1);
    if (trans.percentage == 100){
      in_transition = false;
    }
  } else {
    transition_delay++;
    if (transition_delay == 100 && layouts_i.hasNext()){
      Map.Entry next_layout = (Map.Entry) layouts_i.next();
      println("next layout: " + next_layout.getKey());
      trans.addTarget( (Layout) next_layout.getValue() );
      trans.reset();
      transition_delay = 0;
      in_transition = true;
    }
  }
  
  // Run the clock
  /*
  now.exponent++;
  if (now.exponent > 50) now.exponent = -50;
  */
  
  for (int e = 0; e < elements.length; e = e+1) {
    elements[e].display();
  }

}

