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
  
  void display(){
    
    // Set alpha
    cell_alpha = 255;
    if (!isStable){ cell_alpha = 255 / pow(2, max(now.exponent - halfLife.exponent, 0)); }

    // Set coords
    coords = trans.getCoords(protons, neutrons);
    
    // Highlight color for when mouse is over element
    // or when in focus view and mouse is only over given nuclide
    color c = base_c;
    if (protons == hover_protons && (neutrons == hover_neutrons || trans.target.name() != "oneelement")){
      c = hlgt_c;
    }
    
    // Render full-sized border
    stroke(c);
    noFill();
    quad( coords[0][0], coords[0][1],
          coords[1][0], coords[1][1],
          coords[2][0], coords[2][1],
          coords[3][0], coords[3][1] );
          
    // Shrink fill by half life, render fill
    noStroke();
    fill(c, cell_alpha);
    float shrink_rate = 1;
    int shrink_margin = 0;
    if (!isStable){
      shrink_rate = map(halfLife.exponent, min_halflife_exp, max_halflife_exp, 0.04, 1);
      shrink_margin = round((abs(coords[0][0] - coords[1][0]) * (1 - shrink_rate))/2);
    }
    quad( coords[0][0] + shrink_margin, coords[0][1] + shrink_margin,
          coords[1][0] - shrink_margin, coords[1][1] + shrink_margin,
          coords[2][0] - shrink_margin, coords[2][1] - shrink_margin,
          coords[3][0] + shrink_margin, coords[3][1] - shrink_margin );
          
    // For non-stable nuclides render feathered edge
    noFill();
    if (shrink_rate < 1){
      int steps = min(floor(abs(shrink_margin)), 20);
      for (int i = 0; i < steps; i++){
        float feather_alpha  = cell_alpha - ((cell_alpha/steps)*i);
        int feather_margin = shrink_margin - i;
        stroke(c, feather_alpha);
        quad( coords[0][0] + feather_margin, coords[0][1] + feather_margin,
              coords[1][0] - feather_margin, coords[1][1] + feather_margin,
              coords[2][0] - feather_margin, coords[2][1] - feather_margin,
              coords[3][0] + feather_margin, coords[3][1] - feather_margin );
      }
    }   
    
  }
  
  Boolean hover() {
    if (coords == null){ return false; }
    int[] x_range = {coords[0][0], coords[1][0]};
    int[] y_range = {coords[1][1], coords[2][1]};
    return (mouseX > x_range[0] && mouseX < x_range[1] && mouseY > y_range[0] && mouseY < y_range[1]);
  }

}
