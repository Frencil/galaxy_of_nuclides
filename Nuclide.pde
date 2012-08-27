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
    
    colorMode(HSB, 360, 100, 100);
    base_c = color(0,0,0);
    hlgt_c = color(0,0,0);
    if (isStable){
      base_c = color(0,0,100);
      hlgt_c = color(0,0,100);
    } else {
      int base_c_hue = round(map(protons, 0, absolute_max_protons, 0, 360));
      int base_c_sat = round(map(halfLife.exponent * -1, min_halflife_exp, max_halflife_exp, 0, 100));
      int base_c_lgt = round(map(halfLife.exponent, min_halflife_exp, max_halflife_exp, 20, 100));
      int hlgt_c_lgt = round(map(base_c_lgt, 20, 100, 50, 100));
      base_c = color(base_c_hue, base_c_sat, base_c_lgt);
      hlgt_c = color(base_c_hue, base_c_sat, hlgt_c_lgt);
    }
    
  }

  void setDisplay() {
    cell_alpha = 255;
    if (!isStable){
      cell_alpha = 255 / pow(2, max(now.exponent - halfLife.exponent, 0));
    }
    coords = trans.getCoords(protons, neutrons);
  }
  
  void display(){
    color c = base_c;
    if (protons == hover_protons){
      c = hlgt_c;
    }
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
    int[] x_range = {coords[0][0], coords[1][0]};
    int[] y_range = {coords[1][1], coords[2][1]};
    return (mouseX > x_range[0] && mouseX < x_range[1] && mouseY > y_range[0] && mouseY < y_range[1]);
  }

}
