// instrument parts
let bd, snare, hh, pulse; // instrument. This serves as a container that will hold a sound source.
let sounds = {};
let bdDisplay, snareDisplay, hhDisplay, pulseDisplay; // display pattern. These may cycle/update depending on the grid
let bdPat, snarePat, hhPat, pulsePat; // actual pattern (fixed, may differ from diplay pattern)
let bdPhrase, snarePhrase, hhPhrase, pulsePhrase; // defines how the pattern is interpreted
let drums; // full drum part. We will attach the phrase to the part, which will serve as our transport to drive the phrase.
let numInput;

// Patterns: 1 = beat, 0 = rest
let userPattern = [];
snareDisplay = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
hhDisplay = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
pulseDisplay = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
bdDisplay = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
pulsePat = [1, 0, 1, 0];

// controls and playhead
let bpmControl;
let playhead = [];

// sequence lengths
let userPatternLength;
let userSequenceLength;
let sequenceLength = 16; // actual length of sequence - determined via userPatternLength or (optionally) userSequenceLength
// recycled patterns
let cycleCounter = 1;
let pulseCounter = 0;
let recycledUserPtns = [];
let recycledPulse = [];
// canvas
let cellWidth;
let numInstruments;
let cnv;
let sqSize = 40;

let context;

// RGB / RGBA color values
let bgColor = [84, 121, 146];
let bgStroke = [36, 66, 86];
let playheadBgColor = [204, 20, 45, 20];

// Preload runs before setup
function preload() {
  hh = loadSound("assets/MPC60/CH 909 A MPC60 07.wav", () => {}); // return to this callback later
  snare = loadSound(
    "assets/MPC60/Snare Wood Tail Short MPC60 13.wav",
    () => {}
  ); // return to this callback later
  bd = loadSound("assets/MPC60/BD Club Pressure MPC60 11.wav", () => {}); // return to this callback later
  pulse = loadSound("assets/DMX/CH Acc DMX 21.wav", () => {});
  sounds = { hh, snare, pulse, bd };
}

// p5 sketch setup - runs after preload
function setup() {
  // mimics Google autoplay policy
  getAudioContext().suspend();
  setupVolumeControls();
  setupCanvas();
  createPlayhead();
  setupDrumPart();
  setupBPMControl();
  noLoop(); // draw() runs once only after this on setup, unless triggered with redraw()
  // redraw();
}

// Function for drawing sequencer grid. Refreshes each time you click a cell with the canvasPressed() function
function draw() {
  let userPtn = snareDisplay;
  if (userSequenceLength > userPatternLength) {
    userPtn = extendPtn();
  }
  resizeCanvas(sqSize * sequenceLength, sqSize * numInstruments);
  cellWidth = width / sequenceLength;
  // createPlayhead();
  colorMode(RGB);
  background(...bgColor);
  stroke(...bgStroke);
  strokeWeight(2);
  fill("white");

  // Draw column grid lines
  for (let i = 0; i < sequenceLength + 1; i++) {
    // startx, starty, endx, endy
    line(i * cellWidth, 0, i * cellWidth, height);
  }
  // Draw row grid lines
  for (let i = 0; i < 4; i++) {
    line(
      0,
      (i * height) / numInstruments,
      width,
      (i * height) / numInstruments
    );
  }
  noStroke();
  // Drawing circles in column for pattern (updated with canvasPressed() function when user clicks)
  let circleSize = sqSize * 0.45;
  for (let i = 0; i < sequenceLength; i++) {
    if (hhDisplay[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, 0.5 * cellWidth, circleSize);
    }
    if (userPtn[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, 1.5 * cellWidth, circleSize);
    }
    if (pulseDisplay[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, 2.5 * cellWidth, circleSize);
    }
    if (bdDisplay[i] === 1) {
      ellipse(i * cellWidth + 0.5 * cellWidth, 3.5 * cellWidth, circleSize);
    }
  }
}

function setupCanvas() {
  sequenceLength = snareDisplay.length; // determines num of cols. Default 16
  numInstruments = 4; // determines num of rows
  cnv = createCanvas(sqSize * sequenceLength, sqSize * numInstruments);
  cnv.parent("sequencerLanes");
  cnv.mousePressed(canvasPressed);
}

