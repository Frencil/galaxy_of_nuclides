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
    } else if (element._group == 0) {
      return -1 * w;
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
    } else if (element._group == 0) {
      return -1 * w;
    } else {
      return element._group * w + margin;
    }
  }
  
  int getY(Element element){
    return element._period * w + margin;
  }
  
}

// Periodic Detailed
class PeriodicDetailedLayout implements Layout {
  
  String name(){ return "periodicdetailed"; }
  
  int element_w = min( floor((width - 2 * margin)  / 19),
                  floor((height - 2 * margin) / 11) );
               
  void drawLabels(Element element){
    fill(360);
    textSize(floor(element_w/3));
    int x = getX(element);
    int y = getY(element);
    text(element.symbol, x+4, y+2, element_w-2, element_w-2);
  }
  
  int[][] getCoords(int protons, int neutrons) {
    Element element = elements[protons];
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    // don't show single neutron on this layout
    if (protons == 0){ return coords; }
    // start with the x/y of the element itself
    int x = getX(element);
    int y = getY(element);
    // get nuclide-specific width and position
    int dimension  = ceil(sqrt(element.max_neutrons-element.min_neutrons+1));
    int nuclide_w  = floor(element_w / dimension);
    int relative_x = (neutrons-element.min_neutrons) % dimension;
    int relative_y = floor((neutrons-element.min_neutrons) / dimension);
    // generate coords
    x += (relative_x * nuclide_w) + 1;
    y += (relative_y * nuclide_w) + 1;
    coords[0][0] = x;             coords[0][1] = y;
    coords[1][0] = x + nuclide_w; coords[1][1] = y;
    coords[2][0] = x + nuclide_w; coords[2][1] = y + nuclide_w;
    coords[3][0] = x;             coords[3][1] = y + nuclide_w;
    return coords;
  }
  
  int getX(Element element){
    if (element._group > 18){
      return (element._group - 16) * element_w + margin;
    } else if (element._group == 0) {
      return -1 * element_w;
    } else {
      return element._group * element_w;
    }
  }
  
  int getY(Element element){
    if (element._group > 18){
      return (element._period + 3) * element_w + margin;
    } else {
      return element._period * element_w;
    }
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

// OneElement
class OneElementLayout implements Layout {
  
  String name(){ return "oneelement"; }
  
  int total_w = height - 50 - 2*margin;
  
  int w = min( floor((width - 2 * margin)  / 52),
          floor((height - 2 * margin) / 52) );
  
  void drawLabels(Element element){
    // Only render elements in focus
    if (trans.source_focus_protons == element.protons || trans.target_focus_protons == element.protons){
      int x = 2*margin + total_w;
      int y = margin + 50;
      int dimension = ceil(sqrt(element.max_neutrons-element.min_neutrons+1));
      int nuclide_w = floor(total_w / dimension);
      fill(360);
      // Element name and symbol
      textSize(floor(total_w/14));
      y += textAscent() + textDescent();
      text(element.name + " - " + element.symbol, x, y);
      // Proton and isotope count
      y += textAscent() + textDescent();
      textSize(floor(total_w/24));
      text(element.protons + " protons, " + element.nuclides.length + " known isotopes", x, y);
      // Image
      y += textAscent() + textDescent();
      if (element.img.width > 0) {
        image(element.img,x,y,nuclide_w*1.6,nuclide_w*1.6);
      }
      // Nuclide labels
      for (int n = 0; n < element.nuclides.length; n++){
        int n_x = element.nuclides[n].coords[0][0];
        int n_y = element.nuclides[n].coords[0][1];
        int a = element.protons + element.nuclides[n].neutrons;
        fill(brightness(element.nuclides[n].base_c) > 90 ? 0 : 360);
        textSize(min(floor(total_w/20),floor(nuclide_w/5)));
        text("" + a, n_x + floor(margin/2), n_y + floor(margin/2), nuclide_w, nuclide_w);
        textSize(min(floor(total_w/24),floor(nuclide_w/6)));
        text("(" + element.nuclides[n].neutrons + "n)", n_x + floor(margin/2), n_y + margin + textAscent(), nuclide_w, nuclide_w);
      }
    }
  }
  
  int[][] getCoords(int protons, int neutrons) {
    
    int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
    Element element = elements[protons];
    
    // Element in focus: zoomed on broken out nuclides
    if (trans.source_focus_protons == protons || trans.target_focus_protons == protons){
      int x = margin;
      int y = margin + 50;
      // get nuclide-specific width and position
      int dimension  = ceil(sqrt(element.max_neutrons-element.min_neutrons+1));
      int nuclide_w  = floor(total_w / dimension);
      int relative_x = (neutrons-element.min_neutrons) % dimension;
      int relative_y = floor((neutrons-element.min_neutrons) / dimension);
      // generate coords
      x += (relative_x * nuclide_w) + 1;
      y += (relative_y * nuclide_w) + 1;
      coords[0][0] = x;             coords[0][1] = y;
      coords[1][0] = x + nuclide_w; coords[1][1] = y;
      coords[2][0] = x + nuclide_w; coords[2][1] = y + nuclide_w;
      coords[3][0] = x;             coords[3][1] = y + nuclide_w;
      
    // Element out of focus: mini periodic table
    } else {
      if (protons == 0){ return coords; }
      int x = getX(element);
      int y = getY(element);
      coords[0][0] = x;     coords[0][1] = y;
      coords[1][0] = x + w; coords[1][1] = y;
      coords[2][0] = x + w; coords[2][1] = y + w;
      coords[3][0] = x;     coords[3][1] = y + w;
    }
    
    return coords;
    
  }
  
  int getX(Element element){
    if (element._group > 18){
      return (element._group - 16) * w + 2*margin + total_w - w;
    } else if (element._group == 0) {
      return -1 * w;
    } else {
      return element._group * w + 2*margin + total_w - w;
    }
  }
  
  int getY(Element element){
    if (element._group > 18){
      return (element._period + 3) * w + height - (margin + 11 * w);
    } else {
      return element._period * w + height - (margin + 11 * w);
    }
  }
}

void createLayouts(){
  layouts.clear();
  layouts.put("standard",    new StandardLayout());
  layouts.put("periodic",    new PeriodicLayout());
  layouts.put("periodic2",   new Periodic2Layout());
  layouts.put("periodicdetailed", new PeriodicDetailedLayout());
  layouts.put("crunched",    new CrunchedLayout());
  layouts.put("stacked",     new StackedLayout());
  layouts.put("radial",      new RadialLayout());
  layouts.put("oneelement",  new OneElementLayout());
  layouts.put("linear",      new RegressionLayout(regressionType.LINEAR));
  layouts.put("poly2",       new RegressionLayout(regressionType.POLY2));
  layouts.put("poly3",       new RegressionLayout(regressionType.POLY3));
  layouts.put("logarithmic", new RegressionLayout(regressionType.LOGARITHMIC));
  layouts.put("exponential", new RegressionLayout(regressionType.EXPONENTIAL));
  layouts.put("power",       new RegressionLayout(regressionType.POWER));
}

