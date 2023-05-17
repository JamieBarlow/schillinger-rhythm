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

- Inconsistent playback speed - for a rhythm-based app this could be quite an issue! By default, the grid-based patterns do not play back 'on beat' but rather slow down or speed up erratically, like a drunken drummer. I therefore needed to pass in a scheduled delay time as a [callback](https://p5js.org/reference/#/p5.Phrase) to the p5.sound [play() method](https://p5js.org/reference/#/p5.SoundFile/play), in order to produce a clock time that would be consistent with the sample rate:

    ```javaScript
    snarePhrase = new p5.Phrase('snare', (time) => {
        snare.play(time);
    }, snarePat);
    ```
  The playhead also needs to be synchronised to the audio, so I needed to use `setTimeout()` to add some artifical latency (1000ms) to the code before firing the 'redraw' function, in order to ensure this matches playback:
 
    ```javascript
    function sequence(time, beatIndex) {
      setTimeout(() => {
        redraw();
        drawPlayhead(beatIndex);
      }, time * 1000);
    }
    ```

- The [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) is used for audio playback in the browser, but comes with some policy restrictions - understandably, auto-playback is restricted and the API therefore expects some form of explicit user interaction in order to allow permission to play audio. However, setting this up was more complex than anticipated - I was frequently faced with 'the Audio Context was not allowed to start' error messages, even if playback was linked to a play button or keyboard input. Creating an `AudioContext` object on page load before receiving a user gesture did not consistently have the [expected functionality](https://developer.chrome.com/blog/autoplay/#web-audio) - i.e. starting in a 'suspended' state, which could then be 'resumed' by the user. 

  I was able to resolve this with the right combination of settings - first, ensuring that the existing AudioContext was  suspended on setting up the page, which mimics Google's autoplay policy but more explicitly:

  ```javaScript
  function setup() {
    getAudioContext().suspend();
    ...
  }
  ```
  I also needed to create the AudioContext on the user's prompt, not on page load, and then resume the context, which I   achieved using the [p5.sound](https://p5js.org/reference/#/p5/userStartAudio) `userStartAudio()` function:
  
  ```javaScript
    // Play audio on user prompt
    function startSequence() {
      context = new AudioContext();
      ...
    if (!drums.isPlaying) {
      userStartAudio();
      drums.loop();
      } else {
        drums.stop();
      }
    }
  ```
  This appears to have fully resolved the error across browsers and user scenarios, while conforming to the autoplay  policy.
  
- The p5.sound method, [stop()](https://p5js.org/reference/#/p5.Part/stop), actually acts like a 'pause' function in practice, and does not cue the part to step 0. As I wanted the app to restart the pattern on each click of 'play', I needed to use the following manual workaround with the `Part.metro.metroTicks` property:

  ```javascript
  function startSequence() {
    if (!drums.isPlaying) {
      drums.metro.metroTicks = 0;
      userStartAudio();
      drums.loop();
    }
  }
  ```
  This required some experimentation with the [p5.Part](https://p5js.org/reference/#/p5.Part) object.
 
- User interface: updating the playback pattern when the user clicks a cell in the seqencer - I needed to implement both: 1) updating the visual sequencer grid, and 2) updating the sound sequence for playback. This was achieved by linking each 'block' within a sequencer row to an index number, determined by the mouseclick position within the grid (determined dynamically as the grid changes in size, linked to the number of instruments and the beat length):
 
    ```javaScript
    let rowClicked = floor(numInstruments * mouseY / height);
    let indexClicked = floor(beatLength * mouseX / width);
    ```
  
    Since each step of the sequence is defined as either '1' (beat) or '0' (rest), I was then able to tackle both visual and audio elements by adjusting the pattern with a simple invert function triggered by mouseclick:
  
    ```javaScript
    function invert(bitInput) {
      return bitInput === 1 ? 0 : 1;
    }
    ```
  
    This inversion was then fed into updating visual and audio respectively by: 1) updating the visual grid using the p5  function  `redraw()` using the [canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), and 2) updating the pattern itself:

    ```javascript
    function canvasPressed() {
      if (rowClicked === 0) {
        hhPat[indexClicked] = invert(hhPat[indexClicked]);
      } else if (rowClicked === 1) {
        snarePat[indexClicked] = invert(snarePat[indexClicked]);
      }
      // etc.
      redraw();
    }
    ```
 
 - Working with user-defined pattern/bar lengths and the sequencer display: this introduces quite a complex variable to the sequencer, which requires it to update dynamically as the sequence plays. If the sequence length is defined by the user input (default behaviour), this is fairly straightforward - for example, the input '12461' will result in a cycle of 14 beats (1+2+4+6+1 = 14) and the same sequence will simply cycle through with no need to adapt on each repetition. By contrast, if I apply the same input but set the sequence length to longer, e.g. 16 beats, the sequencer will not only need to fit the next cycle of the pattern into the remaining 2 beats in the bar, but will also need to 'shift' the pattern on the next cycle.

  One simple option here is to add rests to the end of the pattern, to make up for the remaining space. This may be desired by the user, allowing the pattern to remain consistent on each cycle, but doesn't take full advantage of the 'interference patterns' which makes Schillinger rhythm theory interesting in practice. The pattern would need the ability to dynamically shift on each cycle, and the app would need to redraw the visual pattern once the playhead reached the end of the sequence.

## Upcoming features :hourglass:

- 

## License :scroll:

- [GNU GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html)
