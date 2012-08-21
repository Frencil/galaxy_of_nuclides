// Parse elements.csv and define all elements
void parseElements(String path) {
  
  String ele_lines[] = loadStrings(path);
  
  for (int i=0; i < ele_lines.length; i++) {
    String[] ele_values = split(ele_lines[i],',');
    int ele_z = PApplet.parseInt(ele_values[0]);
    String ele_symbol = ele_values[1];
    String ele_name = ele_values[2];
    int ele_period = PApplet.parseInt(ele_values[3]);
    int ele_group  = PApplet.parseInt(ele_values[4]);
    if (ele_z >= 0){
      Element tempElement = new Element(ele_z, ele_period, ele_group);
      tempElement.setSymbol(ele_symbol);
      tempElement.setName(ele_name);
      elements[ele_z] = tempElement;
      absolute_max_protons = max(ele_z, absolute_max_protons);
    }
  }
  
}

// Parse nuclides.csv and define all nuclides
void parseNuclides(String path) {
  
  String nuc_lines[] = loadStrings(path);
  
  int max_exp = 0;
  int min_exp = 0;
  
  for (int i=0; i < nuc_lines.length; i++) {
    // Break our individual values
    String[] nuc_values = split(nuc_lines[i],',');
    String nuc_nucleons = nuc_values[0];
    String nuc_symbol   = nuc_values[1];
    String nuc_protons  = nuc_values[2];
    String nuc_neutrons = nuc_values[3];
    String nuc_halflife = nuc_values[4];
    // Store the integers and do a sanity check
    int   nucleons = PApplet.parseInt(nuc_nucleons);
    int   protons  = PApplet.parseInt(nuc_protons);
    int   neutrons = PApplet.parseInt(nuc_neutrons);
    if (nucleons != (protons + neutrons)){ continue; }
    // Parse half life into base and exponent values
    // Stable (half life = infinity) get zeroes for both values
    float halflife_base = 0;
    int   halflife_exp  = 0;
    if (!nuc_halflife.equals("infinity")){
      String[] halflife_breakdown = match(nuc_halflife, "(\\d(.?)+)E((-?)\\d+)");
      if (halflife_breakdown != null){
        halflife_base = PApplet.parseFloat(halflife_breakdown[1]);
        halflife_exp  = PApplet.parseInt(halflife_breakdown[3]);
      } else {
        halflife_base = PApplet.parseFloat(nuc_halflife);
        halflife_exp  = 0;
      }
      // Normalize half life to one digit left of the decimal place for the base
      int difference_magnitude = floor(log(halflife_base) / log(10));
      if (difference_magnitude != 0){
        halflife_base /= pow(10, difference_magnitude);
        halflife_exp  += difference_magnitude;
      }
      if (halflife_exp > max_halflife_exp) { max_halflife_exp = halflife_exp; }
      if (halflife_exp < min_halflife_exp) { min_halflife_exp = halflife_exp; }
    } else {
      //println(protons+","+neutrons);
    }
    elements[protons].addNuclide(neutrons, halflife_base, halflife_exp);
  }
  
}