function setupBPMControl() {
  //BPM slider
  drums.setBPM("120");
  bpmControl = createSlider(30, 300, 120, 1);
  bpmControl.parent("bpmSlider");
  let bpmValue = document.querySelector("#bpmValue");
  bpmControl.input(() => {
    drums.setBPM(bpmControl.value());
    bpmValue.innerText = "BPM " + bpmControl.value();
  });
}

function setupVolumeControls() {
  // Setup track volume sliders
  let volumeSliders = document.querySelectorAll(".volumeSlider");
  let volumeIcons = document.querySelectorAll('sl-icon[name="volume-up"]');
  for (let i = 0; i < volumeSliders.length; i++) {
    let amplitude = new p5.Amplitude();
    let sound = volumeSliders[i].getAttribute("sound");
    amplitude.setInput(sounds[sound]);
    volumeSliders[i].addEventListener("input", function () {
      sounds[sound].setVolume(this.value / 100);
    });
    // Setup mute buttons
    let muteBtn = volumeIcons[i];
    muteBtn.addEventListener("click", () => {
      if (muteBtn.getAttribute("name") === "volume-up") {
        muteBtn.setAttribute("name", "volume-mute");
        sounds[sound].setVolume(0);
        volumeSliders[i].value = 0;
      } else {
        muteBtn.setAttribute("name", "volume-up");
        sounds[sound].setVolume(0.8);
        volumeSliders[i].value = 80;
      }
    });
  }
}

function setupDrumPart() {
  addPhrases();
  drums = new p5.Part();
  drums.addPhrase(hhPhrase);
  drums.addPhrase(snarePhrase);
  drums.addPhrase(pulsePhrase);
  drums.addPhrase(bdPhrase);
  drums.addPhrase("seq", sequence, playhead);
}

function addPhrases() {
  hhPhrase = new p5.Phrase(
    "hh",
    (time) => {
      hh.play(time);
      // console.log(time);
    },
    hhDisplay
  );
  snarePhrase = new p5.Phrase(
    "snare",
    (time) => {
      snare.play(time);
      // console.log(time);
    },
    snareDisplay
  );
  bdPhrase = new p5.Phrase(
    "bd",
    (time) => {
      bd.play(time);
      // console.log(time);
    },
    bdDisplay
  );
  pulsePhrase = new p5.Phrase(
    "pulse",
    (time) => {
      pulse.play(time);
      // console.log(time);
    },
    pulsePat
  );
}

// Set sequenceLength according to either userPatternLength or (optional) user sequence length
function setSequenceLength() {
  numInput = document.querySelector("#numInput");
  userPattern = Array.from(numInput.value.split(""), Number);
  userPatternLength = userPattern.reduce((a, b) => a + b);
  userSequenceLength = document.querySelector("#userSequenceLength").value;
  if (!userSequenceLength) {
    sequenceLength = userPatternLength;
  } else {
    sequenceLength = userSequenceLength;
  }
  console.log("Resulting pattern length: " + sequenceLength);
}

// Converts a pattern of humbers input by the user to 1s and 0s. Called on clicking 'Apply Rhythm' button in browser
function applyRhythm() {
  // Select regular or irregular metre
  const selectMetre = document.querySelector("#metre").value;
  setSequenceLength();
  // Reset phrases
  let soundsArray = Object.keys(sounds);
  for (let sound of soundsArray) {
    drums.removePhrase(sound);
  }
  // Update patterns based on user input
  let currentPat = convertNumsToPattern(
    userPattern,
    sequenceLength,
    selectMetre
  );
  snareDisplay = currentPat;
  pulseDisplay = createPulse();
  bdDisplay = new Array(Number(sequenceLength)).fill(0);
  hhDisplay = new Array(Number(sequenceLength)).fill(0);
  addPhrases();
  drums.addPhrase(snarePhrase);
  drums.addPhrase(pulsePhrase);
  drums.addPhrase(bdPhrase);
  drums.addPhrase(hhPhrase);

  // Reset Playhead to account for change of pattern length
  drums.removePhrase("seq");
  createPlayhead();
  drums.addPhrase("seq", sequence, playhead);
  updateCycleDisplay();
  redraw();
  noLoop();
}

