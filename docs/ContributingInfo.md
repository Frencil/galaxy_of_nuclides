# Contributing Info

Galaxy of Nuclides presents the user with three primary layouts: *elements* (the Periodic Table), *nuclides* (the Chart of Nuclides), and *isotopes*. The first two layouts always have the same info caption. The third layout, however, is different for every element.

You can help contribute to this application by writing info captions! There are 119 total elements and every one needs a caption.

## Getting Started

Begin by [forking this repository](https://help.github.com/articles/fork-a-repo/). Since the application is pure HTML/CSS/JavaScript you should be able to simply open **index.html** in a browser of your choice to see the working application locally.

Once you can successfully see the application running locally in a browser, open [data/elemnents.csv](https://github.com/Frencil/galaxy_of_nuclides/blob/master/data/elements.csv) in any text editor. Element info captions are last value in each row and are enclosed in double-quotes. Locate the element you want to work on and change the existing default caption to anything new (e.g. `Hello, World!`).

Save the file and reload the local version of the application. Click the element you changed to bring up its isotope view to see your change.

**Note:** most browsers will cache CSV files, preventing you from seeing changes. Get around this by clearing your cache before reloading or open the application in a new private/incognito window after every change.

## Markup

Captions are rendered as SVG elements and thus *HTML will not render in them*. All styles and formatting are handled by the application so an extremely simple markup language is built in to afford some flexibility.

The `Caption` class for defining and rendering captions can be found in [assets/js/app/Caption.js](https://github.com/Frencil/galaxy_of_nuclides/blob/master/assets/js/app/Caption.js)::printTextBlock(). Here you can see how the application builds a list of `<tspan>` elements with absolute and relative positioning and then renders them in series.

### Emphasis

There are four emphasis classes that bold and color a given word or phrase. These are simply numbered and look like this:

```
This text has no emphasis.
[em1]Make this text bold and orange.[em1]
[em2]Make this text bold and blue.[em2]
[em3]Make this text bold and green.[em3]
[em4]Make this text bold and pink.[em4]
```

Note how openeing and closing tags are identical (that is you don't write `[em1]foo[/em1]`, you write `[em1]foo[em1]`). There's a reason for this, just go with it.

The intended use of emphasis classes is to highlight important words and phrases. See existing captions throughout nuclides.org for examples of usage.

There's an additional emphasis class for italicizing a word or phrase:
```
This text has no emphasis.
[emi]Make this text italic.[emi]
```

### Size / Positioning

Three classes allow for making text smaller and positioning it:

```
This is normal text.
[sub]This text is subscripted[sub]
[sup]This text is superscripted[sup]
[sml]This text is smaller but has the same baseline as regular text[sml]
```

The `[sup]` tag is useful for exponentiation (e.g. `10[sup]n[sup]`) and the `[sub]` tag is useful for chemical formulas (e.g. `H[sub]2[sub]O`). All three of these classes scale text to 66% of the normal text size.

### Links

The `[link]` tag can be used to turn the name of any element or nuclide into a link with full hover and click event behavior. It's used like this:

```
This is a link to [link]Hydrogen[link].
This is a link to [link]Carbon-14[link].
```

The formatting code inspects the text of the link and tries to match it with elements and nuclides that exist in the dataset. If no match is found then no styles or event handlers are rendered. Capitalization and formatting count! Element links should use the element name *exactly* as it appears in the dataset and Isotope/Nuclide links should use the aforementioned element name followed by a hyphen and the *Z value* of the isotope (the sum of its protons and neutrons).

### Questions

Nuclides.org is built around answering questions about things, such as **What are Nuclides?** or **How do Atoms Decay?** Questions can be linked to appear as standard hyperlinks in captions like so:

```
An atom's atomic number is how many [q]protons|What is a Proton?[q] are in the nucleus.
```

Question links use the `[q]` tag and divide the text between tags with a pipe (`|`). The text to the left of the pipe is rendered inline in the caption (so in the example above would appear as a link but the sentence would be otherwise uniterrupted). The text to the right of the pipe should be the question title. The exact text provided to the right of the pipe will be placed in a `<title>` tag for the link (so it will be visible when a mouse hovers over the link for a second) and it will be converted into a `question_id` to generate a link (this conversion involves shifting everything to lowercase, dropping all punctuation, and replacing whitespace with underscores). In this way captialization does not matter, but words do.

### Line breaks

Line breaks in caption strings will directly translate to linebreaks in HTML/JavaScript and will thus not be rendered. SVG v1.1 does not have automatic line wrapping, so **you as the author are responsible for setting every line break**. This unfortunate limitation will hopefully be addressed in later versions of SVG.

The line break tag is `[br]`. Here's an example of how it might look:

```
This is the first line.[br]This is the second line.
```

To do a paragraph break do to `[br]` tags separated by a space:

```
This is the first paragraph.[br] [br]This is the second paragraph.
```

Since line breaks in code are not actual *things* (like the `<br>` in HTML) but instead the relative positioning of `<tspan>` objects the space in between in necessary for the `<tspan>` with only a line break to render and advance the cursor.

### Nesting Tags

This light markup has limited nesting support. Emphasis and Size/Position tags can be nested together like so:

```
This is the chemical formula for [em2]Water: H[sub]2[sub]O[em2].
```

**Line breaks, however, cannot be nested.** In order to put a line break in the middle of emphasis or positioning, just close any of those tags before the line break and start them over after the line break like so:

```
This sentence has a [em1]multi-line[em1][br][em1]emphasis[em1].
```

Avoid any nesting with the `[link]` tag since the contents thereof need to match against the dataset in order to work. Links should always be complete and unbroken... atomic, if you will.

## Strategy

### Composition and Audience

Element info captions are about three short paragraphs long. See the isotope page for [Hydrogen](http://nuclides.org?what_is_element#Hydrogran) for an example.

The caption should seek to give an overview for the element geared at a casual but interested reader. Common uses or places found in nature are worth including. Special attention should be given to highlighting particular isotopes that have significance since the application's focus is not just on the elements but on their isotopes as well. Seek to answer: *what isotopes of this element are interesting and why?*

### Formatting and Compatibility

Be sure to refresh your caption in the application often as you compose it. Much of caption writing is the tedious task of placing line breaks which can only realistically be done through trial, error, and lots of application refreshes.

Please consider checking how your caption appears in different types of browsers and at different window sizes. There is some variation with how SVG text is displayed across different browsers that can make a well-written application overlap other content or otherwise be difficult to read.

### A Refresh Shortcut

Nuclides.org supports a URL syntax for jumping directly to a given layout on load. Here are some examples:

* [http://nuclides.org?nuclides](http://nuclides.org?nuclides) - Start at the Chart of Nuclides
* [http://nuclides.org?isotopes#1](http://nuclides.org?isotopes#1) - Start at Isotopes of Hydrogen

This can be useful when working on an element caption and reloading regularly. Load the local instance of the application and navigate to the element you're working on, then look at the URL (these URLs change automatically as one navigates the application for browsers that support the HTML5 `pushState()` method). Refresh that URL to always start on the same element's page.

If your browser does not support HTML5 `pushState()` you won't see URLs change automatically as you navigate, but you can hand-write the URL to get to your desired element.

## Submitting Finished Captions

Finshed writing a caption? Great! [Submit a pull request](https://help.github.com/articles/using-pull-requests/) back upstream. This is the preferred method for submitting any changes to the application including captions and ensures that your work is attributed to you in full.

If you're shy about creating a pull request a simpler alternative would be to [file an issue](https://github.com/Frencil/galaxy_of_nuclides/issues) proposing the new caption with your full caption included. Be sure to note which element your caption is for.

Finally, if you get this far and choose to sbumit your work, **thank you!** Contributions are always welcome and encouraged.
