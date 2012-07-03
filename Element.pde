class Element { 

  int protons;
  float halflife;
  Nuclide[] nuclides;

  Element(int tempProtons) { 
    protons = tempProtons;
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
