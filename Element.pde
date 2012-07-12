class Element { 

  int protons;
  int _period;
  int _group;
  
  Nuclide[] nuclides;

  Element(int tempProtons, int tempPeriod, int tempGroup) { 
    protons = tempProtons;
    _period = tempPeriod;
    _group  = tempGroup;
    nuclides = new Nuclide[0];
  }
  
  void addNuclide(int tempNeutrons, float tempHalfLifeBase, int tempHalfLifeExp) {
    int count = nuclides.length;
    nuclides = (Nuclide[]) expand(nuclides, count + 1);
    nuclides[count] = new Nuclide(protons, tempNeutrons, tempHalfLifeBase, tempHalfLifeExp);
  }

  void display() {
    for (int n = 0; n < nuclides.length; n++) {
      nuclides[n].display();
    }
  }

}
