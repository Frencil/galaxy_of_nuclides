class Nuclide {
  
  color c;
  float xpos;
  float ypos;
  int cell_w;
  int cell_h;
  int cell_alpha;

  int protons;
  int neutrons;
  
  // Half Life
  // Stored in seconds as a base and an exponent (floats alone don't have the range. neither do doubles.)
  // Ex: 3.6e-24 seconds (3.6 yoctoseconds) would be halflife_base = 3.6; halflife_exp = -24;
  // Uses the Time class which stores both base float and int exponent values.
  Time halfLife;
  boolean isStable;

  Nuclide(int tempProtons, int tempNeutrons, float tempHalfLifeBase, int tempHalfLifeExp) { 
    
    protons      = tempProtons;
    neutrons     = tempNeutrons;
    halfLife     = new Time(tempHalfLifeBase, tempHalfLifeExp);
    isStable     = false;
    
    if (halfLife.base == halfLife.exponent && halfLife.base == 0){
      isStable = true;
    }
    
    colorMode(HSB, 360, 100, 100);
    c = color(0,0,0);
    if (isStable){
      c = color(0,0,100);
    } else {
      int c_hue = round(map(protons, 0, 118, 0, 360));
      int c_sat = constrain(round(map(halfLife.base, min_halflife_exp+5, max_halflife_exp-5, 100, 0)),0,100);
      int c_lgt = constrain(round(map(halfLife.base, min_halflife_exp+5, max_halflife_exp-5, 0, 100)),0,100);
      /*
      int c_hue = round(map(halfLifeExp, min_halflife_exp-2, max_halflife_exp+2, 20, 340));
      int c_sat = 100;
      int c_lgt = 100;
      */
      c = color(c_hue, c_sat, c_lgt);
    }
    
  }

  void display() {
    if (isStable) {
      cell_alpha = 255;
    } else {
      int halfLivesElapsed = min(now.exponent - halfLife.exponent, 0);
      cell_alpha = constrain( round(pow(2, (-1 * halfLivesElapsed) * 255)), 0, 255);
    }
    cell_w = current_layout.getWidth();
    cell_h = current_layout.getHeight();
    xpos   = current_layout.getXpos(protons, neutrons);
    ypos   = current_layout.getYpos(protons, neutrons);
    stroke(0);
    fill(c, cell_alpha);
    rectMode(CENTER);
    rect(xpos,ypos,cell_w,cell_h);
  }

}
