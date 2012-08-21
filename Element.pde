class Element { 

  int protons;
  int _period;
  int _group;
  
  String symbol;
  String name;
  
  int min_neutrons;
  int max_neutrons;
  
  Nuclide[] nuclides;

  Element(int tempProtons, int tempPeriod, int tempGroup) { 
    protons = tempProtons;
    _period = tempPeriod;
    _group  = tempGroup;
    min_neutrons = 0;
    max_neutrons = 0;
    nuclides = new Nuclide[0];
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
  }

  void display() {
    for (int n = 0; n < nuclides.length; n++) {
      nuclides[n].display();
    }
    
    // Draw labels
    if (!in_transition){
      trans.source.drawLabels(this);
    }
    
  }

}
