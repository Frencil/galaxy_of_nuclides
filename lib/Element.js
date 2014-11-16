function Element (protons, period, group, symbol, name) { 

  this.protons = parseInt(protons);
  this.period  = parseInt(period);
  this.group   = parseInt(group);
  this.symbol  = symbol;
  this.name    = name;
  
  this.nuclide_count = 0;
  this.min_neutrons = null;
  this.max_neutrons = null;
  this.stablest_neutrons = null;

  this.smallest_stable_neutrons = null;
  this.largest_stable_neutrons  = null;
  
  this.is_highlighted = false;
  this.show_img_credit = true;

  this.nuclides = new Object();
  
  this.addNuclide = function(nuclide) {

    nuclide.index = Object.keys(this.nuclides).length;

    this.nuclides[nuclide.neutrons] = nuclide;
    this.nuclides[nuclide.neutrons].parentElement = this;

    if (Object.keys(this.nuclides).length == 1){
      this.min_neutrons = nuclide.neutrons;
      this.max_neutrons = nuclide.neutrons;
      this.stablest_neutrons = nuclide.neutrons;
    } else {
      this.min_neutrons = Math.min(this.min_neutrons, nuclide.neutrons);
      this.max_neutrons = Math.max(this.max_neutrons, nuclide.neutrons);
      if (nuclide.isStable || (nuclide.halflife.exponent > this.nuclides[this.stablest_neutrons].halflife.exponent)){
        this.stablest_neutrons = nuclide.neutrons;
      }
      if (nuclide.isStable){
        if (null == this.smallest_stable_neutrons || null == this.largest_stable_neutrons){
          this.smallest_stable_neutrons = nuclide.neutrons;
          this.largest_stable_neutrons  = nuclide.neutrons;
        } else {
          if (nuclide.neutrons < this.smallest_stable_neutrons) this.smallest_stable_neutrons = nuclide.neutrons;
          if (nuclide.neutrons > this.largest_stable_neutrons)  this.largest_stable_neutrons = nuclide.neutrons;
        }
      }
    }

    // local values
    this.nuclide_count++;

    // global values
    window.matter.max_neutron_spread    = Math.max(this.max_neutrons - this.min_neutrons, window.matter.max_neutron_spread);
    window.matter.absolute_max_neutrons = Math.max(this.max_neutrons, window.matter.absolute_max_neutrons);
    window.matter.max_nuclides_per_element = Math.max(window.matter.max_nuclides_per_element, Object.keys(this.nuclides).length);
  }

}
