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
  
  int stablest_nuclide_index;
  
  Boolean is_highlighted;
  Boolean show_img_credit;
  Boolean stablest_nuclide_is_stable;
  
  PImage img;
  
  Nuclide[] nuclides;

  Element(int tempProtons, int tempPeriod, int tempGroup) { 
    protons = tempProtons;
    _period = tempPeriod;
    _group  = tempGroup;
    min_neutrons = 0;
    max_neutrons = 0;
    stablest_nuclide_index = 0;
    nuclides = new Nuclide[0];
    is_highlighted = false;
    stablest_nuclide_is_stable = false;
    img = requestImage("images/elements/"+protons+".jpg");
    show_img_credit = true; // Assume true, falsify when we first go to use image and test if it loaded
  }
  
  void setSymbol(String tempSymbol){ symbol = tempSymbol; }
  
  void setName(String tempName){ name = tempName; }
  
  void addNuclide(int tempNeutrons, float tempHalfLifeBase, int tempHalfLifeExp) {
    int count = nuclides.length;
    nuclides = (Nuclide[]) expand(nuclides, count + 1);
    nuclides[count] = new Nuclide(protons, tempNeutrons, tempHalfLifeBase, tempHalfLifeExp);
    if (nuclides[count].isStable){
      stablest_nuclide_index = count;
      stablest_nuclide_is_stable = true;
    } else if (!stablest_nuclide_is_stable && (tempHalfLifeExp > nuclides[stablest_nuclide_index].halfLife.exponent)){
      stablest_nuclide_index = count;
    }
    // Set colors
    nuclides[count].base_c = base_c;
    nuclides[count].hlgt_c = hlgt_c;
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
       
    String source_display_mode = trans.source.displayMode(protons, nuclides[stablest_nuclide_index].neutrons);
    String target_display_mode = trans.target.displayMode(protons, nuclides[stablest_nuclide_index].neutrons);
    
    String actual_display_mode = "none";
    
    if (source_display_mode == target_display_mode){
      actual_display_mode = source_display_mode;
    } else {
      // If the modes disagree then focus determines the outcome.
      // In focus: source holds on. Not in focus: jump to target.
      if (trans.source_focus_protons == protons){
        actual_display_mode = source_display_mode;
      } else if (trans.target_focus_protons == protons){
        actual_display_mode = target_display_mode;
      }
    }
    
    if (actual_display_mode == "element"){ displayNuclide(stablest_nuclide_index); }
    if (actual_display_mode == "nuclide"){ displayAllNuclides(); }
    
    // Draw labels
    if (!in_transition){
      trans.source.drawLabels(this);
    }
    
  }
  
  void displayNuclide(int nuclide_index) {
    if (nuclides[nuclide_index].hover()){
      hover_protons  = protons;
      hover_neutrons = nuclides[nuclide_index].neutrons;
    }
    nuclides[nuclide_index].display();
  }
  
  void displayAllNuclides() {
    for (int n = 0; n < nuclides.length; n++) {
      displayNuclide(n);
    }
  }

}
