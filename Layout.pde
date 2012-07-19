interface Layout {
  
  int[][] getCoords(int protons, int neutrons);
  
}

// Standard
class StandardLayout implements Layout {
  
  int w = min( floor((width - 2 * margin)  / (absolute_max_neutrons + 1)),
               floor((height - 2 * margin) / (absolute_max_protons + 1)) );
  
  int[][] getCoords(int protons, int neutrons) {
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    int x = (neutrons * w) + margin;
    int y = height - (protons * w) - margin;
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Periodic
class PeriodicLayout implements Layout {
  
  int w = min( floor((width - 2 * margin)  / 19),
               floor((height - 2 * margin) / 11) );
  
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    // x
    int x = 0;
    if (element._group > 18){
      x = (element._group - 16) * w + margin;
    } else {
      x = element._group * w;
    }
    // y
    int y = 0;
    if (element._group > 18){
      y = (element._period + 3) * w + margin;
    } else {
      y = element._period * w;
    }
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Periodic2
class Periodic2Layout implements Layout {
  
  int w = min( floor((width - 2 * margin)  / 33),
               floor((height - 2 * margin) / 8) );
               
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    // x
    int x = 0;
    if (element._group > 18){
      x = (element._group - 16) * w + margin;
    } else if (element._group > 2) {
      x = (element._group + 14) * w + margin;
    } else {
      x = element._group * w + margin;
    }
    // y
    int y = element._period * w + margin;
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Crunched
class CrunchedLayout implements Layout {
  
  int w = min ( floor((width - 2 * margin)  / (absolute_max_protons + 1)),
                floor((height - 2 * margin) / (max_neutron_spread + 1)) );
  
  int[][] getCoords(int protons, int neutrons) {
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    int x = (protons * w) + margin;
    int y = (width/2) + ((protons - neutrons) * w) + margin;
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Stacked
class StackedLayout implements Layout {
  
  int w = min( floor( (width - 2 * margin) / elements.length),
               floor( (height - 2 * margin) / max_neutron_spread) );
  
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    int x = (protons * w) + margin;
    int y = height - ((neutrons - element.min_neutrons) * w) - margin;
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Regression
class RegressionLayout implements Layout {
  
  Regression reg;
  int w = min( floor((width - 2 * margin)  / (absolute_max_protons + 1)),
               floor((height - 2 * margin) / (max_neutron_spread + 1)) );
  
  RegressionLayout (RegressionType tempType){
    reg = new Regression(tempType);
  }
   
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    int x = (protons * w) + margin;
    int y = (height/2) + ((reg.Eval(protons) - neutrons) * w) + margin;
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
}

// Radial
class RadialLayout implements Layout {
  
  int w = 6;
  int base_radius = 40;
  
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    float theta  = map(protons, 0, absolute_max_protons, 0, 359);
    float rad    = ((neutrons - element.min_neutrons) * w) + base_radius;
    int x = int(rad * cos(radians(theta))) + (width / 2);
    int y = int(rad * sin(radians(theta))) + (height / 2);
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
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

