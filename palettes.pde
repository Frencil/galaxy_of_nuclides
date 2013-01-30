void color_element_Cyan_to_Orange (int e) {
  float relative_nuclides = map(elements[e].nuclides.length, 1, max_nuclides_per_element, -1, 1);
  color base_c = color(35, 0, 85);
  color hlgt_c = color(35, 0, 95);
  if (relative_nuclides < 0){
    base_c = color(35, map(relative_nuclides, -0.4, 0, 99, 0),
                       map(relative_nuclides,  -1, 0, 25, 85)  );
    hlgt_c = color(35, map(relative_nuclides, -0.4, 0, 50, 0),
                       map(relative_nuclides,  -1, 0, 30, 95)  );
  } else {
    base_c = color(180, map(relative_nuclides, 0.4, 1, 0, 80),
                        map(relative_nuclides,  0, 1, 85, 40)   );
    hlgt_c = color(180, map(relative_nuclides, 0.4, 1, 0, 40),
                        map(relative_nuclides,  0, 1, 95, 45));
  }
  elements[e].base_c = base_c;
  elements[e].hlgt_c = hlgt_c;
}

void color_nuclide_Cyan_to_Orange (int e, int n) {
  color base_c = color(35,0,100);
  color hlgt_c = color(35,0,100);
  if (!elements[e].nuclides[n].isStable){
    float relative_nuclides = map(elements[e].nuclides.length, 1, max_nuclides_per_element, -1, 1);
    float base_c_hue = 35;
    if (relative_nuclides >= 0){ base_c_hue = 180; }
    float base_c_sat = map(elements[e].nuclides[n].halfLife.exponent * -1, min_halflife_exp, max_halflife_exp, 0, 100);
    float base_c_lgt = map(elements[e].nuclides[n].halfLife.exponent, min_halflife_exp, max_halflife_exp, 20, 100);
    float hlgt_c_lgt = map(base_c_lgt, 20, 100, 50, 100);
    if (relative_nuclides > -0.4 && relative_nuclides < 0){
      base_c_sat = base_c_sat * map(relative_nuclides, -0.4, 0, 1, 0.2);
    } else if (relative_nuclides >= 0 && relative_nuclides < 0.4){
      base_c_sat = base_c_sat * map(relative_nuclides, 0, 0.4, 0.2, 1);
    }
    base_c = color(base_c_hue, base_c_sat, base_c_lgt);
    hlgt_c = color(base_c_hue, base_c_sat, hlgt_c_lgt);
  }
  elements[e].nuclides[n].base_c = base_c;
  elements[e].nuclides[n].hlgt_c = hlgt_c;
}

void color_element_Rainbow (int e) {
  int bright_sum = 0;
  int sat_sum    = 0;
  int elem_hue   = 0;
  for (int n = 0; n < elements[e].nuclides.length; n++) {
    if (!elements[e].nuclides[n].isStable){
      elem_hue = round(hue(elements[e].nuclides[n].base_c));
    }
    bright_sum += brightness(elements[e].nuclides[n].base_c);
    sat_sum    += saturation(elements[e].nuclides[n].base_c);
  }
  int avg_s = round(sat_sum/elements[e].nuclides.length);
  int avg_b = round(bright_sum/elements[e].nuclides.length);
  elements[e].base_c = color(elem_hue, avg_s, avg_b);
  elements[e].hlgt_c = color(elem_hue, avg_s, round(map(avg_b, 20, 100, 50, 100)));
}

void color_nuclide_Rainbow (int e, int n) {
  elements[e].nuclides[n].base_c = color(0,0,100);
  elements[e].nuclides[n].hlgt_c = color(0,0,100);
  if (!elements[e].nuclides[n].isStable){
    int base_c_hue = round(map(elements[e].nuclides[n].protons, 0, absolute_max_protons, 0, 360));
    int base_c_sat = round(map(elements[e].nuclides[n].halfLife.exponent * -1, min_halflife_exp, max_halflife_exp, 0, 100));
    int base_c_lgt = round(map(elements[e].nuclides[n].halfLife.exponent, min_halflife_exp, max_halflife_exp, 20, 100));
    int hlgt_c_lgt = round(map(base_c_lgt, 20, 100, 50, 100));
    elements[e].nuclides[n].base_c = color(base_c_hue, base_c_sat, base_c_lgt);
    elements[e].nuclides[n].hlgt_c = color(base_c_hue, base_c_sat, hlgt_c_lgt);
  }
}
