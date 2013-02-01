class Nuclide {
  
  color base_c;
  color hlgt_c;
  float cell_alpha;
  float xpos;
  float ypos;
  int cell_w;
  int cell_h;

  int protons;
  int neutrons;
  
  int[][] coords;
  Boolean display_me;
  color use_base_c;
  color use_hlgt_c;
  
  // Half Life
  // Stored in seconds as a base and an exponent (floats alone don't have the range. neither do doubles.)
  // Ex: 3.6e-24 seconds (3.6 yoctoseconds) would be halflife_base = 3.6; halflife_exp = -24;
  // Uses the Time class which stores both base float and int exponent values.
  Time halfLife;
  boolean isStable;

  Nuclide(int tempProtons, int tempNeutrons, float tempHalfLifeBase, int tempHalfLifeExp) { 
    
    protons  = tempProtons;
    neutrons = tempNeutrons;
    halfLife = new Time(tempHalfLifeBase, tempHalfLifeExp);
    isStable = false;
    
    if (halfLife.base == halfLife.exponent && halfLife.base == 0){
      isStable = true;
    }
    
  }

  void setDisplay() {
    display_me = true;
    String display_mode = trans.source.displayMode(protons, neutrons);
    if (display_mode == "nuclide" || in_transition){
      use_base_c = base_c;
      use_hlgt_c = hlgt_c;
      cell_alpha = 255;
      if (!isStable){ cell_alpha = 255 / pow(2, max(now.exponent - halfLife.exponent, 0)); }
    } else if (display_mode == "element"){
      Element element = elements[protons];
      use_base_c = element.base_c;
      use_hlgt_c = element.hlgt_c;
      cell_alpha = 255;
    } else {
      display_me = false;
      cell_alpha = 0;
      return;
    }
    coords = trans.getCoords(protons, neutrons);
  }
  
  void display(){
    if (!display_me){ return; }
    color c = use_base_c;
    // Highlight color for when mouse is over element
    // or when in focus view and mouse is only over given nuclide
    if (protons == hover_protons && (neutrons == hover_neutrons || trans.target.name() != "oneelement")){
      c = use_hlgt_c;
    }
    /*
    // Full-sized border
    stroke(c);
    noFill();
    quad( coords[0][0] - cell_padding, coords[0][1] - cell_padding,
          coords[1][0] + cell_padding, coords[1][1] - cell_padding,
          coords[2][0] + cell_padding, coords[2][1] + cell_padding,
          coords[3][0] - cell_padding, coords[3][1] + cell_padding );
    // Shrink fill by half life
    noStroke();
    fill(c, cell_alpha);
    float shrink_rate   = map(halfLife.exponent, min_halflife_exp, max_halflife_exp, 0.7, 1);
    float shrink_margin = (abs(coords[0][0] - coords[0][1]) * (1 - shrink_rate))/2;
    quad( coords[0][0] - cell_padding + shrink_margin, coords[0][1] - cell_padding + shrink_margin,
          coords[1][0] + cell_padding - shrink_margin, coords[1][1] - cell_padding + shrink_margin,
          coords[2][0] + cell_padding - shrink_margin, coords[2][1] + cell_padding - shrink_margin,
          coords[3][0] - cell_padding + shrink_margin, coords[3][1] + cell_padding - shrink_margin );
          */
    
    if (same_stroke){
      stroke(c);
    } else {
      noStroke();
    }
    fill(c, cell_alpha);
    quad( coords[0][0] - cell_padding, coords[0][1] - cell_padding,
          coords[1][0] + cell_padding, coords[1][1] - cell_padding,
          coords[2][0] + cell_padding, coords[2][1] + cell_padding,
          coords[3][0] - cell_padding, coords[3][1] + cell_padding );
    
  }
  
  Boolean hover() {
    if (coords == null){ return false; }
    int[] x_range = {coords[0][0], coords[1][0]};
    int[] y_range = {coords[1][1], coords[2][1]};
    return (mouseX > x_range[0] && mouseX < x_range[1] && mouseY > y_range[0] && mouseY < y_range[1]);
  }

}
