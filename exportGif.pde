/*
void exportGif() {
  
  GifMaker gifExport = new GifMaker(this, "nuclides.gif");
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

