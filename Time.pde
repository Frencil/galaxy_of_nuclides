class Time {
  
  float base;
  int exponent;
  
  Time (float tempBase, int tempExp) {
    base = tempBase;
    exponent = tempExp;
  }
  
  void setBase(float tempBase) {
    base = tempBase;
  }
  
  void setExp(int tempExp) {
    exponent = tempExp;
  }
  
  String humanReadable() {
    String label = int(base) + " * 10 ^ " + exponent + " second(s)";
    return label;
  }
  
}
