"use strict";

// This question has special handling. It keys off of display.current_element or display.next_element to stand in for any element.

questions.cache['what_is_element'] = {

    element_specific: true,

    title: "",

    scale: "nuclide",

    components: {
        thumbnail: { x: 136, y: 98 },
        nuclide_hover: { x: 0, y: -100 }
    },
  
    periodic_table: {
        origin:  { x: 136, y: 62 },
        element: { w: 2.6, m: 0.288 },
        nuclide: { w: (2.6 / display.nuclides_per_row), m: 0 },
        show_labels: false,
        transition: { duration: 2000, delay: 500 },
        coordsFunction: display.periodic_table.getElementCoords
    },

    isotopes_grid: {
        origin:  { x: 136, y: 4 },
        nuclide: { w: ((52 / display.nuclides_per_row) * 0.9), m: ((52 / display.nuclides_per_row) * 0.1) },
        coordsFunction: display.isotopes_grid.getNuclideCoords,
        show_labels: true,
        next_element: 'display'
    },

    captions: [
        { x: 2, y: 8, line_height: 3.1, copy:  "" }
    ],

    // Follow-up questions with which to populate the questions region
    questions: [
        'What is the Periodic Table?',
    ],
    
    load: function(callback) {

        // Render full-size element image
        var image_x = 2 * display.scale;
        var image_y = 56 * display.scale;
        var image_w = 128 * display.scale;
        var image_h = 72 * display.scale;
        var bigimage = d3.select("#specifics").append("g")
            .attr("id", "big_image")
            .attr("transform", "translate(" + image_x + ", " + image_y + ")");
        bigimage.append("svg:image")
            .attr("id", "big_image_src")
            .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
        bigimage.append("rect")
            .attr("id", "big_image_border")
            .attr("class", "borderbox")
            .attr("x", 0).attr("y", 0).attr("width", image_w).attr("height", image_h);
        var image_url = "images/elements/no_image.jpg";
        if (typeof matter.elements[display.next_element] == "object"){
            if (matter.elements[display.next_element].has_image){
                image_url = "images/elements/" + display.next_element + ".jpg";
            }
        }
        d3.select("#big_image_src").style("opacity", 0).attr("xlink:href", image_url);
        d3.select("#big_image_src").transition()
            .delay(100 * display.transition_speed).duration(500 * display.transition_speed).style("opacity",1);

        // Hide just the element we're on, position the element highlight box, and show it
        var w = this.periodic_table.element.w * display.scale;
        var c = display.periodic_table.getElementCoords(matter.elements[display.next_element], this.periodic_table);
        d3.select("#element_"+display.next_element+"_display").style("display", "none");
        d3.select("#floating_element_highlightbox")
            .attr("width", w).attr("height", w)
            .attr("x", c[0]).attr("y", c[1])
            .style("display", "block");
            
        // Finish
        d3.timer(function(){
            callback();
            return true;
        }, 2000 * display.transition_speed);

    }

}