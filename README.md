Galaxy of Nuclides
==================

Inspiration
-----------

This project started for me when the tsunami hit Japan in 2011 and the Fukushima Daiichi nuclear disaster was unfolding. Having always had an affinity for physics at all scales I needed to *fundamentally* know what was happening.

So there's fallout that's radioactive. Okay, what *is* fallout, anyway? Uranium from the plant? Turns out it's **fissile materials**, or a whole host of different elements, varying isotopes thereof, that tend to decay rather quickly in the form of deadly radiation.

I found a site with an illustration of where on the chart of nuclides these existed. Wait, what the hell is the **Chart of Nuclides**? It's a massive informative chart of every isotope of every element known to man? AND I NEVER SAW IT IN HIGH SCHOOL CHEMESTRY OR PHYSICS?!?

After getting over the initial frustration that such an awesome chart was never a part of my formative curriculum, I sought to get my hands on the underlying data, play with it, and make it beautiful and accessible to the lay person.

What This Project IS
--------------------

This project is intended to display all the elements, and all their isotopes, in terms of their proton and neutron counts and also in terms of their individual half lives, in some fresh ways.

The periodic table has done wonders for educating the masses about the elements but the chart of nuclides hasn't had much impact outside of advanced academia and industry. The periodic table also does nothing to *really* convey the breadth of isotope varieties for a given element, let alone the respective half lives thereof.

This project is intended to show how the periodic table and chart of nuclides are different cross-sections of the same dataset we know as "matter", including how they interact and connect.

What This Project IS NOT
------------------------

This is not a tool for researchers. This is not a tool for industry. This is not the next [web-based comprehensive interactive chart of nuclides](http://www.nndc.bnl.gov/chart/) or the next [all-encompassing nuclear science database](http://www.nucleonica.net/).

This is not a place to look up decay modes, neutron separation energies, double electron capture Q-values, or thermal neutron fission cross sections. I don't even know what most of those are and there are plenty of brilliant folks out on the web doing all of that extremely well already.

History
=======

2012: Processing
----------------

For its first two years, beginning in 2012, this project was all in [Processing](https://processing.org/). It was my first attempt at *anything* in Processing (or anything Java-based at all, for that matter). Processing, at the time, had the right graphical display chops and easy setup to get rolling fast.

Ultimately, however, its limitations were abundantly clear when facing how difficult it was to put a complex Processing program with core Java dependencies on the web. [Processing.js](http://processingjs.org/) was pretty new and things didn't work without a lot of shoehorning. Clearly the project needed to be rebuilt in the native language of the modern web: [Javascript](http://blog.codinghorror.com/the-principle-of-least-power/).

The original project in Processing with all of its weird extra layouts, colors, and interactivity is archived in this repository on the [processing_archive](https://github.com/Frencil/galaxy_of_nuclides/tree/processing_archive) branch.

2014: D3 and Nuclides.org
-------------------------

In November of 2014 there was some tooling around with various JavaScript-based graphics and interactivity libraries. Ultimately it seemed best to settle on the gold standard: [D3](http://d3js.org/). As such in its current form this project consists of one massive SVG element with highly structured nested elements (as in HTML) inside for all known elements (as in nature) and nuclides mapped to data objects.

The current master of this repository is hosted on **[nuclides.org](http://nucldies.org)** for all the world to see.

Current Development
===================

Presently the display structures all the data and corresponding SVG elements in (what I think is) a very sane and robust way. Current development is focused on utilizing D3's powerful selectors to reimplement the primary transition between Periodic Table of Elements and Chart of Nuclides.

In general the arc of development movign forward will be to reimplement all of the best functional elements of the original Processing program in SVG using D3. Such features include:

* Coloring all elements/nucldies with an attractive color scale to represent some dimension of data (e.g. nuclide count)
* A "time slider" for controlling elapsed time and illustrating half life decay
* Pulling back in the gorgeous images provided by [images-of-elements.com/](http://images-of-elements.com/) which are mirrored here in the repo

General
=======

Feedback
--------

If you have questions or input please email me at [frencils@gmail.com](mailto:frencils@gmail.com). Collaborators welcome.

License
-------

This repository is licensed under [Creative Commons Attribution 4.0 International](http://creativecommons.org/licenses/by/4.0/).
