interface Layout {
  int getWidth();
  int getHeight();
  int getXpos(int protons, int neutrons);
  int getYpos(int protons, int neutrons);
  
}

// Standard
class StandardLayout implements Layout {
  
  int getWidth() {
    return 4;
  }
  
  int getHeight() {
    return 4;
  }
  
  int getXpos(int protons, int neutrons) {
   return (neutrons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
   return height - (protons * getHeight()) - (2 * marginTop);
  }
  
}

// Periodic
class PeriodicLayout implements Layout {
  
  int getWidth() {
    return 40;
  }
  
  int getHeight() {
    return 40;
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
  
  int getWidth() {
    return 23;
  }
  
  int getHeight() {
    return 36;
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
  
  int getWidth() {
    return 6;
  }
  
  int getHeight() {
    return 4;
  }
  
  int getXpos(int protons, int neutrons) {
   return (protons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
   return (width/2) + ((protons - neutrons) * getHeight());
  }
  
}

// Regression
class RegressionLayout implements Layout {
  
  Regression reg;
  
  RegressionLayout (RegressionType tempType){
    reg = new Regression(tempType);
  }
  
  int getWidth() {
    return 6;
  }
  
  int getHeight() {
    return 4;
  }
  
  int getXpos(int protons, int neutrons) {
   return (protons * getWidth());
  }
  
  int getYpos(int protons, int neutrons) {
   return (height/2) + ((reg.Eval(protons) - neutrons) * getHeight());
  }
  
}


void createLayouts(){
  layouts.put("standard",    new StandardLayout());
  layouts.put("periodic",    new PeriodicLayout());
  layouts.put("periodic2",   new Periodic2Layout());
  layouts.put("crunched",    new CrunchedLayout());
  layouts.put("linear",      new RegressionLayout(regressionType.LINEAR));
  layouts.put("poly2",       new RegressionLayout(regressionType.POLY2));
  layouts.put("poly3",       new RegressionLayout(regressionType.POLY3));
  layouts.put("logarithmic", new RegressionLayout(regressionType.LOGARITHMIC));
  layouts.put("exponential", new RegressionLayout(regressionType.EXPONENTIAL));
  layouts.put("power",       new RegressionLayout(regressionType.POWER));
}

