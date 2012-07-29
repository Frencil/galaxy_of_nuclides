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
    
    int metric_exponent = 0;
    int base_exponent   = 0;
    int base_value      = 0;
    metric_exponent = 3 * floor( (exponent-(exponent > 0 ? 0 : 2)) / 3 );
    base_exponent   = exponent - metric_exponent;
    base_value      = int( base * pow(10, base_exponent) );
    
    String prefix     = "";
    String comparison = "";
    switch (metric_exponent){
      case -24:
        prefix = "yocto";
        switch (base_exponent){ case 0: comparison = "a quadrillionth of a billionth of a second"; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -21:
        prefix = "zepto";
        switch (base_exponent){ case 0: comparison = "a trillionth of a billionth of a second"; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -18:
        prefix = "atto";
        switch (base_exponent){ case 0: comparison = "a billionth of a billionth of a second"; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -15:
        prefix = "femto";
        switch (base_exponent){ case 0: comparison = "a quadrillionth of a second"; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -12:
        prefix = "pico";
        switch (base_exponent){ case 0: comparison = "a trillionth of a second"; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -9:
        prefix = "nano";
        switch (base_exponent){ case 0: comparison = "one cycle on a 1GHz CPU"; break;
                                case 1: comparison = "about how long it takes light to travel ten feet"; break;
                                case 2: comparison = ""; break; }
        break;
      case -6:
        prefix = "micro";
        switch (base_exponent){ case 0: comparison = ""; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = ""; break; }
        break;
      case -3:
        prefix = "milli";
        switch (base_exponent){ case 0: comparison = ""; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = "the blink of an eye"; break; }
        break;
      case 0:
        switch (base_exponent){ case 0: comparison = ""; break;
                                case 1: comparison = ""; break;
                                case 2: comparison = "about a minute and a half"; break; }
        break;
      case 3:
        prefix = "Kilo";
        switch (base_exponent){ case 0: comparison = "about 17 minutes"; break;
                                case 1: comparison = "about 3 hours"; break;
                                case 2: comparison = "about 27 hours"; break; }
        break;
      case 6:
        prefix = "Mega";
        switch (base_exponent){ case 0: comparison = "about 11.5 days"; break;
                                case 1: comparison = "about 4 months"; break;
                                case 2: comparison = "about 3 years"; break; }
        break;
      case 9:
        prefix = "Giga";
        switch (base_exponent){ case 0: comparison = "about 32 years"; break;
                                case 1: comparison = "about 320 years"; break;
                                case 2: comparison = "about 3,200 years"; break; }
        break;
      case 12:
        prefix = "Tera";
        switch (base_exponent){ case 0: comparison = "about 32,000 years"; break;
                                case 1: comparison = "about 320,000 years"; break;
                                case 2: comparison = "about 3.2 million years"; break; }
        break;
      case 15:
        prefix = "Peta";
        switch (base_exponent){ case 0: comparison = "about 32 million years"; break;
                                case 1: comparison = "about 320 million years"; break;
                                case 2: comparison = "about 3.2 billion years"; break; }
        break;
      case 18:
        prefix = "Exa";
        switch (base_exponent){ case 0: comparison = "about 32 billion years"; break;
                                case 1: comparison = "about 320 billion years"; break;
                                case 2: comparison = "about 3.2 trillion years"; break; }
        break;
      case 21:
        prefix = "Zetta";
        switch (base_exponent){ case 0: comparison = "about 32 trillion years"; break;
                                case 1: comparison = "about 320 trillion years"; break;
                                case 2: comparison = "about 3.2 quadrillion years"; break; }
        break;
      case 24:
        prefix = "Yotta";
        switch (base_exponent){ case 0: comparison = "about 32 quadrillion years"; break;
                                case 1: comparison = "about 320 quadrillion years"; break;
                                case 2: comparison = "about 3.2 quintillion years"; break; }
        break;
      // NOTE: SI prefixes end at 24. To proceed we use Jim Blower's proposed extended system
      // Details: http://jimvb.home.mindspring.com/unitsystem.htm
      case 27:
        prefix = "Xona";
        switch (base_exponent){ case 0: comparison = "about 32 quintillion years"; break;
                                case 1: comparison = "about 320 quintillion years"; break;
                                case 2: comparison = "about 3.2 sextillion years"; break; }
        break;
      case 30:
        prefix = "Weka";
        switch (base_exponent){ case 0: comparison = "about 32 sextillion years"; break;
                                case 1: comparison = "about 320 sextillion years"; break;
                                case 2: comparison = "about 3.2 septillion years"; break; }
        break;
      case 33:
        prefix = "Vunda";
        switch (base_exponent){ case 0: comparison = "about 32 septillion years"; break;
                                case 1: comparison = "about 320 septillion years"; break;
                                case 2: comparison = "about 3.2 octillion years"; break; }
        break;
      case 36:
        prefix = "Uda";
        switch (base_exponent){ case 0: comparison = "about 32 octillion years"; break;
                                case 1: comparison = "about 320 octillion years"; break;
                                case 2: comparison = "about 3.2 nonillion years"; break; }
        break;
    }
    
    String label = "";
    if (exponent <= (min_halflife_exp-1)) {
      label = "None";
    } else if (exponent >= (max_halflife_exp+6)) {
      label = "Infinity";
    } else {
      label = base_value + " " + prefix + "second" + (base_value > 1 ? "s" : "")
            + " (" + int(base) + " * 10 ^ " + exponent + " s)"
            + (comparison.length() > 0 ? " ..." + comparison : "");
    }

    return label;
    
  }
  
}
