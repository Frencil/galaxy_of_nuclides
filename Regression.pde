class Regression {
  
  RegressionType type;
  
  Regression (RegressionType tempType){
    type = tempType;
  }
  
  int Eval (int x) {
    int n = 0;
    switch (type){
      case LINEAR:
        n = EvalLinear(x);
        break;
      case POLY2:
        n =  EvalPoly2(x);
        break;
      case POLY3:
        n = EvalPoly3(x);
        break;
      case EXPONENTIAL:
        n = EvalExponential(x);
        break;
      case LOGARITHMIC:
        n = EvalLogarithmic(x);
        break;
      case POWER:
        n = EvalPower(x);
        break;
    }
    return n;
  }

  int EvalLinear (int x) {
    float m = 1.5579841625541;
    float b = -8.062411171936;
    int n = round ( m * x + b );
    return n;
  }

  int EvalPoly2 (int x) {
    float a0 = -0.8356674934696;
    float a1 = 1.1013363059019;
    float a2 = 0.0052628789269973;
    int n = round( a0 + (a1 * x) + (a2 * pow(x, 2)) );
    return n;
  }

  int EvalPoly3 (int x) {
    float a0 = 2.7742798847648;
    float a1 = 0.81503089853493;
    float a2 = 0.014685243545127;
    float a3 = -0.00006457907962362;
    int n = round( a0 + (a1 * x) + (a2 * pow(x, 2)) + (a3 * pow(x, 3)) );
    return n;
  }

  int EvalLogarithmic (int x) {
    float a = -74.297445644351;
    float b = 37.945848666262;
    int n = round ( a + b * log(x) );
    return n;
  }

  int EvalExponential (int x) {
    float a = 16.140855744843;
    float b = 0.026504006698953;
    int n = round ( a * exp(b * x) );
    return n;
  }

  int EvalPower (int x) {
    float a = 0.3354393407993;
    float b = 1.3656836137485;
    int n = round ( a * pow(x, b) );
    return n;
  }
  
}