function createPulse() {
  pulseDisplay = [];
  console.log(sequenceLength);
  if (isIrregular(sequenceLength)) {
    const halfBeatLength = Math.floor(sequenceLength / 2);
    for (let i = 0; i < halfBeatLength; i++) {
      pulseDisplay.push(1, 0);
    }
    // Makes up final beat if sequence length is odd/irregular
    pulseDisplay.push(1);
    recycledPulse.push(pulseDisplay);
    // Adding rotated pulse to cycle through
    const rotatedPulse = [...pulseDisplay];
    rotatePtn(rotatedPulse, 1);
    rotatedPulse[rotatedPulse.length - 1] = 0; // ensure 1s and 0s continue to alternate
    recycledPulse.push(rotatedPulse);
    console.log(recycledPulse);
  } else {
    for (let i = 0; i < sequenceLength / 2; i++) {
      pulseDisplay.push(1, 0);
    }
  }

  return pulseDisplay;
}

// Toggle drum loop on pressing spacebar
function keyPressed() {
  if (key === " ") {
    startSequence();
  }
}

// Toggle drum loop on clicking start button
window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.querySelector("#startBtn");
  startBtn.addEventListener("click", () => {
    startSequence();
  });
});

// Play audio on user prompt
function startSequence() {
  // Create cycles of user pattern if the overall sequence length is longer
  if (userSequenceLength > userPatternLength) {
    recycledUserPtns = [[]];
    let cycle1 = extendPtn();
    recyclePtn(cycle1);
  }
  cycleCounter = 1;
  pulseCounter = 0;

  context = new AudioContext();
  context.onstatechange = function () {
    console.log(context.state);
  };
  if (hh.isLoaded() && snare.isLoaded() && bd.isLoaded()) {
    if (!drums.isPlaying) {
      drums.metro.metroTicks = 0;
      userStartAudio(); // required to ensure Audio Context is enabled via user prompt
      drums.loop();
      startBtn.innerHTML = 'Stop<i class="fa-solid fa-stop" slot="prefix"></i>';
      startBtn.variant = "danger";
    } else {
      drums.stop();
      startBtn.innerHTML = 'Play<i class="fa-solid fa-play" slot="prefix"></i>';
      startBtn.variant = "success";
    }
  } else {
    console.log("Samples have not loaded yet, please wait");
  }
}

function canvasPressed() {
  let rowClicked = floor((numInstruments * mouseY) / height);
  let indexClicked = floor((sequenceLength * mouseX) / width);
  if (rowClicked === 0) {
    console.log("first row " + indexClicked);
    hhDisplay[indexClicked] = toggle(hhDisplay[indexClicked]);
  } else if (rowClicked === 1) {
    console.log("second row " + indexClicked);
    snareDisplay[indexClicked] = toggle(snareDisplay[indexClicked]);
  } else if (rowClicked === 2) {
    console.log("third row " + indexClicked);
    pulseDisplay[indexClicked] = toggle(pulseDisplay[indexClicked]);
  } else if (rowClicked === 3) {
    console.log("fourth row " + indexClicked);
    bdDisplay[indexClicked] = toggle(bdDisplay[indexClicked]);
  }
  redraw();
}

// Reverses / toggles the state of a sample - either '1' (active) or '0' (inactive)
function toggle(bitInput) {
  return bitInput === 1 ? 0 : 1;
}

// Create an array of incrementing numbers representing the steps of the playhead
function createPlayhead() {
  playhead = [];
  for (let i = 0; i < sequenceLength; i++) {
    playhead.push(i + 1);
  }
}

// Runs on each step of the sequence. This is passed in to drums.addPhrase('seq', sequence, playhead)
function sequence(time, beatIndex) {
  if (cycleCounter === userPatternLength) {
    cycleCounter = 0;
  }
  console.log("beatIndex " + beatIndex);
  // Extending pattern to fit into a longer sequence (if user sets sequence length to longer than pattern)
  if (
    userSequenceLength > userPatternLength &&
    beatIndex == userSequenceLength
  ) {
    console.log("end of sequence");
    cycleCounter++;
    snareDisplay = recycledUserPtns[cycleCounter];
    updateCycleDisplay();
    console.log(`cycle counter: ${cycleCounter}`);
  }
  // Updating/toggling pulse cycle for irregular patterns (odd length)
  if (isIrregular(sequenceLength) && beatIndex === sequenceLength) {
    pulseCounter === 0 ? (pulseCounter = 1) : (pulseCounter = 0);
    pulseDisplay = recycledPulse[pulseCounter];
    console.log(`pulse counter: ${pulseCounter}`);
  }
  // Synchronising playhead with beat by delaying playhead. By default this is out of sync because the callback runs ahead of the beat
  setTimeout(() => {
    redraw();
    drawPlayhead(beatIndex);
  }, time * 1000); // 'time' method returns time in seconds, so converting to ms
}

