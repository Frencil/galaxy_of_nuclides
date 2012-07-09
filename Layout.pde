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
   return (neutrons * getWidth()) + 20;
  }
  
  int getYpos(int protons, int neutrons) {
   return height - ((protons * getHeight()) + 20);
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
   return (protons * getWidth()) + 20;
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
   return (protons * getWidth()) + 20;
  }
  
  int getYpos(int protons, int neutrons) {
   return (height/2) + ((reg.Eval(protons) - neutrons) * getHeight());
  }
  
}

void createLayouts(){
  layouts.put("standard",    new StandardLayout());
  layouts.put("crunched",    new CrunchedLayout());
  layouts.put("linear",      new RegressionLayout(regressionType.LINEAR));
  layouts.put("poly2",       new RegressionLayout(regressionType.POLY2));
  layouts.put("poly3",       new RegressionLayout(regressionType.POLY3));
  layouts.put("logarithmic", new RegressionLayout(regressionType.LOGARITHMIC));
  layouts.put("exponential", new RegressionLayout(regressionType.EXPONENTIAL));
  layouts.put("power",       new RegressionLayout(regressionType.POWER));
}

