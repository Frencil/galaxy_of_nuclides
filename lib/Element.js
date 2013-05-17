function Element (protons, period, group) { 

  this.protons = protons;
  this.period  = period;
  this.group   = group;
  
  this.symbol = '';
  this.name   = '';
  
  this.min_neutrons = null;
  this.max_neutrons = null;
  this.stablest_neutrons = null;

  this.smallest_stable_neutrons = null;
  this.largest_stable_neutrons  = null;
  
  this.is_highlighted = false;
  this.show_img_credit = true;

  this.nuclides = new Object();
  
  this.addNuclide = function(nuclide) {

    this.nuclides[nuclide.neutrons] = nuclide;
    this.nuclides[nuclide.neutrons].parentElement = this;

    if (Object.keys(this.nuclides).length == 1){
      this.min_neutrons = nuclide.neutrons;
      this.max_neutrons = nuclide.neutrons;
      this.stablest_neutrons = nuclide.neutrons;
    } else {
      this.min_neutrons = Math.min(this.min_neutrons, nuclide.neutrons);
      this.max_neutrons = Math.max(this.max_neutrons, nuclide.neutrons);
      if (nuclide.isStable || (nuclide.halfLife.exponent > this.nuclides[this.stablest_neutrons].halfLife.exponent)){
        this.stablest_neutrons = nuclide.neutrons;
      }
      if (nuclide.isStable){
        if (null == this.smallest_stable_neutrons || null == this.largest_stable_neutrons){
          this.smallest_stable_neutrons = nuclide.neutrons;
          this.largest_stable_neutrons  = nuclide.neutrons;
        } else {
          if (nuclide.neutrons < this.smallest_stable_neutrons) this.smallest_stable_neutrons = nuclide.neutrons;
          if (nuclide.neutrons > this.largest_stable_neutrons)  this.largest_stable_neutrons = nuclide.neutrons;
        }
      }
    }

    // Set colors
    //this.nuclides[count].base_c = base_c;
    //this.nuclides[count].hlgt_c = hlgt_c;

    // global values
    //max_neutron_spread    = max(max_neutrons - min_neutrons, max_neutron_spread);
    //absolute_max_neutrons = max(max_neutrons, absolute_max_neutrons);
    //max_nuclides_per_element = max(max_nuclides_per_element, this.nuclides.length);
  }

/*

  void display() {
       
    String source_display_mode = trans.source.displayMode(protons, this.nuclides[stablest_nuclide_index].neutrons);
    String target_display_mode = trans.target.displayMode(protons, this.nuclides[stablest_nuclide_index].neutrons);
    
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
*/

}