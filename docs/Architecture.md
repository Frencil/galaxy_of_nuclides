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

  <!-- Nav: Large buttons for switching between layouts; graphics are external svg files -->
  <g nav>
    <g elements>
      <svg />
    </g>
    <g nuclides>
      <svg />
    </g>
    <g isotopes>
      <svg />
    </g>
    <g credit />
    <g ghost_brackets />
    <g highlight_brackets />
  </g>

  <!-- Time: Object for showing color scale and controlling elapsed time to illustrate decay; WIP -->
  <g time>
    <g detail />
    <g slider />
    <g time_brackets />
  </g>

  <!-- Stage: Main object for displaying data -->
  <g stage>
    <!-- Image for element detail view -->
    <image />
    <!-- Info boxes (two objects scaled, repositioned, and reused on each of the three layouts) -->
    <g info />
    <!-- PRIMARY DATASET - All elements and nuclides defined in here and manipulated by control objects -->
    <g dataset>
      <g id="element_1" class="element_shell">
        <g id="element_1_display" class="element_display e1" />
        <g id="element_1_nuclide_group" class="nuclide_group e1">
          <g id="element_1_nuclides_0_display" class="nuclide_display e1" />
          <g id="element_1_nuclides_1_display" class="nuclide_display e1" />
          ...
        </g>
      </g>
      <g id="element_2" class="element_shell" />
      <g id="element_3" class="element_shell" />
      ...
    </g>
    <!-- Hitboxes defined separately on the top of the stage for full control over the mouse -->
    <g hitboxes>
      <rect element_1_hitbox>
      <rect element_2_hitbox>
      ...
      <!-- Only matter.max_nuclides_per_element nuclide hitboxes are defined (~50 instead of ~3200) -->
      <rect nuclide_1_hitbox>
      <rect nuclide_2_hitbox>
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
