class Element { 

  int protons;
  int _period;
  int _group;
  
  String symbol;
  String name;
  
  color base_c;
  color hlgt_c;
  
  int min_neutrons;
  int max_neutrons;
  
  Boolean is_highlighted;
  Boolean show_img_credit;

  PImage img;
  
  Nuclide[] nuclides;

  Element(int tempProtons, int tempPeriod, int tempGroup) { 
    protons = tempProtons;
    _period = tempPeriod;
    _group  = tempGroup;
    min_neutrons = 0;
    max_neutrons = 0;
    nuclides = new Nuclide[0];
    is_highlighted = false;
    img = requestImage("images/elements/"+protons+".jpg");
    show_img_credit = true; // Assume true, falsify when we first go to use image and test if it loaded
  }
  
  void setSymbol(String tempSymbol){ symbol = tempSymbol; }
  
  void setName(String tempName){ name = tempName; }
  
  void addNuclide(int tempNeutrons, float tempHalfLifeBase, int tempHalfLifeExp) {
    int count = nuclides.length;
    nuclides = (Nuclide[]) expand(nuclides, count + 1);
    nuclides[count] = new Nuclide(protons, tempNeutrons, tempHalfLifeBase, tempHalfLifeExp);
    // Update min/max neutron values. If this is the first nuclide to be added then no comparison to current vals is necessary.
    if (count == 0){
      min_neutrons = tempNeutrons;
      max_neutrons = tempNeutrons;
    } else {
      min_neutrons = min(min_neutrons, tempNeutrons);
      max_neutrons = max(max_neutrons, tempNeutrons);
    }
    max_neutron_spread    = max(max_neutrons - min_neutrons, max_neutron_spread);
    absolute_max_neutrons = max(max_neutrons, absolute_max_neutrons);
    max_nuclides_per_element = max(max_nuclides_per_element, nuclides.length);
  }

  void display() {
    
    for (int n = 0; n < nuclides.length; n++) {
      nuclides[n].setDisplay();
      if (nuclides[n].hover()){
        hover_protons  = protons;
        hover_neutrons = nuclides[n].neutrons;
      }
    }
    
    for (int n = 0; n < nuclides.length; n++) {
      nuclides[n].display();
    }
    
    // Draw labels
    if (!in_transition){
      trans.source.drawLabels(this);
    }
    
  }

}
