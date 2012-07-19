Galaxy of Nuclides
==================

Inspiration
-----------

This project started for me when the tsunami hit Japan in 2011 and the Fukushima Daiichi nuclear disaster was unfolding. Having always had an affinity for physics at all scales I needed to *fundamentally* know what was happening.

So there's fallout that's radioactive. Okay, what *is* fallout, anyway? Uranium from the plant? Turns out it's **fissile materials**, or a whole host of different elements, varying isotopes thereof, that tend to decay rather quickly in the form of deadly radiation.

I found a site with an illustration of where on the chart of nuclides these existed. Wait, what the hell is the **Chart of Nuclides**? It's a massive informative chart of every isotope of every element known to man? AND I NEVER SAW IT IN HIGH SCHOOL CHEMESTRY OR PHYSICS?!?

After getting over the initial frustration that such an awesome chart was never a part of my formative curriculum, I sought to get my hands on the underlying data, play with it, and make it beautiful and accessible to the lay person.


Processing
----------

This is my first attempt at anything in Processing (or anything Java-based at all, for that matter). Processing just had the right graphical display chops and easy setup to get rolling fast.

### Installation

1. Clone the repository into a directory called **galaxy_of_nuclides** (important)
2. Open **galaxy_of_nuclides.pde** in the Processing IDE
3. Press play and enjoy the prettiness

This project will likely be changing a *lot* and different conventions will pop up and die off often. Again: first attempt at anything in Processing, so don't expect programmatical zen.


What This Project IS
--------------------

This project is intended to display all the elements, and all their isotopes, in terms of their proton and neutron counts and also in terms of their individual half lives, in some fresh ways.

The periodic table has done wonders for educating the masses about the elements but the chart of nuclides hasn't had much impact outside of advanced academia and industry. The periodic table also does nothing to *really* convey the breadth of isotope varieties for a given element, let alone the respective half lives thereof.

This project is a playground for maing the standard chart of nuclides look visually striking, get animated, and maybe even get interactive.

What This Project IS NOT
------------------------

This is not a tool for researchers. This is not a tool for industry. This is not the next [web-based comprehensive interactive chart of nuclides](http://www.nndc.bnl.gov/chart/) or the next [all-encompassing nuclear science database](http://www.nucleonica.net/).

This is not a place to look up decay modes, neutron separation energies, double electron capture Q-values, or thermal neutron fission cross sections. I don't even know what most of those are. And there are plenty of brilliant folks out on the web doing all of that extremely well already.

Current Status
--------------

As of now this project has good data and is built out using objects for easy manipulation. For example, elements are objects, as are individual nuclides.

There are objects called *layouts* that describe different ways of expressing the data in two dimensions. There are also objects called *transitions* that switch between layouts using animation.

Finally, there is a time component built in to simulate the half-life decay of nuclides (both forward and reverse, or *decay* and *recay*) in logarithmic time.

Presently I'm playing with different layouts looking for one that's exceptionally striking and adding interactivity as I go.
