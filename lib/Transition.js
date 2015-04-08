"use strict";

var transition = {

    // Fire: pass a new layout to this function to trigger a transition
    fire: function(new_layout){

        if (display.in_transition){
            console.log("in transition, ignoring request");
            return;
        }
        if (display.current_layout == new_layout){
            console.log("requested transition to current layout, ignoring request");
            return;
        }

        console.log("transitioning: " + display.current_layout + " to " + new_layout);
        d3.select("#main_control").text("Transitioning: " + display.current_layout + " to " + new_layout);
        display.in_transition = true;
        
        (function(new_layout){
            var y = display.regions.nav.regions[new_layout].y * display.scale;
            d3.select("#nav_brackets").transition()
                .delay(500)
                .duration(2000)
                .attr("transform", "translate(0, " + y + "), scale(" + display.scale + ")");
            transition[display.current_layout][new_layout](function(){
                console.log(new_layout);
                display.current_layout = new_layout;
                display.in_transition  = false;
                d3.select("#main_control").text("Ready.")
            });
        })(new_layout);

    },
    
    // Special transition function for switching between focused elements in the Element Detail layout
    element_detail_change_focus: function(new_element_focus){

        if (display.in_transition){
            console.log("in transition, ignoring request");
            return;
        }

        if (new_element_focus == display.element_detail_focus){
            console.log("requested change of element focus to current focus, ignoring request");
            return;
        }

    },

    // Helper function to move info boxes between layouts
    // All layouts have two info boxes and all transitions start by hiding them.
    // This should fire when the info boxes are hidden and finish any time before they're shown again.
    moveInfoBoxes: function(target){
        var info_transition = d3.select("svg").transition().delay(1000);
        info_transition.select("#info1")
            .attr("x", display.layouts[target].info1.x * display.scale)
            .attr("y", display.layouts[target].info1.y * display.scale)
            .attr("width", display.layouts[target].info1.w * display.scale)
            .attr("height", display.layouts[target].info1.h * display.scale)
        info_transition.select("#info2")
            .attr("x", display.layouts[target].info2.x * display.scale)
            .attr("y", display.layouts[target].info2.y * display.scale)
            .attr("width", display.layouts[target].info2.w * display.scale)
            .attr("height", display.layouts[target].info2.h * display.scale)
    },

    // Transitions from Periodic Table...
    periodic_table: {

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);
            hide_detail.selectAll("text.element_display").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('chart_of_nuclides');

            // Make nuclides appear
            var show_nuclides = d3.select("svg").transition().delay(500).duration(500);
            show_nuclides.selectAll(".nuclide_display").style("opacity",1);

            // Loop through elements (total duration: ~4000)
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Hide the element rect
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay(1000 + 16 * element.protons).duration(100)
                    .style("opacity",0);

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display").filter(".e" + element.protons).transition()
                    .delay(1100 + 16 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display").filter(".e" + element.protons).transition()
                    .delay(1100 + 16 * element.protons).duration(2000)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5000).duration(500)
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);

            setTimeout(function(){ callback(); }, 6000);

        },

        // ...to Element Detail
        element_detail: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.element_detail_focus == null){
                display.element_detail_focus = Math.ceil(Math.random() * (matter.elements.length-1));
            }

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);
            hide_detail.selectAll("text.element_display").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('element_detail');

            // Move all non-focused elements to element detail periodic table positions
            d3.selectAll("g.element_display").filter("*:not(.e" + display.element_detail_focus + ")").transition()
                .delay(500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter("*:not(.e" + display.element_detail_focus + ")").transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);                

            // Show focused nuclides
            d3.selectAll("g.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(500).duration(500)
                .style("opacity",1);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getNuclideX(d);
                    var y = display.layouts.element_detail.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Point image container at correct image file and fade in
            var image_url = "images/elements/no_image.jpg";
            if (matter.elements[display.element_detail_focus].has_image){
                image_url = "images/elements/" + display.element_detail_focus + ".jpg";
            }
            d3.select("#element_detail_image").attr("xlink:href",image_url);
            d3.select("#element_detail_image").transition()
                .delay(3000).duration(2000).style("opacity", 1);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5000).duration(500)
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);

            setTimeout(function(){ callback(); }, 6000);

        },

    },

    // Transitions from Chart of Nuclides...
    chart_of_nuclides: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('periodic_table');

            // Loop through elements (total duration: ~4000)
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display").filter(".e" + element.protons).transition()
                    .delay(500 + 16 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getNuclideX(d);
                        var y = display.layouts.periodic_table.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display").filter(".e" + element.protons).transition()
                    .delay(500 + 16 * element.protons).duration(2000)
                    .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                    .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

                // Show the element rect
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay(2500 + 16 * element.protons).duration(100)
                    .style("opacity",1);

            }

            // Hide nuclides
            var hide_nuclides = d3.select("svg").transition().delay(5000).duration(500);
            hide_nuclides.selectAll(".nuclide_display").style("opacity",0);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5500).duration(500)
            show_detail.selectAll("text.element_display").style("opacity",1);
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);
            
            setTimeout(function(){ callback(); }, 6000);

        },

        // ...to Element Detail
        element_detail: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.element_detail_focus == null){
                display.element_detail_focus = Math.ceil(Math.random() * (matter.elements.length-1));
            }

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);

            // Reposition info boxes
            transition.moveInfoBoxes('element_detail');

            // Move/scale hidden elements into position and fade them in
            d3.selectAll("g.element_display").transition()
                .delay(0).duration(100)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(0).duration(100)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);    
            d3.selectAll("g.element_display").transition()
                .delay(500).duration(1000)
                .style("opacity", 1);

            // Loop up the chart hiding all non-focused elements
            for (var e in matter.elements){
                var element = matter.elements[e];
                if (e == 0 || e == display.element_detail_focus){
                    continue;
                }
                d3.selectAll("g.nuclide_display").filter(".e" + element.protons).transition()
                    .delay(1000 + 16 * element.protons).duration(1000)
                    .style("opacity", 0);
            }
            
            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(2500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getNuclideX(d);
                    var y = display.layouts.element_detail.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(2500).duration(2000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(2500).duration(2000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(2500).duration(2000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Point image container at correct image file and fade in
            var image_url = "images/elements/no_image.jpg";
            if (matter.elements[display.element_detail_focus].has_image){
                image_url = "images/elements/" + display.element_detail_focus + ".jpg";
            }
            d3.select("#element_detail_image").attr("xlink:href",image_url);
            d3.select("#element_detail_image").transition()
                .delay(4000).duration(1000).style("opacity", 1);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(4500).duration(500)
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);

            setTimeout(function(){ callback(); }, 6000);

        },

    },

    // Transitions from Element Detail...
    element_detail: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Hide details like info boxes etc.
            var hide_detail = d3.select("svg").transition().duration(500);
            hide_detail.select("#info1").style("opacity",0);
            hide_detail.select("#info2").style("opacity",0);
            hide_detail.select("#element_detail_image").style("opacity", 0);

            // Reposition info boxes
            transition.moveInfoBoxes('periodic_table');

            // Fade in the focused element and fade out the focused nuclides
            d3.selectAll("g.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(500).duration(500)
                .style("opacity",1);
            d3.selectAll("g.nuclide_display").filter(".e" + display.element_detail_focus).transition()
                .delay(500).duration(500)
                .style("opacity",0);

            // Replace focused element in the table with the others
            d3.selectAll("g.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter(".e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Scale up the periodic table to its full size and position
            d3.selectAll("g.element_display").transition()
                .delay(3000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getElementX(d);
                    var y = display.layouts.periodic_table.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(3000).duration(2000)
                .attr("width", display.layouts.periodic_table.element.w * display.scale)
                .attr("height", display.layouts.periodic_table.element.w * display.scale);

            // Show details like info boxes etc.
            var show_detail = d3.select("svg").transition().delay(5000).duration(500)
            show_detail.selectAll("text.element_display").style("opacity",1);
            show_detail.select("#info1").style("opacity",1);
            show_detail.select("#info2").style("opacity",1);
            
            setTimeout(function(){ callback(); }, 6000);

        },

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

        },

    },

};
