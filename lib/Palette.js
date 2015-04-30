"use strict";

/*
   Define Palette Class
   Palette contains all color mapping information for all data sets
*/

var Palette = function() {

    this.schemes = {

        // Light yellow to dark green (sequential)
        element: [ { h: 60, s: 100, l: 94.9 },
                   { h: 64, s: 91.8, l: 85.7 },
                   { h: 78, s: 72, l: 79 },
                   { h: 96, s: 53.7, l: 71.2 },
                   { h: 121, s: 40.6, l: 62.4 },
                   { h: 136, s: 44.9, l: 46.3 },
                   { h: 140, s: 58.1, l: 32.7 },
                   { h: 152, s: 100, l: 20.4 },
                   { h: 156, s: 100, l: 13.5 } ],

        // Dark cyan to dark orange through light gray (diverging)
        nuclide: [ { h: 177, s: 100, l: 11.8 },
                   { h: 176, s: 97.9, l: 18.8 },
                   { h: 175, s: 56.6, l: 34.3 },
                   { h: 173, s: 37.1, l: 54.5 },
                   { h: 171, s: 44.4, l: 73.9 },
                   { h: 100, s: 33.3, l: 91.2 },
                   { h: 43, s: 64.4, l: 76.9 },
                   { h: 38, s: 56.7, l: 59.2 },
                   { h: 34, s: 66.4, l: 42 },
                   { h: 33, s: 87.2, l: 27.6 },
                   { h: 33, s: 88.8, l: 17.5 } ]
    }

};

Palette.prototype.map_range = function(value, low1, high1, low2, high2){
    if (high1 == low1){ return low2; }
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};
 
Palette.prototype.hsla = function(color){
    return "hsla(" + color.h + "," + color.s + "%," + color.l + "%," + color.a + ")";
};

Palette.prototype.getColor = function(value, alpha, scheme){
    var stops = this.schemes[scheme];
    var low_index = Math.floor(value * (stops.length - 1));
    var high_index = Math.ceil(value * (stops.length - 1));
    return { h: this.map_range(value, 0, 1, stops[low_index].h, stops[high_index].h),
             s: this.map_range(value, 0, 1, stops[low_index].s, stops[high_index].s),
             l: this.map_range(value, 0, 1, stops[low_index].l, stops[high_index].l),
             a: alpha };
};

Palette.prototype.element = function(d){
    var relative_nuclides = this.map_range(d.nuclide_count,
                                           matter.min_nuclides_per_element, matter.max_nuclides_per_element,
                                           0, 1);
    return this.hsla(this.getColor(relative_nuclides, 1, 'element'));
};

Palette.prototype.nuclide = function(d){
    var scale_position = Math.min( (d.halflife.exponent + d.halflife.base/10), matter.max_halflife_exp );
    if (d.isStable){ scale_position = matter.max_halflife_exp; }
    var relative_halflife = this.map_range(scale_position,
                                           matter.min_halflife_exp, matter.max_halflife_exp,
                                           0, 1);
    var alpha = 1;
    if (display.elapsed_time_exp != null && !d.isStable){
        if (d.halflife.exponent == display.elapsed_time_exp){
            alpha = 0.5;
        } else if (display.elapsed_time_exp > d.halflife.exponent){
            alpha = 0;
        }
    }
    return this.hsla(this.getColor(relative_halflife, alpha, 'nuclide'));
};

Palette.prototype.nuclideLabel = function(d){
    var color = "rgb(0,0,0)";
    if (display.elapsed_time_exp != null && !d.isStable){
        if (d.halflife.exponent == display.elapsed_time_exp){
            color = "rgb(255,255,255)";
        } else if (display.elapsed_time_exp > d.halflife.exponent){
            color = "rgb(127,127,127)";
        }
    }
    return color;
};
