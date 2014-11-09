function Nuclide (protons, neutrons, halflife){
  
    this.protons  = parseInt(protons);
    this.neutrons = parseInt(neutrons);

    var halflife_base = 0;
    var halflife_exp  = 0;
    if (halflife != "infinity"){
        var halflife_breakdown = halflife.toString().match("(\\d(.?)+)E((-?)\\d+)");
        if (halflife_breakdown != null){
            halflife_base = parseFloat(halflife_breakdown[1]);
            halflife_exp  = parseInt(halflife_breakdown[3]);
        } else {
            halflife_base = parseFloat(halflife);
            halflife_exp  = 0;
        }
        // Normalize half life to one digit left of the decimal place for the base
        var difference_magnitude = Math.floor(Math.log(halflife_base) / Math.log(10));
        if (difference_magnitude != 0){
            halflife_base /= Math.pow(10, difference_magnitude);
            halflife_exp  += difference_magnitude;
        }
        if (halflife_exp > matter.max_halflife_exp) { matter.max_halflife_exp = halflife_exp; }
        if (halflife_exp < matter.min_halflife_exp) { matter.min_halflife_exp = halflife_exp; }
    }

    this.halflife = new Time(halflife_base, halflife_exp);
    
    this.parentElement = null;
    
    this.isStable = false;
    if (this.halflife.base == this.halflife.exponent && this.halflife.base == 0){
        this.isStable = true;
    }

/*

  color base_c;
  color hlgt_c;
  float cell_alpha;
  float xpos;
  float ypos;
  int cell_w;
  int cell_h;
  
  int[][] coords;
  Boolean display_me;
  color use_base_c;
  color use_hlgt_c;
  
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

*/

}
