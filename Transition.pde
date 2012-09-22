class Transition {
  
  int percentage;
  Layout source;
  Layout target;
  
  int source_focus_protons = -1;
  int target_focus_protons = -1;
  
  Transition(Layout tempSource) {
    source = tempSource;
    percentage = 0;
  }
  
  void addTarget(Layout tempTarget, int tempFocusProtons) {
    target               = tempTarget;
    target_focus_protons = tempFocusProtons;
  }
  
  void reset() {
    percentage = 0;
  }
  
  void force() {
    percentage = 100;
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
   
  int[][] getCoords(int protons, int neutrons) {
    if (percentage == 0 || percentage == 100){
      return source.getCoords(protons, neutrons);
    } else {
      int[][] coords = { {0, 0}, {0, 0}, {0, 0}, {0, 0} };
      int[][] sourceCoords = source.getCoords(protons, neutrons);
      int[][] targetCoords = target.getCoords(protons, neutrons);
      for (int r = 0; r < 4; r = r+1) {
        for (int c = 0; c < 2; c = c+1) {
          coords[r][c] = weightedAverage(sourceCoords[r][c], targetCoords[r][c]);
        }
      }
      return coords;
    }
  }
  
}