function drawPlayhead(beatIndex) {
  stroke("red");
  fill(...playheadBgColor);
  rect((beatIndex - 1) * cellWidth, 0, cellWidth, height);
}

/* This function allows you to input an array of numbers to convert to a beat pattern. If you make selectMetre 'true', the pattern will add an extra beat to create a regular meter */
function convertNumsToPattern(nums, sequenceLength, selectMetre) {
  let cycle1 = [];
  for (let i = 0; i < nums.length; i++) {
    // Creates a note for each number in the pattern (apart from 0s) - this consists of a 1, followed by the correct number of 0s (rests)
    if (nums[i] !== 0) {
      const note = new Array(nums[i] - 1).fill(0);
      cycle1.push(1, ...note);
    }
  }
  let originalPtn = [...cycle1];
  // fills out the remainder of the overall beat if regular metre is selected, so that the cycle restarts on beat loop
  if (selectMetre === "regular" && isIrregular(sequenceLength) === true) {
    sequenceLength++;
  }
  return originalPtn;
}

function getNotes(pattern) {
  let outputPtn = [];
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) {
      // Creates a note for each number in the pattern - this consists of a 1, followed by the correct number of 0s (rests)
      const noteLength = new Array(nums[i] - 1).fill(0);
      outputPtn.push(1, ...noteLength);
    }
  }
  return outputPtn;
}

// If the pattern doesn't contain an even number of userSequenceLength, this function returns true
function isIrregular(sequenceLength) {
  return sequenceLength % 2 !== 0 ? true : false;
}

// extends the pattern if shorter than the sequence length
function extendPtn() {
  let originalPtn = snareDisplay.slice();
  let cycle1 = originalPtn.slice();
  let remainder = userSequenceLength - userPatternLength;
  // fill out remainder of sequence
  if (remainder) {
    for (let i = 0; i < remainder; i++) {
      cycle1.push(originalPtn[i]);
    }
  }
  console.log(`original pattern: ${originalPtn}`);
  console.log(`pattern extended to fit sequence length: ${cycle1}`);
  return cycle1;
}

// Re-cycles through the pattern if the sequence length is longer than the length of the user pattern
function recyclePtn(cycle1) {
  let originalPtn = snareDisplay.slice();
  let remainder = userSequenceLength - userPatternLength;
  let toFill = remainder;
  // Modify array so that it can be redrawn on each cycle
  function cycles(arr) {
    for (let i = 0; i < originalPtn.length - 1; i++) {
      let cycle = arr.slice(remainder);
      for (let j = 0; j < remainder; j++) {
        cycle.push(arr[toFill]);
        toFill++;
      }
      toFill = remainder;
      return cycle;
    }
  }
  // Starting with cycle 1, run the cycles() function repeatedly on the output of each cycle and log the result.
  recycledUserPtns.push(cycle1);
  let cycle = cycle1;
  for (let i = 2; i <= originalPtn.length; i++) {
    cycle = cycles(cycle);
    console.log(`cycle number ${i}:`, cycle);
    recycledUserPtns.push(cycle);
  }
  console.log(`remainder: ${remainder}`);
  console.log(`converted output pattern: ${originalPtn}`);
  console.log(recycledUserPtns);
}

// Rotates an array 'in place' by a set number of places/rotations
function rotatePtn(nums, byPlaces) {
  if (nums.length === 0) return nums;
  byPlaces = byPlaces % nums.length; // Handle cases where byPlaces is greater than the array length - no redundant rotations

  for (let i = 0; i < byPlaces; i++) {
    const firstElement = nums.shift(); // Remove the first element
    nums.push(firstElement); // Add the first element to the end of the array
  }
  return nums;
}

function updateCycleDisplay() {
  let cycleDisplay = document.querySelector("#cycleDisplay");
  cycleDisplay.innerText = `Cycle ${cycleCounter} of ${
    sequenceLength > userPatternLength ? userPatternLength : 1
  }`;
}
