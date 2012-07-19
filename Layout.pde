interface Layout {
  
  int getWidth();
  int getHeight();
  int getXpos(int protons, int neutrons);
  int getYpos(int protons, int neutrons);
  
}

// Standard
class StandardLayout implements Layout {
  
  int nuclide_width  = min( floor((width - 2 * margin)  / (absolute_max_neutrons + 1)),
                            floor((height - 2 * margin) / (absolute_max_protons + 1)) );
  int nuclide_height = nuclide_width;
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
   return (neutrons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
   return height - (protons * getHeight()) - (2 * margin);
  }
  
}

// Periodic
class PeriodicLayout implements Layout {
  
  int nuclide_width  = min( floor((width - 2 * margin)  / 19),
                            floor((height - 2 * margin) / 11) );
  int nuclide_height = nuclide_width;
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
    Element element = elements[protons];
    if (element._group > 18){
      return (element._group - 16) * getWidth();
    } else {
      return element._group * getWidth();
    }
  }
  
  int getYpos(int protons, int neutrons) {
    Element element = elements[protons];
    if (element._group > 18){
      return (element._period + 3) * getHeight();
    } else {
      return element._period * getHeight();
    }
  }
  
}

// Periodic2
class Periodic2Layout implements Layout {
  
  int nuclide_width  = min( floor((width - 2 * margin)  / 33),
                            floor((height - 2 * margin) / 8) );
  int nuclide_height = nuclide_width;
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
    Element element = elements[protons];
    if (element._group > 18){
      return (element._group - 16) * getWidth();
    } else if (element._group > 2) {
      return (element._group + 14) * getWidth();
    } else {
      return element._group * getWidth();
    }
  }
  
  int getYpos(int protons, int neutrons) {
    Element element = elements[protons];
    return element._period * getHeight();
  }
  
}

// Crunched
class CrunchedLayout implements Layout {
  
  int nuclide_width  = min ( floor((width - 2 * margin)  / (absolute_max_protons + 1)),
                             floor((height - 2 * margin) / (max_neutron_spread + 1)) );
  int nuclide_height = nuclide_width;
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
    return (protons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
    return (width/2) + ((protons - neutrons) * getHeight());
  }
  
}

// Stacked
class StackedLayout implements Layout {
  
  int nuclide_width  = min( floor( (width - 2 * margin) / elements.length),
                            floor( (height - 2 * margin) / max_neutron_spread) );
  int nuclide_height = nuclide_width;
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
    return (protons * nuclide_width);
  }
  
  int getYpos(int protons, int neutrons) {
    Element element = elements[protons];
    return height - ((neutrons - element.min_neutrons) * nuclide_height) - (2 * margin);
  }
  
}

// Regression
class RegressionLayout implements Layout {
  
  Regression reg;
  int nuclide_width  = min( floor((width - 2 * margin)  / (absolute_max_protons + 1)),
                            floor((height - 2 * margin) / (max_neutron_spread + 1)) );
  int nuclide_height = nuclide_width;
  
  RegressionLayout (RegressionType tempType){
    reg = new Regression(tempType);
  }
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
   return (protons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
   return (height/2) + ((reg.Eval(protons) - neutrons) * getHeight());
  }
  
}

// Radial
class RadialLayout implements Layout {
  
  int nuclide_width  = 6;
  int nuclide_height = 6;
  int base_radius    = 40;
  
  int getWidth() {
    return nuclide_width;
  }
  
  int getHeight() {
    return nuclide_height;
  }
  
  int getXpos(int protons, int neutrons) {
    Element element = elements[protons];
    float theta  = map(protons, 0, absolute_max_protons, 0, 359);
    float rad    = ((neutrons - element.min_neutrons) * nuclide_width) + base_radius;
    return int(rad * cos(radians(theta))) + (width / 2);
  }
  
  int getYpos(int protons, int neutrons) {
    Element element = elements[protons];
    float theta  = map(protons, 0, absolute_max_protons, 0, 359);
    float rad    = ((neutrons - element.min_neutrons) * nuclide_width) + base_radius;
    return int(rad * sin(radians(theta))) + (height / 2);
  }
  
}

void createLayouts(){
  layouts.put("standard",    new StandardLayout());
  layouts.put("periodic",    new PeriodicLayout());
  layouts.put("periodic2",   new Periodic2Layout());
  layouts.put("crunched",    new CrunchedLayout());
  layouts.put("stacked",     new StackedLayout());
  layouts.put("radial",      new RadialLayout());
  layouts.put("linear",      new RegressionLayout(regressionType.LINEAR));
  layouts.put("poly2",       new RegressionLayout(regressionType.POLY2));
  layouts.put("poly3",       new RegressionLayout(regressionType.POLY3));
  layouts.put("logarithmic", new RegressionLayout(regressionType.LOGARITHMIC));
  layouts.put("exponential", new RegressionLayout(regressionType.EXPONENTIAL));
  layouts.put("power",       new RegressionLayout(regressionType.POWER));
}

