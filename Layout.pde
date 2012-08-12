interface Layout {
  
  String name();
  void drawLabels(Element element);
  int[][] getCoords(int protons, int neutrons);
  
}

// Standard
class StandardLayout implements Layout {
  
  String name(){ return "standard"; }
  
  void drawLabels(Element element){ }
  
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
  
  String name(){ return "periodic"; }
  
  int w = min( floor((width - 2 * margin)  / 19),
               floor((height - 2 * margin) / 11) );
               
  void drawLabels(Element element){
    fill(360);
    textSize(floor(w/3));
    int x = getX(element);
    int y = getY(element);
    text(element.symbol, x+4, y+2, w-2, w-2);
  }
  
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    // don't show single neutron on this layout
    if (protons == 0){ return coords; }
    int x = getX(element);
    int y = getY(element);
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
  int getX(Element element){
    if (element._group > 18){
      return (element._group - 16) * w + margin;
    } else {
      return element._group * w;
    }
  }
  
  int getY(Element element){
    if (element._group > 18){
      return (element._period + 3) * w + margin;
    } else {
      return element._period * w;
    }
  }
  
}

// Periodic2
class Periodic2Layout implements Layout {
  
  String name(){ return "periodic2"; }
  
  void drawLabels(Element element){
    fill(360);
    textSize(floor(w/3));
    int x = getX(element);
    int y = getY(element);
    text(element.symbol, x+4, y+2, w-2, w-2);
  }
  
  int w = min( floor((width - 2 * margin)  / 33),
               floor((height - 2 * margin) / 8) );
               
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    // don't show single neutron on this layout
    if (protons == 0){ return coords; }
    int x = getX(element);
    int y = getY(element);
    coords[0][0] = x;     coords[0][1] = y;
    coords[1][0] = x + w; coords[1][1] = y;
    coords[2][0] = x + w; coords[2][1] = y + w;
    coords[3][0] = x;     coords[3][1] = y + w;
    return coords;
  }
  
  int getX(Element element){
    if (element._group > 18){
      return (element._group - 16) * w + margin;
    } else if (element._group > 2) {
      return (element._group + 14) * w + margin;
    } else {
      return element._group * w + margin;
    }
  }
  
  int getY(Element element){
    return element._period * w + margin;
  }
  
}

// Crunched
class CrunchedLayout implements Layout {
  
  String name(){ return "crunched"; }
  
  void drawLabels(Element element){ }
  
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
  
  String name(){ return "stacked"; }
  
  void drawLabels(Element element){ }
  
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
  
  String regressionName = "";
  String name(){ return regressionName; }
  
  void drawLabels(Element element){ }
  
  Regression reg;
  int w = min( floor((width - 2 * margin)  / (absolute_max_protons + 1)),
               floor((height - 2 * margin) / (max_neutron_spread + 1)) );
  
  RegressionLayout (RegressionType tempType){
    reg = new Regression(tempType);
    regressionName = tempType.toString().toLowerCase();
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
  
  String name(){ return "radial"; }
  
  void drawLabels(Element element){ }
  
  int base_radius = floor(min(width,height)/12);
  float arc_width = 360 / absolute_max_protons;
  float rad_width = floor((min(width,height)-4*base_radius)/max_neutron_spread);
  
  int[][] getCoords(int
  protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    float theta  = map(protons, 0, absolute_max_protons, 0, 359) - 90;
    float rad    = ((neutrons - element.min_neutrons) * rad_width) + base_radius;
    float theta_minus = theta - (arc_width / 2);
    float theta_plus  = theta + (arc_width / 2);
    float rad_minus   = rad - (rad_width / 2);
    float rad_plus    = rad + (rad_width / 2);
    coords[0][0] = int(rad_minus * cos(radians(theta_minus))) + (width / 2);
    coords[0][1] = int(rad_minus * sin(radians(theta_minus))) + (height / 3);
    coords[1][0] = int(rad_plus * cos(radians(theta_minus))) + (width / 2);
    coords[1][1] = int(rad_plus * sin(radians(theta_minus))) + (height / 3);
    coords[2][0] = int(rad_plus * cos(radians(theta_plus))) + (width / 2);
    coords[2][1] = int(rad_plus * sin(radians(theta_plus))) + (height / 3);
    coords[3][0] = int(rad_minus * cos(radians(theta_plus))) + (width / 2);
    coords[3][1] = int(rad_minus * sin(radians(theta_plus))) + (height / 3);
    return coords;
  }
  
}

void createLayouts(){
  layouts.clear();
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

