# Galaxy of Nuclides

**Galaxy of Nuclides** is an application for exploring the Elements, their Isotopes, and all known Nuclides interactively with [d3](http://d3js.org/). It is currently hosted at [http://nuclides.org/](http://nuclides.org/).

## What This Project IS

Galaxy of Nuclides is designed to educate users about how atoms and the chemical elements work. Emphasis is on the atomic nucleus (protons and neutrons) and atomic decay (half-life).

Animations and interactivity are used to illustrate the relationship between the Periodic Table of Elements and the Chart of Nuclides.

## What This Project IS NOT

This application is not intended to be a comprehensive tool for researchers or industry. As an educational tool aimed at the broadest possible audience it should not explore advanced concepts of nuclear physics at the expense of simpler concepts.

For a more comprehensive tool more aimed at graduate-level students and researchers see the [National Nuclear Data Center Chart of Nuclides](http://www.nndc.bnl.gov/chart/).

## Documentation

All documentation can be found in the [docs](https://github.com/Frencil/galaxy_of_nuclides/tree/master/docs) drectory. Overview:

* [Architecture](https://github.com/Frencil/galaxy_of_nuclides/blob/master/docs/Architecture.md) - Overall composition of the application
* [Contributing Info](https://github.com/Frencil/galaxy_of_nuclides/blob/master/docs/ContributingInfo.md) - Specifics on how to contribute info captions for elements that need them

## Contributing to Galaxy of Nuclides

Presently this is a solo project with more potential than resources. Please consider contributing!

The easiest way to materially contribute is to write an **Element Info** caption. These are the captions you see when looking at the isotopes for a single element. See [Contributing Info](https://github.com/Frencil/galaxy_of_nuclides/blob/master/docs/ContributingInfo.md) for details on how to get started.

For other ways to contribute see [Issues](https://github.com/Frencil/galaxy_of_nuclides/issues) to either report bugs, propose enhancements, or take on an existing issue.

## Inspiration and History

### Original Inspiration

This project's origins are in the the 2011 tsunami that heavily damaged the Fukushima Daiichi nuclear plant in Japan. Reading about the cleanup effort I began to wonder: what *is* radioactive fallout? Like what elements, and what isotopes of those elements?

I knew what isotopes were from high school, and knew the names of some important ones like Carbon-14 and Uranium-238, but had never considered how many isotopes of all elements existed. I had no concept of what those workers in Japan were actually cleaning up. So I researched it, and learned about *fissile materials*. These are a plethora of various isotopes of relatively heavy elements that tend to be clustered in a couple regions on the Chart of Nuclides.

And then I saw the Chart of Nuclides for the first time. After some amazement at how huge it is relative the Periodic Table, I became a bit disappointed that I had never been exposed to it. Maybe it was always considered "too advanced" outside of college-level nuclear physics courses. I certainly didn't agree so sought to build a visualization to show the relationship between the familiar Period Table and the unfamiliar Chart of Nuclides.

### 2012: Processing

An early prototype was developed in [Processing](https://processing.org/). This language was chosen for its supposed adeptness at building data visualizations. Development with this technology culminated in 2013. Ultimately the application clearly needed to be web based and ultimately Processing was *not* a web-based language. The project stalled.

The original project in Processing is archived on the [processing_archive](https://github.com/Frencil/galaxy_of_nuclides/tree/processing_archive) branch.

### 2013: Canvas

Clearly the proper *language* for a web-based data visualization application, by this point, was JavaScript. But the *framework* remained an open question with many possible solutions. At one point [a proof-of-concept was built in pure JavaScript/Canvas](http://nuclides.org/v2/) but easily capturing mouse events became a severely limiting factor. The project stalled again.

### 2014: d3 and SVG

In late 2014, with fresh inspiration and some recent experience with the framework, [d3](http://d3js.org/) became the new potential solution. A proof of concept to load and format the data coalesced quickly, and the composition of the application being inspectable elements promised easy interactivity. Animations were straightforward.

The application finally had the right technology in place to flourish.

## Feedback

Please file bugs or propose new features on the [Issues](https://github.com/Frencil/galaxy_of_nuclides/issues) page.

General questions or feedback can directed to [frencils@gmail.com](mailto:frencils@gmail.com).

## License

This repository is licensed under [Creative Commons Attribution 4.0 International](http://creativecommons.org/licenses/by/4.0/).

~

![Galaxy of Nuclides Logo](http://nuclides.org/images/svg/logo.svg)