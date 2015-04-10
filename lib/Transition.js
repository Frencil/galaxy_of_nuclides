"use strict";

var transition = {

    // Fire: pass a new layout to this function to trigger a transition
    fire: function(new_layout, element_detail_focus){

        if (display.in_transition){
            console.log("in transition, ignoring request");
            return;
        }

        if (display.current_layout == new_layout && display.current_layout != 'element_detail'){
            console.log("requested transition to current layout, ignoring request");
            return;
        }

        if (typeof element_detail_focus !== undefined && new_layout == 'element_detail'){
            display.next_element_detail_focus = element_detail_focus;
        }

        console.log("transitioning: " + display.current_layout + " to " + new_layout);
        d3.select("#main_control").text("Transitioning: " + display.current_layout + " to " + new_layout);
        display.in_transition = true;
        
        (function(new_layout){
            var y = display.regions.nav.regions[new_layout].y * display.scale;
            d3.select("#highlight_brackets").transition()
                .delay(500)
                .duration(2000)
                .attr("transform", "translate(0, " + y + ")");
            transition[display.current_layout][new_layout](function(){
                console.log(new_layout);
                display.current_layout = new_layout;
                display.in_transition  = false;
                d3.select("#main_control").text("Ready.")
            });
        })(new_layout);

    },

    set_image: function(protons){
        var image_url = "images/elements/no_image.jpg";
        if (typeof matter.elements[protons] == "object"){
            if (matter.elements[protons].has_image){
                image_url = "images/elements/" + protons + ".jpg";
            }
        }
        d3.select("#image").attr("xlink:href",image_url);
    },

    // Helper function to move info boxes between layouts
    // All layouts have two info boxes and all transitions start by hiding them.
    // This should fire when the info boxes are hidden and finish any time before they're shown again.
    moveInfoBoxes: function(target, fade_in_delay, reset_element_focus){

        d3.selectAll(".info").transition()
            .duration(500).style("opacity",0);

        d3.selectAll(".info").transition()
            .delay(fade_in_delay + 100).duration(500).style("opacity",1);

        setTimeout(
            (function(target, reset_element_focus){
                d3.select("#info1")
                    .attr("x", display.layouts[target].info1.x * display.scale)
                    .attr("y", display.layouts[target].info1.y * display.scale)
                    .attr("width", display.layouts[target].info1.w * display.scale)
                    .attr("height", display.layouts[target].info1.h * display.scale);
                d3.select("#info2")
                    .attr("x", display.layouts[target].info2.x * display.scale)
                    .attr("y", display.layouts[target].info2.y * display.scale)
                    .attr("width", display.layouts[target].info2.w * display.scale)
                    .attr("height", display.layouts[target].info2.h * display.scale);
                d3.select("#image")
                    .attr("x", display.layouts[target].image.x * display.scale)
                    .attr("y", display.layouts[target].image.y * display.scale)
                    .attr("width", display.layouts[target].image.w * display.scale)
                    .attr("height", display.layouts[target].image.h * display.scale)
                if (typeof reset_element_focus !== undefined && reset_element_focus){
                    display.next_element_detail_focus = null;
                    display.element_detail_focus = null;
                    transition.set_image(null);
                }
            })(target, reset_element_focus), fade_in_delay);

    },

    // Transitions from Periodic Table...
    periodic_table: {

        // ...to Periodic Table (do nothing)
        periodic_table: function(callback){
            callback();
        },

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

            transition.moveInfoBoxes('chart_of_nuclides', 10500, true);

            // Hide element labels
            d3.select("svg").transition().duration(500).
                selectAll("text.element_display").style("opacity",0);

            // Make nuclides appear
            var show_nuclides = d3.select("svg").transition().delay(500).duration(500);
            show_nuclides.selectAll(".nuclide_display").style("opacity",1);

            // Scale elements to new periodic table position
            d3.selectAll("g.element_display").transition()
                .delay(1000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.chart_of_nuclides.element.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.element.w * display.scale);

            // Scale element hitboxes to new periodic table position
            var w = display.layouts.chart_of_nuclides.element.w + display.layouts.chart_of_nuclides.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(1000).duration(2000)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Scale nuclides to new periodic table position
            d3.selectAll("g.nuclide_display").transition()
                .delay(1000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getTableNuclideX(d);
                    var y = display.layouts.chart_of_nuclides.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.chart_of_nuclides.table_nuclide.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.table_nuclide.w * display.scale);
            
            // Loop through elements
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Translate element's nuclides to correct place and size in the chart
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay(3000 + 64 * element.protons).duration(3000)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay(3000 + 64 * element.protons).duration(3000)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Done
            setTimeout(function(){ callback(); }, 11000);

        },

        // ...to Element Detail
        element_detail: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.next_element_detail_focus == null){
                display.next_element_detail_focus = Math.ceil(Math.random() * (matter.elements.length-1));
            }

            // Reposition info boxes
            transition.moveInfoBoxes('element_detail', 5000);

            // Hide element labels
            d3.select("svg").transition().duration(500).
                selectAll("text.element_display").style("opacity",0);

            // Move all non-focused elements to element detail periodic table positions
            d3.selectAll("g.element_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Scale element hitboxes to new periodic table position
            var w = display.layouts.element_detail.element.w + display.layouts.element_detail.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(500).duration(2000)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Scale nuclides to new periodic table position
            d3.selectAll("g.nuclide_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(1000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Show focused nuclides
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(500).duration(500)
                .style("opacity",1);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d.index);
                    var y = display.layouts.element_detail.getDataNuclideY(d.index);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_element_detail_focus).transition()
                .delay(1500).duration(3000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_element_detail_focus).transition()
                .delay(1500).duration(3000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Point image container at correct image file and fade in
            transition.set_image(display.next_element_detail_focus);

            // Done
            setTimeout(function(){ 
                display.element_detail_focus = display.next_element_detail_focus;
                display.next_element_detail_focus = null;
                callback();
            }, 6000);

        },

    },

    // Transitions from Chart of Nuclides...
    chart_of_nuclides: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Reposition info boxes
            transition.moveInfoBoxes('periodic_table', 11500, true);

            // Loop through elements
            for (var e in matter.elements){

                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }

                // Translate elements to new position and size
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay(1000 + 64 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getElementX(d);
                        var y = display.layouts.periodic_table.getElementY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.element_display.e" + element.protons).transition()
                    .delay(1000 + 64 * element.protons).duration(2000)
                    .attr("width", display.layouts.periodic_table.element.w * display.scale)
                    .attr("height", display.layouts.periodic_table.element.w * display.scale);

                // Translate element hitbox to new position and size
                var w = display.layouts.periodic_table.element.w + display.layouts.periodic_table.element.m;
                d3.selectAll("rect.hitbox.element").transition()
                    .delay(1000 + 64 * element.protons).duration(2000)
                    .attr("width", w * display.scale)
                    .attr("height", w * display.scale)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getElementX(d);
                        var y = display.layouts.periodic_table.getElementY(d);
                        return "translate("+x+","+y+")";
                    });

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay(1000 + 64 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getNuclideX(d);
                        var y = display.layouts.periodic_table.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay(1000 + 64 * element.protons).duration(2000)
                    .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                    .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

            }

            // Hide nuclides
            var hide_nuclides = d3.select("svg").transition().delay(11000).duration(500);
            hide_nuclides.selectAll(".nuclide_display").style("opacity",0);

            // Show element labels
            d3.select("svg").transition().delay(11500).duration(500)
                .selectAll("text.element_display").style("opacity",1);
            
            // Done
            setTimeout(function(){ callback(); }, 12000);

        },

        // ...to Chart of Nuclides (do nothing)
        chart_of_nuclides: function(callback){
            callback();
        },

        // ...to Element Detail
        element_detail: function(callback){

            // In lieu of a set focus element just pick one at psuedo-random
            if (display.next_element_detail_focus == null){
                display.next_element_detail_focus = Math.ceil(Math.random() * (matter.elements.length-1));
            }

            // Reposition info boxes
            transition.moveInfoBoxes('element_detail', 13000);

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(500).duration(1000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(500).duration(1000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Translate element hitboxes into position
            var w = display.layouts.element_detail.element.w + display.layouts.element_detail.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(500).duration(1000)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Loop up the chart translating all non-focused elements to the table and fading them out
            for (var e in matter.elements){
                var element = matter.elements[e];
                if (e == 0 || e == display.next_element_detail_focus){
                    continue;
                }

                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay(1500 + 64 * element.protons).duration(2000)
                    .attr("transform", function(d){
                        var x = display.layouts.element_detail.getTableNuclideX(d);
                        var y = display.layouts.element_detail.getTableNuclideY(d);
                        return "translate("+x+","+y+")";
                    }).transition().duration(1000).style("opacity", 0);
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay(1500 + 64 * element.protons).duration(2000)
                    .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                    .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);
            }
       
            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(11500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d.index);
                    var y = display.layouts.element_detail.getDataNuclideY(d.index);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(11500).duration(2000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_element_detail_focus).transition()
                .delay(11500).duration(2000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_element_detail_focus).transition()
                .delay(11500).duration(2000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Point image container at correct image file
            setTimeout(function(){
                transition.set_image(display.next_element_detail_focus);
            }, 1000);

            // Done
            setTimeout(function(){
                display.element_detail_focus = display.next_element_detail_focus;
                display.next_element_detail_focus = null;
                callback();
            }, 13500);

        },

    },

    // Transitions from Element Detail...
    element_detail: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Reposition info boxes
            transition.moveInfoBoxes('periodic_table', 8000, true);

            // Replace focused element in the table with the others
            d3.select("g.element_display.e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.select("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Move the focused nuclides along with the focused element
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(1000).duration(2000)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

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

            // Translate element hitboxes to full size and position
            var w = display.layouts.periodic_table.element.w + display.layouts.periodic_table.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(3000).duration(2000)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getElementX(d);
                    var y = display.layouts.periodic_table.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Translate all nuclides to periodic table positions and sizes
            d3.selectAll("g.nuclide_display").transition()
                .delay(5000).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getNuclideX(d);
                    var y = display.layouts.periodic_table.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").transition()
                .delay(5000).duration(2000)
                .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

            // Show element labels
            d3.selectAll("text.element_display").transition()
                .delay(5000).duration(500).style("opacity",1);
            
            setTimeout(function(){ callback(); }, 8000);

        },

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

            // Reposition info boxes
            transition.moveInfoBoxes('chart_of_nuclides', 14500, true);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Loop through elements translating all nuclides to chart positions
            for (var e in matter.elements){
                var element = matter.elements[e];
                if (e == 0){
                    continue;
                }
                d3.selectAll("g.nuclide_display.e" + element.protons)
                    .transition().delay(2500 + 64 * element.protons).duration(500)
                    .style("opacity", 1)
                    .transition().delay(3000 + 64 * element.protons).duration(3000)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay(3000 + 64 * element.protons).duration(3000)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(13500).duration(1000)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(13500).duration(1000)
                .attr("width", display.layouts.chart_of_nuclides.element.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.element.w * display.scale);

            // Translate element hitboxes into position
            var w = display.layouts.chart_of_nuclides.element.w + display.layouts.chart_of_nuclides.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(13500).duration(1000)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Done
            setTimeout(function(){ callback(); }, 14500);

        },

        // ...to Element Detail (switch currently focused element)
        element_detail: function(callback){

            // Don't bother with the trivial case
            if (display.next_element_detail_focus == display.element_detail_focus){
                console.log("requested change of element focus to current focus, ignoring request");
                callback();
                return;
            }

            transition.set_image(display.next_element_detail_focus);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(500).duration(2000)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Fade out the old focused nuclides and fade in the new
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(2500).duration(1000)
                .style("opacity", 0);
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(2500).duration(1000)
                .style("opacity", 1);

            // Switch the focus!
            display.element_detail_focus = display.next_element_detail_focus;
            display.next_element_detail_focus = null;

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(3500).duration(2000)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d.index);
                    var y = display.layouts.element_detail.getDataNuclideY(d.index);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(3500).duration(2000)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.element_detail_focus).transition()
                .delay(3500).duration(2000)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(3500).duration(2000)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);
            
            // Done
            setTimeout(function(){ callback(); }, 6000);
        },

    },

};
