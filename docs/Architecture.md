# Architecture

Galaxy of Nuclides is a d3 / SVG web application designed to model all known elements and nuclides.

The model directly implements the Periodic Table and the Chart of Nuclides. User interface objects in the svg allow for triggering d3 transitions to illustrate the relationships in the data.

## SVG Structure

In `index.html` an SVG object is created with only definitions for filters, like so:

```html
<svg>
  <defs>
    <filter ... />
    <linearGradient ... />
  </defs>
</svg>
```

Once the page is loaded `lib/setup.js::loadGalaxy()` is triggered which loads CSV element and nuclide data and builds the fully structured SVG. Below is a simplified and annotated view.

```html
<svg>

  <!-- Definitions hard-coded in index.html -->
  <defs>
    <filter ... />
  </defs>

  <!-- Questions: main navigation in the form of a dynamic list of questions -->
  <text questions>

  <!-- Credit: attributions -->
  <text credit />

  <!-- Key: Object for showing color scale and controlling elapsed time to illustrate decay -->
  <g key>
    <g detail />
    <g slider />
  </g>

  <!-- Stage: Main object for displaying data -->
  <g stage>
    <!-- Captions - all text -->
    <g captions />
    <!-- Components - regularly used universal objects like the small element image viewer -->
    <g components />
    <!-- PRIMARY DATASET - All elements and nuclides defined in here and manipulated by control objects -->
    <g dataset>
      (for $ elements)
      <g id="element_$_display" class="element_$ e$" />
      (for $ elements + for % nuclides)
      <g id="element_$_nuclides_%_display" class="nuclide_display e$" />
    </g>
    <!-- Specifics - objects created and removed to address specific questions -->
    <g specifics />
    <!-- Dataset hitboxes are defined separately on the top of the stage for full control over the mouse -->
    <g hitboxes>
      (for $ elements)
      <rect class="element hitbox e$" />
      (for $ elements + for % nuclides)
      <rect class="element hitbox e$ n%" />
    </g>
  </g>

  <!-- Curtain: Area to block all areas but the title during initial loading -->
  <g Curtain>
  </g>

  <!-- Title: Area for banner title -->
  <g Title>
  </g>

</svg>
```

### A Closer Look at Dataset Structure

Here's a further annotated breakdown of the dataset group.

```html
<g dataset>

  <!-- Element shell groups wrap an entire element and all of it's nuclides -->
  <!-- Groups inside shell have a class of e# (# = atomic number) for filtering selectors to a single element or group of nuclides -->
  <g id="element_1" class="element_shell">

    <!-- Element display groups wrap all the visual objects for a single element (not its nuclides) -->
    <g id="element_1_display" class="element_display e1" />

    <!-- Nuclide group groups all the display groups for each nuclide -->
    <g id="element_1_nuclide_group" class="nuclide_group e1">

      <!-- Nuclide display groups wrap all the visual objects for a single nuclide -->
      <g id="element_1_nuclides_0_display" class="nuclide_display e1" />
      <g id="element_1_nuclides_1_display" class="nuclide_display e1" />
      ...

    </g>

  </g>

  <g id="element_2" class="element_shell">
    ...
  </g>

  ...

</g>
```

## Raw Data

### CSV

CSV data is kept in `data` in two files: `elements.csv` and `nuclides.csv`.

CSV files are read using d3's built-in CSV parser. Elements are parsed first and then Nuclides, since the data model stores nuclide data within parent element data structures.

### Images

Images of elements, provided by [images-of-elements.com](http://images-of-elements.com/), are kept in `images/elements`. All images are named using just atomic number (e.g. `23.jpg`). A stand-in, `no_image.jpg`, is available for elements that have no available image.

## Javascript Libraries

*wip*

### Question syntax

Pages of the application are questions in the form of JavaScript files that declare a single object. The object defined in a question file should directly add the question to `questions.cache`. The framework is set up to only request questions once from the server per session and otherwise use locally cached data.

```javascript
questions.cache['what_is_foo'] = {

    title: "What is Foo?",

    // What scale should be shown in the key?
    scale: ("element"|"nuclide"),

    // Where should common components be shown?
    components: {
        thumbnail: { x: 122, y: 5, show: true }
    },
    
    // What is the size, position, and fade in transition timing for the full element data set (the periodic table)?
    periodic_table: {        
        origin:  { x: 1, y: 2 },
        element: { w: 3, m: 4 },
        nuclide: { w: 5, m: 6 },
        show_labels: true,
        transition: { duration: 7, delay: 8, stagger_delay: 9 }
    },

    // What is the size, position, and fade in transition timing for the full nuclide data set (the chart of nuclides)?
    chart_of_nuclides: {        
        origin:  { x: 1, y: 2 },
        nuclide: { w: 3, m: 4 },
        show_labels: true,
        transition: { duration: 5, delay: 6, stagger_delay: 7 }
    },

    // What are the captions and where should they be positioned?
    captions: [
        { x: 1, y: 2, line_height: 3,
          copy: "foo bar baz"
        },
        { x: 4, y: 5, line_height: 6,
          copy: "lorem ipsum dolor sit amet"
        }
    ],

    // What follow-up questions should populate the questions region?
    questions: [
        'What is Bar?',
        'What is Baz?'
    ],
    
    // The load function should define all specifics and hitbox placements
    load: function(callback) {
        
        // Draw some specifics
        d3.select("#specifics").append(...);

        // Set hitboxes
        d3.selectAll(".hitbox.element").attr(...);

        // Always trigger the callback to finish
        callback();

    }

};
```