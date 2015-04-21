"use strict";

var transition = {

    // Fire: pass a new layout to this function to trigger a transition
    fire: function(new_layout, isotopes_focus){

        if (display.in_transition && display.current_layout != 'setup'){
            console.log("in transition, ignoring request");
            return;
        }

        if (display.current_layout == new_layout && display.current_layout != 'isotopes'){
            console.log("requested transition to current layout, ignoring request");
            return;
        }

        display.next_layout = new_layout;

        if (typeof isotopes_focus !== undefined && display.next_layout == 'isotopes'){
            transition.setElementFocus('next', isotopes_focus);
        }

        display.in_transition = true;

        // Hide all stage hitboxes
        d3.select("#stage").selectAll(".hitbox").attr("display","none");

        // Move nav highlight brackets and title highlight
        var y = display.regions.nav.regions[display.next_layout].y * display.scale;
        d3.select("#highlight_brackets").transition()
            .delay(500 * display.transition_speed)
            .duration(2000 * display.transition_speed)
            .attr("transform", "translate(0, " + y + ")");
        d3.select("#" + display.current_layout + "_title")
            .attr("fill", "rgb(127,127,127)")
            .attr("filter", "url(#soft-glow)");
        d3.select("#" + display.next_layout + "_title")
            .attr("fill", "rgb(255,255,255)")
            .attr("filter", "url(#highlight-glow)");

        var complete_transition = function(){
            display.current_layout = display.next_layout;
            display.next_layout    = null;
            display.in_transition  = false;
        };

        // Fire the transition
        transition[display.current_layout][display.next_layout](function(){

            // Position and show hitboxes for the new layout
            display.layouts[display.next_layout].setHitboxes();

            // Finalize state variables
            display.current_layout = display.next_layout;
            display.next_layout    = null;
            display.in_transition  = false;
            d3.select("#main_control").html("Ready.")

        });

    },

    // Set current or next focus with highlight handling
    setElementFocus: function(slot, protons){
        if (slot == 'current'){
            slot = 'isotopes_focus';
        } else {
            slot = 'next_isotopes_focus';
        }
        if (display[slot] != null){
            display.highlightElement(display[slot], false);
            if (display.current_layout == 'nuclides'){
                d3.select("#element_" + display[slot] + "_highlightbox").attr("display", "none");
            }
        }
        display[slot] = protons;
        if (protons != null){
            display.highlightElement(protons, true);
            if (display.current_layout == 'nuclides'){
                d3.select("#element_" + protons + "_highlightbox").attr("display", null);
            }
        }
    },

    // Move focus from next to current and null out next
    swapElementFocus: function(){
        var new_current_focus = display.next_isotopes_focus;
        transition.setElementFocus('next', null);
        transition.setElementFocus('current', new_current_focus);
    },

    // Helper function to move info boxes between layouts
    // All layouts have two info boxes and all transitions start by hiding them.
    // This should fire when the info boxes are hidden and finish any time before they're shown again.
    moveCommonObjects: function(target, fade_in_delay, reset_element_focus){

        var move_duration = Math.min((fade_in_delay / 2) * display.transition_speed, 500 * display.transition_speed);

        d3.select("#commons").transition()
            .duration(move_duration).style("opacity",0);

        d3.select("#commons").transition()
            .delay((fade_in_delay + 100) * display.transition_speed).duration(move_duration).style("opacity",1);

        setTimeout(function(){
            (function(target, reset_element_focus){
                var info_x = display.layouts[target].info.x * display.scale;
                var info_y = display.layouts[target].info.y * display.scale;
                d3.select("#info")
                    .attr("transform", "translate(" + info_x + ", " + info_y + ")");
                var image_x = display.layouts[target].image.x * display.scale;
                var image_y = display.layouts[target].image.y * display.scale;
                d3.select("#image")
                    .attr("transform", "translate(" + image_x + ", " + image_y + ")");
                if (typeof reset_element_focus != "undefined" && reset_element_focus){
                    transition.setElementFocus('current', null);
                    transition.setElementFocus('next', null);
                    display.setImage(null);
                }
                display.layouts[target].setInfo();
            })(target, reset_element_focus);
        }, fade_in_delay * display.transition_speed);

    },

    setup: {
        elements: function(callback){
            d3.select("#key_element_scale").style("opacity", 1);
            transition.moveCommonObjects('elements', 100);
            callback();
        }
    },

    // Transitions from Elements (Periodic Table)...
    elements: {

        // ...to Elements (do nothing)
        elements: function(callback){
            callback();
        },

        // ...to Nuclides (Chart of Nuclides)
        nuclides: function(callback){

            transition.moveCommonObjects('nuclides', 10500, true);

            // Hide element scale
            d3.select("#key_element_scale").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);

            // Hide element labels
            d3.select("svg").transition().duration(500 * display.transition_speed)
                .selectAll("text.element_display").style("opacity",0);

            // Make nuclides appear
            d3.selectAll("g.nuclide_display").transition()
                .delay(500 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",1);

            // Scale elements to new periodic table position
            d3.selectAll("g.element_display").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.nuclides.getElementX(d);
                    var y = display.layouts.nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.nuclides.element.w * display.scale)
                .attr("height", display.layouts.nuclides.element.w * display.scale);

            // Scale nuclides to new periodic table position
            setTimeout(function(){
                d3.selectAll("g.nuclide_display").transition()
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.nuclides.getTableNuclideX(d);
                        var y = display.layouts.nuclides.getTableNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display").transition()
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.nuclides.table_nuclide.w * display.scale)
                    .attr("height", display.layouts.nuclides.table_nuclide.w * display.scale);
            }, 1010 * display.transition_speed);

            // Draw axes
            setTimeout(function(){
                display.layouts.nuclides.drawAxes();
            }, 3000 * display.transition_speed);

            // Show nuclide scale
            d3.select("#key_nuclide_scale").transition()
                .delay(3000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);
            d3.select("#key_elapsed_time").transition()
                .delay(3000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);
            
            // Loop through elements
            setTimeout(function(){
                for (var e in matter.elements){
                    var element = matter.elements[e];
                    // Translate element's nuclides to correct place and size in the chart
                    d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                        .delay((3500 + (50 * element.protons)) * display.transition_speed)
                        .duration(500 * display.transition_speed)
                        .attr("transform", function(d){
                            var x = display.layouts.nuclides.getNuclideX(d);
                            var y = display.layouts.nuclides.getNuclideY(d);
                            return "translate("+x+","+y+")";
                        });
                    d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                        .delay((3500 + (50 * element.protons)) * display.transition_speed)
                        .duration(500 * display.transition_speed)
                        .attr("width", display.layouts.nuclides.nuclide.w * display.scale)
                        .attr("height", display.layouts.nuclides.nuclide.w * display.scale);
                }
            }, 3100 * display.transition_speed);

            // Done
            setTimeout(function(){ callback(); }, 11000 * display.transition_speed);

        },

        // ...to Isotopes (Element Detail)
        isotopes: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.next_isotopes_focus == null){
                var rand = Math.ceil(Math.random() * (matter.elements.length-1));
                transition.setElementFocus('next', rand);
            }

            transition.moveCommonObjects('isotopes', 5000);

            // Hide element scale
            d3.select("#key_element_scale").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);

            // Hide element labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed)
                .selectAll("text.element_display").style("opacity",0);

            // Show focused nuclides
            d3.selectAll("g.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",1);

            // Move all non-focused elements to element detail periodic table positions
            d3.selectAll("g.element_display").filter("*:not(.e" + display.next_isotopes_focus + ")").transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getElementX(d);
                    var y = display.layouts.isotopes.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter("*:not(.e" + display.next_isotopes_focus + ")").transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed * display.transition_speed)
                .attr("width", display.layouts.isotopes.element.w * display.scale)
                .attr("height", display.layouts.isotopes.element.w * display.scale);

            // Scale nuclides to new periodic table position
            d3.selectAll("g.nuclide_display").filter("*:not(.e" + display.next_isotopes_focus + ")").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getTableNuclideX(d);
                    var y = display.layouts.isotopes.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter("*:not(.e" + display.next_isotopes_focus + ")").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.table_nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.table_nuclide.w * display.scale);

            // Position and show floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_isotopes_focus];
                        var x = display.layouts.isotopes.getElementX(element);
                        var y = display.layouts.isotopes.getElementY(element);
                        return "translate("+x+","+y+")";
                    })
                    .attr("display", null);
            }, 1500 * display.transition_speed);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getDataNuclideX(d);
                    var y = display.layouts.isotopes.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.nuclide.w * display.scale)
                .style("stroke-width", 1);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_isotopes_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.data.x * display.scale;
                    var y = display.layouts.isotopes.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_isotopes_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.data.w * display.scale)
                .attr("height", display.layouts.isotopes.data.w * display.scale);

            // Show nuclide labels
            d3.select("svg").transition()
                .delay(3000 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" + display.next_isotopes_focus).style("opacity",1);

            // Show nuclide scale
            d3.select("#key_nuclide_scale").transition()
                .delay(3000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);
            d3.select("#key_elapsed_time").transition()
                .delay(3000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);

            // Point big image at correct image file
            setTimeout(function(){
                display.layouts.isotopes.drawBigImage();
                display.setBigImage(display.next_isotopes_focus);
            }, 5000 * display.transition_speed);

            // Done
            setTimeout(function(){
                transition.swapElementFocus();
                callback();
            }, 6000 * display.transition_speed);

        },

    },

    // Transitions from Nuclides (Chart of Nuclides)...
    nuclides: {

        // ...to Elements (Periodic Table)
        elements: function(callback){

            transition.moveCommonObjects('elements', 11500, true);

            // Hide nuclide scale
            d3.select("#key_nuclide_scale").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);
            d3.select("#key_element_scale").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);

            // Remove axes
            display.layouts.nuclides.removeAxes();

            // Loop through elements
            for (var e in matter.elements){

                var element = matter.elements[e];

                // Translate elements to new position and size
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.elements.getElementX(d);
                        var y = display.layouts.elements.getElementY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.element_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.elements.element.w * display.scale)
                    .attr("height", display.layouts.elements.element.w * display.scale);

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.elements.getNuclideX(d);
                        var y = display.layouts.elements.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.elements.nuclide.w * display.scale)
                    .attr("height", display.layouts.elements.nuclide.w * display.scale);

            }

            // Hide nuclides
            d3.selectAll("g.nuclide_display").transition()
                .delay(11000 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",0);

            // Show element scale
            d3.select("#key_element_scale").transition()
                .delay(11000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);

            // Show element labels
            d3.select("svg").transition()
                .delay(11500 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .selectAll("text.element_display").style("opacity",1);
            
            // Done
            setTimeout(function(){ callback(); }, 12000 * display.transition_speed);

        },

        // ...to Nuclides (do nothing)
        nuclides: function(callback){
            callback();
        },

        // ...to Isotopes (Element Detail)
        isotopes: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.next_isotopes_focus == null){
                var rand = Math.ceil(Math.random() * (matter.elements.length-1));
                transition.setElementFocus('next', rand);
            }

            // Reposition info boxes
            transition.moveCommonObjects('isotopes', 13000);

            // Remove axes
            display.layouts.nuclides.removeAxes();

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getElementX(d);
                    var y = display.layouts.isotopes.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.element.w * display.scale)
                .attr("height", display.layouts.isotopes.element.w * display.scale);

            // Loop up the chart translating all non-focused elements to the table and fading them out
            for (var e in matter.elements){
                var element = matter.elements[e];
                if (e == display.next_isotopes_focus){
                    continue;
                }

                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((1500 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.isotopes.getTableNuclideX(d);
                        var y = display.layouts.isotopes.getTableNuclideY(d);
                        return "translate("+x+","+y+")";
                    }).transition()
                    .duration(1000 * display.transition_speed)
                    .style("opacity", 0);
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((1500 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.isotopes.table_nuclide.w * display.scale)
                    .attr("height", display.layouts.isotopes.table_nuclide.w * display.scale);
            }

            // Remove chart highlight on focused nuclide
            setTimeout(function(){
                d3.select("#nuclides_element_highlights").selectAll("rect.highlightbox").style("display", "none");
                display.setZoomNuclide(null);
            }, 11500 * display.transition_speed);

            // Position and show floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_isotopes_focus];
                        var x = display.layouts.isotopes.getElementX(element);
                        var y = display.layouts.isotopes.getElementY(element);
                        return "translate("+x+","+y+")";
                    })
                    .attr("display", null);
            }, 11500 * display.transition_speed);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getDataNuclideX(d);
                    var y = display.layouts.isotopes.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.nuclide.w * display.scale)
                .style("stroke-width", 1);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_isotopes_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.data.x * display.scale;
                    var y = display.layouts.isotopes.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_isotopes_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.data.w * display.scale)
                .attr("height", display.layouts.isotopes.data.w * display.scale);

            // Show nuclide labels
            d3.select("svg").transition()
                .delay(11500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.next_isotopes_focus).style("opacity",1);

            // Point big image at correct image file
            setTimeout(function(){
                display.layouts.isotopes.drawBigImage();
                display.setBigImage(display.next_isotopes_focus);
            }, 11000 * display.transition_speed);

            // Done
            setTimeout(function(){
                callback();
                transition.swapElementFocus();
            }, 13500 * display.transition_speed);

        },

    },

    // Transitions from Isotopes (Element Detail)...
    isotopes: {

        // ...to Elements (Periodic Table)
        elements: function(callback){

            transition.moveCommonObjects('elements', 5500, true);

           // Hide nuclide scale
            d3.select("#key_nuclide_scale").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);
            d3.select("#key_elapsed_time").transition()
                .duration(500 * display.transition_speed)
                .style("opacity", 0);

            // Hide nuclide labels
            d3.select("svg").transition().duration(500 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.isotopes_focus).style("opacity",0);

            // Remove big image
            setTimeout(function(){
                display.layouts.isotopes.removeBigImage()
            }, 1000 * display.transition_speed);

            // Replace focused element in the table with the others
            d3.select("g.element_display.e" + display.isotopes_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getElementX(d);
                    var y = display.layouts.isotopes.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.select("rect.element_display.e" + display.isotopes_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.element.w * display.scale)
                .attr("height", display.layouts.isotopes.element.w * display.scale);

            // Move the focused nuclides along with the focused element
            d3.selectAll("g.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getTableNuclideX(d);
                    var y = display.layouts.isotopes.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.table_nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.table_nuclide.w * display.scale)
                .style("stroke-width", 0.1);

            // Hide floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("display", "none");
            }, 3000 * display.transition_speed);

            // Scale up the periodic table to its full size and position
            d3.selectAll("g.element_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.elements.getElementX(d);
                    var y = display.layouts.elements.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.elements.element.w * display.scale)
                .attr("height", display.layouts.elements.element.w * display.scale);

            // Translate all nuclides to periodic table positions and sizes
            d3.selectAll("g.nuclide_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.elements.getNuclideX(d);
                    var y = display.layouts.elements.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.elements.nuclide.w * display.scale)
                .attr("height", display.layouts.elements.nuclide.w * display.scale);

            // Show element scale
            d3.select("#key_element_scale").transition()
                .delay(5000 * display.transition_speed).duration(500 * display.transition_speed)
                .style("opacity", 1);

            // Show element labels
            d3.selectAll("text.element_display").transition()
                .delay(5000 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",1);
            
            setTimeout(function(){
                callback();
            }, 5500 * display.transition_speed);

        },

        // ...to Nuclides (Chart of Nuclides)
        nuclides: function(callback){

            transition.moveCommonObjects('nuclides', 14500, true);

            // Hide nuclide labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.isotopes_focus).style("opacity",0);

            // Remove big image
            setTimeout(function(){
                display.layouts.isotopes.removeBigImage()
            }, 1000 * display.transition_speed);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getTableNuclideX(d);
                    var y = display.layouts.isotopes.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.table_nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.table_nuclide.w * display.scale)
                .style("stroke-width", 0.1);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getElementX(d);
                    var y = display.layouts.isotopes.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.element.w * display.scale)
                .attr("height", display.layouts.isotopes.element.w * display.scale);

            // Hide floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("display", "none");
            }, 2500 * display.transition_speed);

            // Draw axes
            setTimeout(function(){
                display.layouts.nuclides.drawAxes();
            }, 3000 * display.transition_speed);

            // Loop through elements translating all nuclides to chart positions
            for (var e in matter.elements){
                var element = matter.elements[e];
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((2500 + 50 * element.protons) * display.transition_speed)
                    .duration(500 * display.transition_speed)
                    .style("opacity", 1)
                    .transition()
                    .delay((3000 + 50 * element.protons) * display.transition_speed)
                    .duration(500 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.nuclides.getNuclideX(d);
                        var y = display.layouts.nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((3000 + 50 * element.protons) * display.transition_speed)
                    .duration(500 * display.transition_speed)
                    .attr("width", display.layouts.nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.nuclides.nuclide.w * display.scale);
            }

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(13500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.nuclides.getElementX(d);
                    var y = display.layouts.nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(13500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("width", display.layouts.nuclides.element.w * display.scale)
                .attr("height", display.layouts.nuclides.element.w * display.scale);

            // Done
            setTimeout(function(){ callback(); }, 14500 * display.transition_speed);

        },

        // ...to Isotopes (switch currently focused element)
        isotopes: function(callback){

            // Don't bother with the trivial case
            if (display.next_isotopes_focus == display.isotopes_focus || display.next_isotopes_focus == null){
                console.log("requested change of element focus to current or null focus, ignoring request");
                callback();
                return;
            }

            // Hide current nuclide labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.isotopes_focus).style("opacity",0);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getTableNuclideX(d);
                    var y = display.layouts.isotopes.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.table_nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.table_nuclide.w * display.scale)
                .style("stroke-width", 0.1);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getElementX(d);
                    var y = display.layouts.isotopes.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.isotopes_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.element.w * display.scale)
                .attr("height", display.layouts.isotopes.element.w * display.scale);

            // Fade out the old focused nuclides and fade in the new
            d3.selectAll("g.nuclide_display.e" + display.isotopes_focus).transition()
                .delay(2500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .style("opacity", 0);
            d3.selectAll("g.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(2500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .style("opacity", 1);

            // Reposition and floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_isotopes_focus];
                        var x = display.layouts.isotopes.getElementX(element);
                        var y = display.layouts.isotopes.getElementY(element);
                        return "translate("+x+","+y+")";
                    });
            }, 3750 * display.transition_speed);

            // Switch the image and info
            setTimeout(function(){
                display.layouts.isotopes.setInfo();
                display.setBigImage(display.next_isotopes_focus);
            }, 2500 * display.transition_speed);

            // Translate next focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.getDataNuclideX(d);
                    var y = display.layouts.isotopes.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_isotopes_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.nuclide.w * display.scale)
                .attr("height", display.layouts.isotopes.nuclide.w * display.scale)
                .style("stroke-width", 1);

            // Translate next focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_isotopes_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.isotopes.data.x * display.scale;
                    var y = display.layouts.isotopes.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_isotopes_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.isotopes.data.w * display.scale)
                .attr("height", display.layouts.isotopes.data.w * display.scale);

            // Show new nuclide labels
            d3.select("svg").transition()
                .delay(5000 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.next_isotopes_focus).style("opacity",1);

            // Switch the focus
            setTimeout(function(){
                transition.swapElementFocus();
            }, 6500 * display.transition_speed);
            
            // Done
            setTimeout(function(){ callback(); }, 6500 * display.transition_speed);
        },

    },

};
