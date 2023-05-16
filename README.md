<div align="center">
  <h1>Schillinger Rhythm Generator 🎼:</h1>
  <strong>By Jamie Barlow</strong>
</div>

## Purpose / Background :bulb:

- Working in collaboration with a composer and specialist in the [Schillinger System of Musical Composition](https://en.wikipedia.org/wiki/Schillinger_System), the aim of this project is to develop an application which can generate rhythms based on a numerical user input. It can serve as a tool for sparking creative inspiration, while teaching key elements of Joseph Schillinger's rhythmic theory, which can have many creative uses for composers and songwriters.
- To demonstrate that varied and effective rhythms can be created from almost any series of numbers, the app is designed to take user input in the form of a sequence of digits, which could be entered manually (e.g. 1240652) or come from a less manual/predictable 'in-world' source, such as a barcode. You really can create a rhythm from a can of beans (without needing to hit it)! 
- User-generated beats are represented in the sequencer, against a consistent 'pulse' rhythm. The interaction between this regular pulse and the irregular (or regular) user-generated pattern is key to the Schillinger rhythm system - the 2 patterns will go in and out of phase, or sync, but return to their original relationship at certain intervals. Schillinger calls these 'interference patterns', referring to the relationship between simultaneous rhythmic patterns. We hear many of these rhythms in nature, and this method is therefore an interesting way of conceptualising it and applying it to musical composition.
- How are the user patterns generated? Each individual number in the sequence defines the length of a beat division and therefore the length of the 'rest' before each subsequent beat - for example: 
  - '0' contains no information for beats or rests, and is therefore ignored;
  - '1' defines a single beat which is followed immediately by another beat/number;
  - '2' defines a beat followed by a rest, taking up 2 beat divisions in total;
  - '3' defines a beat followed by a rest of 2 beat divisions, taking up 3 beat divisions in total;
  - '4 defines a beat followed by a rest of 3 beat divisions, taking up 4 beat divisions in total;
  - etc.
- The pattern is translated into a pattern in the app's drum sequencer, an interface which should be familiar to many musicians. This can be edited dynamically by the user to experiment with different patterns, adding or removing beats for each instrument.
- Once the pattern has been created, the intention of the app is to allow the musician to alter their in a number of interesting and idea-inspiring ways. Schillinger's 'interference patterns' work with symmetry, so the ability to convert a pattern into a symmetrical one is key for this particular approach, alongside further 'preset' tweaking options:
  - Rotating the pattern;
  - A 'regen' option to generate an alternative version of the pattern;
  - Changing the instrumentation, i.e. samples;
  - Change the character of the pattern - e.g. slow, or offbeat;
  - Different musical divisions or time signatures

## Features :heavy_check_mark:

- Drum sequencer - can be used like a regular sequencer. Clicking any cell will add or remove a beat;
- Numerical input for users - creates a beat against the pulse;
- Tempo slider for adjusting BPM;
- User-adjustable pattern length (default is 16 beats, or the total length of the user-input beat if entered);
- Regular/irregular pattern selection, which affects the user-generated pattern as follows:
  - if 'regular' is selected, a user-generated pattern with an odd length will have rests added to make up an even pattern length - therefore the pulse will always remain consistent as the pattern cycles through.
  - if 'irregular' is selected, the pattern will always take the total length of the user-generated pattern, even if this results in an irregular pulse.

## Technologies :floppy_disk:

- HTML/CSS
- JavaScript
- p5.js with p5.sound library (extends native Web Audio API functionality)

## How to Use :page_with_curl:

- 

## Development Challenges :wrench:

- 

## Upcoming features :hourglass:

- 

## License :scroll:

- [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)
