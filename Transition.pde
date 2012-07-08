class Transition {
  
  int percentage;
  Layout source;
  Layout target;
  
  Transition(Layout tempSource) {
    source = tempSource;
    percentage = 0;
  }
  
  void addTarget(Layout tempTarget) {
    target = tempTarget;
  }
  
  void reset() {
    percentage = 0;
  }
  
  void stepForward(int increment) {
    percentage = min(percentage + increment, 100);
    if (percentage == 100) {
      source = target;
    }
  }
  
  void stepBackward(int increment) {
    percentage = max(percentage - increment, 0);
  }
  
  int weightedAverage(int tempSourceVal, int tempTargetVal) {
    float perc      = (float) percentage / 100;
    float sourceVal = (float) tempSourceVal * (1 - perc);
    float targetVal = (float) tempTargetVal * perc;
    return round (sourceVal + targetVal);
  }
  
  int getWidth() {
    if (percentage == 0 || percentage == 100){
      return source.getWidth();
    } else {
      return weightedAverage(source.getWidth(), target.getWidth());
    }
  }
  
  int getHeight() {
    if (percentage == 0 || percentage == 100){
      return source.getHeight();
    } else {
      return weightedAverage(source.getHeight(), target.getHeight());
    }
  }
  
  int getXpos(int protons, int neutrons) {
    if (percentage == 0 || percentage == 100){
      return source.getXpos(protons, neutrons);
    } else {
      return weightedAverage(source.getXpos(protons, neutrons), target.getXpos(protons, neutrons));
    }
  }
  
  int getYpos(int protons, int neutrons) {
    if (percentage == 0 || percentage == 100){
      return source.getYpos(protons, neutrons);
    } else {
      return weightedAverage(source.getYpos(protons, neutrons), target.getYpos(protons, neutrons));
    }
  }
  
}

