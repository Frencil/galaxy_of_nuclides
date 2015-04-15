"use strict";

var transition = {

    // Fire: pass a new layout to this function to trigger a transition
    fire: function(new_layout, element_detail_focus){

        if (display.in_transition && display.current_layout != 'setup'){
            console.log("in transition, ignoring request");
            return;
        }

        if (display.current_layout == new_layout && display.current_layout != 'element_detail'){
            console.log("requested transition to current layout, ignoring request");
            return;
        }

        display.next_layout = new_layout;

        if (typeof element_detail_focus !== undefined && display.next_layout == 'element_detail'){
            transition.setElementFocus('next', element_detail_focus);
        }

        d3.select("#main_control").html("In transition...");
        display.in_transition = true;

        var y = display.regions.nav.regions[display.next_layout].y * display.scale;
        d3.select("#highlight_brackets").transition()
            .delay(500 * display.transition_speed)
            .duration(2000 * display.transition_speed)
            .attr("transform", "translate(0, " + y + ")");
        var complete_transition = function(){
            display.current_layout = display.next_layout;
            display.next_layout    = null;
            display.in_transition  = false;
            d3.select("#main_control").html("Ready.")
        };
        transition[display.current_layout][display.next_layout](function(){
            display.current_layout = display.next_layout;
            display.next_layout    = null;
            display.in_transition  = false;
            d3.select("#main_control").html("Ready.")
        });

    },

    // Set current or next focus with highlight handling
    setElementFocus: function(slot, protons){
        if (slot == 'current'){
            slot = 'element_detail_focus';
        } else {
            slot = 'next_element_detail_focus';
        }
        if (display[slot] != null){
            display.highlight(d3.select("rect.element_display.e" + display[slot]), false);
            if (display.current_layout == 'chart_of_nuclides'){
                d3.select("#element_" + display[slot] + "_highlightbox").attr("display", "none");
            }
        }
        display[slot] = protons;
        if (protons != null){
            display.highlight(d3.select("rect.element_display.e" + protons), true);
            if (display.current_layout == 'chart_of_nuclides'){
                d3.select("#element_" + protons + "_highlightbox").attr("display", null);
            }
        }
    },

    // Move focus from next to current and null out next
    swapElementFocus: function(){
        var new_current_focus = display.next_element_detail_focus;
        transition.setElementFocus('next', null);
        transition.setElementFocus('current', new_current_focus);
    },

    // Set image URL
    setImage: function(protons, transition_duration){
        var offset = 0;
        var title = "";
        if (typeof matter.elements[protons] == "object"){
            title = protons + " - " + matter.elements[protons].name + " (" + matter.elements[protons].symbol + ")";
            if (matter.elements[protons].has_image){
                offset = protons;
            }
        }
        var image_h = display.layouts.periodic_table.image.h * display.scale;
        d3.select("#image_src").attr("y", 0 - (offset * image_h) + (image_h / 10));
        d3.select("#image_title").text(title);
    },

    setBigImage: function(protons){
        var image_url = "images/elements/no_image.jpg";
        if (typeof matter.elements[protons] == "object"){
            if (matter.elements[protons].has_image){
                image_url = "images/elements/" + protons + ".jpg";
            }
        }
        var dark = 200;
        var ease = dark * 2;
        d3.select("#big_image_src").transition()
            .delay(0).duration(ease * display.transition_speed).style("opacity",0);
        setTimeout(function(){
            d3.select("#big_image_src").attr("xlink:href",image_url);
        }, (ease + (dark/2)) * display.transition_speed);
        d3.select("#big_image_src").transition()
            .delay((ease + dark) * display.transition_speed).duration(ease * display.transition_speed).style("opacity",1);
    },

    // Establish hitboxes and events for given element's nuclides in element detail layout
    setNuclideHitboxes: function(protons){
        d3.selectAll("rect.hitbox.nuclide")
            .attr("display", "none")
            .attr("data-nuclide-protons", null)
            .attr("data-nuclide-neutrons", null)
            .on("mouseover", null)
            .on("mouseout", null)
            .on("click", null);
        if (protons != null){
            for (var n = 0; n < matter.elements[protons].neutron_spread; n++){
                var neutrons = matter.elements[protons].min_neutrons + n;
                if (typeof matter.elements[protons].nuclides[neutrons] == 'undefined'){
                    continue;
                }
                d3.select("#nuclide_" + n + "_hitbox")
                    .attr("display", null)
                    .attr("data-nuclide-protons", protons)
                    .attr("data-nuclide-neutrons", neutrons)
                    .on("mouseover", function(){
                        var protons  = d3.select("#" + this.id).attr("data-nuclide-protons");
                        var neutrons = d3.select("#" + this.id).attr("data-nuclide-neutrons");
                        var nuclide_rect_class = "rect.nuclide_display.e" + protons + ".n" + neutrons;
                        display.highlight(d3.select(nuclide_rect_class), true);
                    })
                    .on("mouseout", function(){
                        var protons  = d3.select("#" + this.id).attr("data-nuclide-protons");
                        var neutrons = d3.select("#" + this.id).attr("data-nuclide-neutrons");
                        var nuclide_rect_class = "rect.nuclide_display.e" + protons + ".n" + neutrons;
                        display.highlight(d3.select(nuclide_rect_class), false);
                    });
            }
        }
    },

    // Helper function to move info boxes between layouts
    // All layouts have two info boxes and all transitions start by hiding them.
    // This should fire when the info boxes are hidden and finish any time before they're shown again.
    moveCommonObjects: function(target, fade_in_delay, reset_element_focus){

        d3.select("#commons").transition()
            .duration(500 * display.transition_speed).style("opacity",0);

        d3.select("#commons").transition()
            .delay((fade_in_delay + 100) * display.transition_speed).duration(500 * display.transition_speed).style("opacity",1);

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
                    transition.setImage(null);
                }
                display.layouts[target].setInfo();
            })(target, reset_element_focus);
        }, fade_in_delay * display.transition_speed);

    },

    setup: {
        periodic_table: function(callback){
            transition.moveCommonObjects('periodic_table', 100);
            callback();
        }
    },

    // Transitions from Periodic Table...
    periodic_table: {

        // ...to Periodic Table (do nothing)
        periodic_table: function(callback){
            callback();
        },

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

            transition.moveCommonObjects('chart_of_nuclides', 10500, true);

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
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.chart_of_nuclides.element.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.element.w * display.scale);

            // Scale element hitboxes to new periodic table position
            var w = display.layouts.chart_of_nuclides.element.w + display.layouts.chart_of_nuclides.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Scale nuclides to new periodic table position
            d3.selectAll("g.nuclide_display").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getTableNuclideX(d);
                    var y = display.layouts.chart_of_nuclides.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.chart_of_nuclides.table_nuclide.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.table_nuclide.w * display.scale);

            // Draw axes
            setTimeout(function(){
                display.layouts.chart_of_nuclides.drawAxes();
            }, 3000 * display.transition_speed);
            
            // Loop through elements
            for (var e in matter.elements){

                var element = matter.elements[e];

                // Translate element's nuclides to correct place and size in the chart
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((3000 + 64 * element.protons) * display.transition_speed)
                    .duration(3000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((3000 + 64 * element.protons) * display.transition_speed)
                    .duration(3000 * display.transition_speed)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Done
            setTimeout(function(){
                // Enable hit detection on chart nuclides
                d3.selectAll(".hitbox.chart_element").attr("display", null);
                callback();
            }, 11000 * display.transition_speed);

        },

        // ...to Element Detail
        element_detail: function(callback){

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.next_element_detail_focus == null){
                var rand = Math.ceil(Math.random() * (matter.elements.length-1));
                transition.setElementFocus('next', rand);
            }

            // Reposition info boxes
            transition.moveCommonObjects('element_detail', 5000);

            // Hide element labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed)
                .selectAll("text.element_display").style("opacity",0);

            // Show focused nuclides
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",1);

            // Move all non-focused elements to element detail periodic table positions
            d3.selectAll("g.element_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed * display.transition_speed)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Scale element hitboxes to new periodic table position
            var w = display.layouts.element_detail.element.w + display.layouts.element_detail.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Scale nuclides to new periodic table position
            d3.selectAll("g.nuclide_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").filter("*:not(.e" + display.next_element_detail_focus + ")").transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Position and show floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_element_detail_focus];
                        var x = display.layouts.element_detail.getElementX(element);
                        var y = display.layouts.element_detail.getElementY(element);
                        return "translate("+x+","+y+")";
                    })
                    .attr("display", null);
            }, 1500 * display.transition_speed);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d);
                    var y = display.layouts.element_detail.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_element_detail_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_element_detail_focus).transition()
                .delay(1500 * display.transition_speed)
                .duration(3000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Show nuclide labels
            d3.select("svg").transition()
                .delay(3000 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" + display.next_element_detail_focus).style("opacity",1);

            // Point big image at correct image file
            setTimeout(function(){
                display.layouts.element_detail.drawBigImage();
                transition.setBigImage(display.next_element_detail_focus);
            }, 5000 * display.transition_speed);

            // Done
            setTimeout(function(){
                transition.setNuclideHitboxes(display.next_element_detail_focus);
                transition.swapElementFocus();
                callback();
            }, 6000 * display.transition_speed);

        },

    },

    // Transitions from Chart of Nuclides...
    chart_of_nuclides: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Remove hit detection on chart nuclides
            d3.selectAll(".hitbox.chart_element").attr("display", "none");

            // Reposition info boxes
            transition.moveCommonObjects('periodic_table', 11500, true);

            // Remove axes
            display.layouts.chart_of_nuclides.removeAxes();

            // Loop through elements
            for (var e in matter.elements){

                var element = matter.elements[e];

                // Translate elements to new position and size
                d3.select("#element_" + element.protons + "_display").transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getElementX(d);
                        var y = display.layouts.periodic_table.getElementY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.element_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.periodic_table.element.w * display.scale)
                    .attr("height", display.layouts.periodic_table.element.w * display.scale);

                // Translate element hitbox to new position and size
                var w = display.layouts.periodic_table.element.w + display.layouts.periodic_table.element.m;
                d3.selectAll("rect.hitbox.element").transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", w * display.scale)
                    .attr("height", w * display.scale)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getElementX(d);
                        var y = display.layouts.periodic_table.getElementY(d);
                        return "translate("+x+","+y+")";
                    });

                // Translate element's nuclides to correct place in the chart
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.periodic_table.getNuclideX(d);
                        var y = display.layouts.periodic_table.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((1000 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                    .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

            }

            // Hide nuclides
            d3.selectAll("g.nuclide_display").transition()
                .delay(11000 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",0);

            // Show element labels
            d3.select("svg").transition()
                .delay(11500 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .selectAll("text.element_display").style("opacity",1);
            
            // Done
            setTimeout(function(){ callback(); }, 12000 * display.transition_speed);

        },

        // ...to Chart of Nuclides (do nothing)
        chart_of_nuclides: function(callback){
            callback();
        },

        // ...to Element Detail
        element_detail: function(callback){

            // Remove hit detection on chart nuclides
            d3.selectAll(".hitbox.chart_element").attr("display", "none");

            // In lieu of a set focus element just pick on at psuedo-random
            if (display.next_element_detail_focus == null){
                var rand = Math.ceil(Math.random() * (matter.elements.length-1));
                transition.setElementFocus('next', rand);
            }

            // Reposition info boxes
            transition.moveCommonObjects('element_detail', 13000);

            // Remove axes
            display.layouts.chart_of_nuclides.removeAxes();

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Translate element hitboxes into position
            var w = display.layouts.element_detail.element.w + display.layouts.element_detail.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
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
                if (e == display.next_element_detail_focus){
                    continue;
                }

                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((1500 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.element_detail.getTableNuclideX(d);
                        var y = display.layouts.element_detail.getTableNuclideY(d);
                        return "translate("+x+","+y+")";
                    }).transition()
                    .duration(1000 * display.transition_speed)
                    .style("opacity", 0);
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((1500 + 64 * element.protons) * display.transition_speed)
                    .duration(2000 * display.transition_speed)
                    .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                    .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);
            }

            // Remove chart highlight on focused nuclides
            setTimeout(function(){
                d3.select("#element_" + display.next_element_detail_focus + "_highlightbox").attr("display", "none");
            }, 11500 * display.transition_speed);

            // Position and show floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_element_detail_focus];
                        var x = display.layouts.element_detail.getElementX(element);
                        var y = display.layouts.element_detail.getElementY(element);
                        return "translate("+x+","+y+")";
                    })
                    .attr("display", null);
            }, 11500 * display.transition_speed);

            // Translate focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d);
                    var y = display.layouts.element_detail.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_element_detail_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_element_detail_focus).transition()
                .delay(11500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Show nuclide labels
            d3.select("svg").transition()
                .delay(11500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.next_element_detail_focus).style("opacity",1);

            // Point big image at correct image file
            setTimeout(function(){
                display.layouts.element_detail.drawBigImage();
                transition.setBigImage(display.next_element_detail_focus);
            }, 11000 * display.transition_speed);

            // Done
            setTimeout(function(){
                transition.setNuclideHitboxes(display.next_element_detail_focus);
                callback();
                transition.swapElementFocus();
            }, 13500 * display.transition_speed);

        },

    },

    // Transitions from Element Detail...
    element_detail: {

        // ...to Periodic Table
        periodic_table: function(callback){

            // Reposition info boxes
            transition.moveCommonObjects('periodic_table', 5500, true);

            // Hide nuclide labels
            d3.select("svg").transition().duration(500 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.element_detail_focus).style("opacity",0);

            // Remove big image
            setTimeout(function(){
                display.layouts.element_detail.removeBigImage()
            }, 1000 * display.transition_speed);

            // Disable nuclide hitboxes
            transition.setNuclideHitboxes(null);

            // Replace focused element in the table with the others
            d3.select("g.element_display.e" + display.element_detail_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.select("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Move the focused nuclides along with the focused element
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(1000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

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
                    var x = display.layouts.periodic_table.getElementX(d);
                    var y = display.layouts.periodic_table.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.periodic_table.element.w * display.scale)
                .attr("height", display.layouts.periodic_table.element.w * display.scale);

            // Translate element hitboxes to full size and position
            var w = display.layouts.periodic_table.element.w + display.layouts.periodic_table.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getElementX(d);
                    var y = display.layouts.periodic_table.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Translate all nuclides to periodic table positions and sizes
            d3.selectAll("g.nuclide_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.periodic_table.getNuclideX(d);
                    var y = display.layouts.periodic_table.getNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display").transition()
                .delay(3000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.periodic_table.nuclide.w * display.scale)
                .attr("height", display.layouts.periodic_table.nuclide.w * display.scale);

            // Show element labels
            d3.selectAll("text.element_display").transition()
                .delay(5000 * display.transition_speed)
                .duration(500 * display.transition_speed)
                .style("opacity",1);
            
            setTimeout(function(){
                callback();
            }, 5500 * display.transition_speed);

        },

        // ...to Chart of Nuclides
        chart_of_nuclides: function(callback){

            // Reposition info boxes
            transition.moveCommonObjects('chart_of_nuclides', 14500, true);

            // Hide nuclide labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.element_detail_focus).style("opacity",0);

            // Remove big image
            setTimeout(function(){
                display.layouts.element_detail.removeBigImage()
            }, 1000 * display.transition_speed);

            // Disable nuclide hitboxes
            transition.setNuclideHitboxes(null);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Hide floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("display", "none");
            }, 2500 * display.transition_speed);

            // Draw axes
            setTimeout(function(){
                display.layouts.chart_of_nuclides.drawAxes();
            }, 3000 * display.transition_speed);

            // Loop through elements translating all nuclides to chart positions
            for (var e in matter.elements){
                var element = matter.elements[e];
                d3.selectAll("g.nuclide_display.e" + element.protons).transition()
                    .delay((2500 + 64 * element.protons) * display.transition_speed)
                    .duration(500 * display.transition_speed)
                    .style("opacity", 1)
                    .transition()
                    .delay((3000 + 64 * element.protons) * display.transition_speed)
                    .duration(3000 * display.transition_speed)
                    .attr("transform", function(d){
                        var x = display.layouts.chart_of_nuclides.getNuclideX(d);
                        var y = display.layouts.chart_of_nuclides.getNuclideY(d);
                        return "translate("+x+","+y+")";
                    });
                d3.selectAll("rect.nuclide_display.e" + element.protons).transition()
                    .delay((3000 + 64 * element.protons) * display.transition_speed)
                    .duration(3000 * display.transition_speed)
                    .attr("width", display.layouts.chart_of_nuclides.nuclide.w * display.scale)
                    .attr("height", display.layouts.chart_of_nuclides.nuclide.w * display.scale);
            }

            // Translate elements into position
            d3.selectAll("g.element_display").transition()
                .delay(13500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display").transition()
                .delay(13500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("width", display.layouts.chart_of_nuclides.element.w * display.scale)
                .attr("height", display.layouts.chart_of_nuclides.element.w * display.scale);

            // Translate element hitboxes into position
            var w = display.layouts.chart_of_nuclides.element.w + display.layouts.chart_of_nuclides.element.m;
            d3.selectAll("rect.hitbox.element").transition()
                .delay(13500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .attr("width", w * display.scale)
                .attr("height", w * display.scale)
                .attr("transform", function(d){
                    var x = display.layouts.chart_of_nuclides.getElementX(d);
                    var y = display.layouts.chart_of_nuclides.getElementY(d);
                    return "translate("+x+","+y+")";
                });

            // Done
            setTimeout(function(){
                // Enable hit detection on chart nuclides
                d3.selectAll(".hitbox.chart_element").attr("display", null);
                callback();
            }, 14500 * display.transition_speed);

        },

        // ...to Element Detail (switch currently focused element)
        element_detail: function(callback){

            // Don't bother with the trivial case
            if (display.next_element_detail_focus == display.element_detail_focus || display.next_element_detail_focus == null){
                console.log("requested change of element focus to current or null focus, ignoring request");
                callback();
                return;
            }

            // Disable nuclide hitboxes first thing
            transition.setNuclideHitboxes(null);

            // Hide current nuclide labels
            d3.select("svg").transition()
                .duration(500 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.element_detail_focus).style("opacity",0);

            // Translate focused nuclides to the table
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getTableNuclideX(d);
                    var y = display.layouts.element_detail.getTableNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.table_nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.table_nuclide.w * display.scale);

            // Translate focused element to table position
            d3.selectAll("g.element_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",1)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getElementX(d);
                    var y = display.layouts.element_detail.getElementY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.element_detail_focus).transition()
                .delay(500 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.element.w * display.scale)
                .attr("height", display.layouts.element_detail.element.w * display.scale);

            // Fade out the old focused nuclides and fade in the new
            d3.selectAll("g.nuclide_display.e" + display.element_detail_focus).transition()
                .delay(2500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .style("opacity", 0);
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(2500 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .style("opacity", 1);

            // Reposition and floating element highlightbox
            setTimeout(function(){
                d3.select("#floating_element_highlightbox")
                    .attr("transform", function(){
                        var element = matter.elements[display.next_element_detail_focus];
                        var x = display.layouts.element_detail.getElementX(element);
                        var y = display.layouts.element_detail.getElementY(element);
                        return "translate("+x+","+y+")";
                    });
            }, 3750 * display.transition_speed);

            // Switch the image and info
            setTimeout(function(){
                display.layouts.element_detail.setInfo();
                transition.setBigImage(display.next_element_detail_focus);
            }, 2500 * display.transition_speed);

            // Translate next focused nuclides to correct place in the layout
            d3.selectAll("g.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.getDataNuclideX(d);
                    var y = display.layouts.element_detail.getDataNuclideY(d);
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.nuclide_display.e" + display.next_element_detail_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.nuclide.w * display.scale)
                .attr("height", display.layouts.element_detail.nuclide.w * display.scale);

            // Translate next focused element to the data position and fade it out
            d3.selectAll("g.element_display.e" + display.next_element_detail_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .style("opacity",0)
                .attr("transform", function(d){
                    var x = display.layouts.element_detail.data.x * display.scale;
                    var y = display.layouts.element_detail.data.y * display.scale;
                    return "translate("+x+","+y+")";
                });
            d3.selectAll("rect.element_display.e" + display.next_element_detail_focus).transition()
                .delay(4000 * display.transition_speed)
                .duration(2000 * display.transition_speed)
                .attr("width", display.layouts.element_detail.data.w * display.scale)
                .attr("height", display.layouts.element_detail.data.w * display.scale);

            // Show new nuclide labels
            d3.select("svg").transition()
                .delay(5000 * display.transition_speed)
                .duration(1000 * display.transition_speed)
                .selectAll("text.nuclide_display.e" +  display.next_element_detail_focus).style("opacity",1);

            // Switch the focus
            setTimeout(function(){
                transition.setNuclideHitboxes(display.next_element_detail_focus);
                transition.swapElementFocus();
            }, 6500 * display.transition_speed);
            
            // Done
            setTimeout(function(){ callback(); }, 6500 * display.transition_speed);
        },

    },

};
