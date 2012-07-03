class Transition {
  
  int percentage;
  Layout destination;
  
  Transition(Layout tempDestination) {
    destination = tempDestination;
    percentage  = 0;
  }
  
  void stepForward(int increment) {
    percentage = min(percentage + increment, 100);
  }
  
  void stepBackward(int increment) {
    percentage = max(percentage - increment, 0);
  }
  
}

