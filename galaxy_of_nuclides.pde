import gifAnimation.*;

// Global vars
Element[] elements = new Element[118];
HashMap layouts = new HashMap();
int min_halflife_exp = 0;
int max_halflife_exp = 0;
Time now = new Time(0, -35);

Layout current_layout;
Transition trans;
boolean in_transition = false;
boolean in_decay = false;
boolean in_recay = false;


// Enums
RegressionType regressionType;

void setup() {

  // Display  
  size(750,500);
  
  // Slurp in data
  elements[0] = new Element(0);
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
    trans.stepForward(1);
    if (trans.percentage == 100){
      in_transition = false;
    }
  }
  
  // Run the clock forward (decay)
  if (in_decay) {
    now.exponent++;
    if (now.exponent > 35){
      in_decay = false;
    }
  }
  
  // Run the clock backward (recay)
  if (in_recay) {
    now.exponent--;
    if (now.exponent < -35){
      in_recay = false;
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
        newLayout = "crunched";
        break;       
     case '3':
        newLayout = "linear";
        break;
     case '4':
        newLayout = "poly2";
        break;
     case '5':
        newLayout = "poly3";
        break;
     case '6':
        newLayout = "exponential";
        break;
     case '7':
        newLayout = "logarithmic";
        break;
     case '8':
        newLayout = "power";
        break;
     case 'd':
        in_decay = true;
        in_recay = false;
        break;
     case 'r':
        in_recay = true;
        in_decay = false;
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

