// MIDI handling

// navigator.permissions.query({ name: "midi", sysex: true }).then((result) => {
//     if (result.state === "granted") {
//       console.log('Access granted');
//     } else if (result.state === "prompt") {
//       console.log('Prompt for permission')
//     }
//     // console.log('Permission was denied by user prompt or permission policy');
//   });


// if (navigator.requestMIDIAccess) {
//     navigator.requestMIDIAccess().then(success, failure);
// }

// function success(midiAccess) {
//     console.log(midiAccess);
//     midiAccess.addEventListener('statechange', updateDevices);

//     const inputs = midiAccess.inputs;
//     console.log(inputs);
//     inputs.forEach(input => {
//         if (input.name !== "Komplete Audio 6 MIDI") {                       // Komplete Audio 6 MIDI logs constant MIDI data, this is excluding that input
//             input.addEventListener('midimessage', handleInput);
//         }
//     })
// }

// function failure(err) {
//     console.warn('The Web MIDI API is not supported in this browser', err);
// }

// // Logs MIDI inputs
// function handleInput(event) {
//     if (event.data[2] <= 35) {
//         document.body.style.backgroundColor = "red";
//     } else {
//         document.body.style.backgroundColor = "white";
//     }
//     console.log(event);
// }

// // registers any change to connected MIDI devices
// function updateDevices(event) {
//     console.log(event);
//     console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
// }


// instrument parts
let bd, snare, hh, pulse;           // instrument. This serves as a container that will hold a sound source.
let bdPat, snarePat, hhPat, pulsePat;  // pattern. Will be an array of numbers (1 = on-note, 0 = rest)
let bdPhrase, snarePhrase, hhPhrase, pulsePhrase;  // defines how the pattern is interpreted
let drums;  // full drum part. We will attach the phrase to the part, which will serve as our transport to drive the phrase.
let bpmControl;
let userPatternLength;
let sequenceLength;
let userSequenceLength;
let cellWidth;
let numInstruments;
let cnv;
let playhead = [];
let cursorPos;
let context;
let numInput;
let numBtn;
let cycleCounter = 1;
let recycledUserPtns = [];


// Patterns: 1 = beat, 0 = rest
let userPattern = [1, 0, 5, 4, 5];
snarePat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
hhPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
pulsePat = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,];
bdPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

// Preload runs before setup
function preload() {
    hh = loadSound('assets/MPC60/CH 909 A MPC60 07.wav', () => { });  // return to this callback later
    snare = loadSound('assets/MPC60/Snare Wood Tail Short MPC60 13.wav', () => { });  // return to this callback later
    bd = loadSound('assets/MPC60/BD Club Pressure MPC60 11.wav', () => { });  // return to this callback later
    pulse = loadSound('assets/DMX/CH Acc DMX 21.wav', () => { });
}

// p5 sketch setup - runs after preload
function setup() {
    // mimics Google autoplay policy
    getAudioContext().suspend();
    sequenceLength = snarePat.length;    // determines num of cols. Default 16
    numInstruments = 4;     // determines num of rows
    cnv = createCanvas(20 * sequenceLength, 20 * numInstruments);
    cnv.parent('sequencerLanes');
    cnv.mousePressed(canvasPressed);

    createPlayhead();
    hhPhrase = new p5.Phrase('hh', (time) => {
        hh.play(time);
        // console.log(time);
    }, hhPat);
    snarePhrase = new p5.Phrase('snare', (time) => {
        snare.play(time);
        // console.log(time);
    }, snarePat);
    bdPhrase = new p5.Phrase('bd', (time) => {
        bd.play(time);
        // console.log(time);
    }, bdPat);
    pulsePhrase = new p5.Phrase('pulse', (time) => {
        pulse.play(time);
        // console.log(time);
    }, pulsePat);


    drums = new p5.Part();
    drums.addPhrase(hhPhrase);
    drums.addPhrase(snarePhrase);
    drums.addPhrase(pulsePhrase);
    drums.addPhrase(bdPhrase);
    drums.addPhrase('seq', sequence, playhead)

    //BPM slider
    // bpmControl.position(10, 120);
    drums.setBPM('120');
    bpmControl = createSlider(30, 300, 120, 1);
    bpmControl.parent('bpmSlider')
    let bpmValue = document.querySelector('#bpmValue');
    bpmControl.input(() => {
        drums.setBPM(bpmControl.value());
        bpmValue.innerText = "BPM " + bpmControl.value();
    });


    noLoop();    // draw() runs once only after this on setup, unless triggered with redraw()
    // redraw();
}

// Function for drawing sequencer grid. Refreshes each time you click a cell with the canvasPressed() function
function draw() {
    let userPtn = snarePat;
    if (userSequenceLength > userPatternLength) {
        userPtn = extendPtn(snarePat);
    }
    resizeCanvas(20 * sequenceLength, 20 * numInstruments);
    cellWidth = width / sequenceLength;
    // createPlayhead();
    background(80);
    stroke('gray');
    strokeWeight(2);
    fill('white');

    cursorPos = 0;
    // Draw column grid lines
    for (let i = 0; i < sequenceLength + 1; i++) {
        // startx, starty, endx, endy
        line(i * cellWidth, 0, i * cellWidth, height);
    }
    // Draw row grid lines
    for (let i = 0; i < 4; i++) {
        line(0, i * height / numInstruments, width, i * height / numInstruments);
    }
    noStroke();
    // Drawing circles in column for pattern (updated with canvasPressed() function when user clicks)
    for (let i = 0; i < sequenceLength; i++) {
        if (hhPat[i] === 1) {
            ellipse(i * cellWidth + 0.5 * cellWidth, 0.5 * cellWidth, 10);
        }
        if (userPtn[i] === 1) {
            ellipse(i * cellWidth + 0.5 * cellWidth, 1.5 * cellWidth, 10);
        }
        if (pulsePat[i] === 1) {
            ellipse(i * cellWidth + 0.5 * cellWidth, 2.5 * cellWidth, 10);
        }
        if (bdPat[i] === 1) {
            ellipse(i * cellWidth + 0.5 * cellWidth, 3.5 * cellWidth, 10);
        }
    }
}

// Converts a pattern of humbers input by the user to 1s and 0s. Called on clicking 'Apply Rhythm' button in browser
function applyRhythm() {
    // Select regular or irregular metre
    const selectMetre = document.querySelector('#metre').value;
    // Get user input and convert to array (pattern)
    numInput = document.querySelector('#numInput');
    userPattern = Array.from(numInput.value.split(''), Number);
    userPatternLength = userPattern.reduce((a, b) => a + b);
    // Define beat length either by user pattern (default) or fixed user value
    userSequenceLength = document.querySelector('#userSequenceLength').value;

    console.log(`user defined sequence length: ${userSequenceLength}`)
    console.log(`user pattern length (including rests if 'regular'): ${userPatternLength}`)

    if (!userSequenceLength) {
        sequenceLength = userPatternLength;
    } else {
        sequenceLength = userSequenceLength;
    }
    console.log("Resulting pattern length: " + sequenceLength)

    // Reset current snare phrase and convert to new user phrase
    drums.removePhrase('snare');
    let currentPat = convertNumsToPattern(userPattern, sequenceLength, selectMetre);
    snarePat = currentPat;
    snarePhrase = new p5.Phrase('snare', (time) => {
        snare.play(time);
    }, snarePat);
    drums.addPhrase(snarePhrase);

    drums.removePhrase('pulse');
    pulsePat = createPulse();
    pulsePhrase = new p5.Phrase('pulse', (time) => {
        pulse.play(time);
    }, pulsePat);
    drums.addPhrase(pulsePhrase);

    // Reset other phrases
    drums.removePhrase('bd');
    bdPat = new Array(sequenceLength).fill(0);
    bdPhrase = new p5.Phrase('bd', (time) => {
        bd.play(time);
    }, bdPat);
    drums.addPhrase(bdPhrase);

    drums.removePhrase('hh');
    hhPat = new Array(sequenceLength).fill(0);
    hhPhrase = new p5.Phrase('hh', (time) => {
        hh.play(time);
    }, hhPat);
    drums.addPhrase(hhPhrase);

    // Reset Playhead to account for change of pattern length
    drums.removePhrase('seq');
    createPlayhead();
    drums.addPhrase('seq', sequence, playhead);

    redraw();
    noLoop();
}

function createPulse() {
    pulsePat = [];
    console.log(sequenceLength);
    if (isIrregular(sequenceLength) === true) {
        const halfBeatLength = Math.floor(sequenceLength / 2);
        for (let i = 0; i < halfBeatLength; i++) {
            pulsePat.push(1, 0);
        }
        pulsePat.push(1);
    } else {
        for (let i = 0; i < sequenceLength / 2; i++) {
            pulsePat.push(1, 0);
        }
    }
    return pulsePat;
}

// Toggle drum loop on pressing spacebar
function keyPressed() {
    if (key === " ") {
        startSequence();
    }
}

// Toggle drum loop on clicking start button
window.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.querySelector('#startBtn');
    startBtn.addEventListener('click', () => {
        startSequence();
    })
});

// Play audio on user prompt
function startSequence() {
    if (userSequenceLength > userPatternLength) {
        recycledUserPtns = [[]];
        let cycle1 = extendPtn();
        recyclePtn(cycle1);
    }
    cycleCounter = 1;
    context = new AudioContext();
    context.onstatechange = function () {
        console.log(context.state);
    }
    if (hh.isLoaded() && snare.isLoaded() && bd.isLoaded()) {
        if (!drums.isPlaying) {
            drums.metro.metroTicks = 0;
            userStartAudio();                                                  // required to ensure Audio Context is enabled via user prompt
            drums.loop();
            startBtn.firstChild.innerHTML = '<i class="fa-solid fa-stop"></i>';
        } else {
            drums.stop();
            startBtn.firstChild.innerHTML = '<i class="fa-solid fa-play"></i>';
        }
    } else {
        console.log('Samples have not loaded yet, please wait')
    }
}

function canvasPressed() {
    let rowClicked = floor(numInstruments * mouseY / height);
    let indexClicked = floor(sequenceLength * mouseX / width);
    if (rowClicked === 0) {
        console.log('first row ' + indexClicked);
        hhPat[indexClicked] = invert(hhPat[indexClicked]);
    } else if (rowClicked === 1) {
        console.log('second row ' + indexClicked);
        snarePat[indexClicked] = invert(snarePat[indexClicked]);
    } else if (rowClicked === 2) {
        console.log('third row ' + indexClicked);
        pulsePat[indexClicked] = invert(pulsePat[indexClicked]);
    } else if (rowClicked === 3) {
        console.log('fourth row ' + indexClicked);
        bdPat[indexClicked] = invert(bdPat[indexClicked]);
    }
    redraw();
}

// Reverses / toggles the state of a sample - either '1' (active) or '0' (inactive)
function invert(bitInput) {
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
    console.log(userPatternLength);
    if (cycleCounter === userPatternLength) cycleCounter = 0;
    console.log("beatIndex " + beatIndex);
    if (beatIndex == userSequenceLength) {
        console.log('end of sequence')
        cycleCounter++;
        snarePat = recycledUserPtns[cycleCounter];
        console.log(`cycle counter: ${cycleCounter}`)
    }
    // Synchronising playhead with beat by delaying playhead. By default this is out of sync because the callback runs ahead of the beat
    setTimeout(() => {
        redraw();
        drawPlayhead(beatIndex);
    }, time * 1000);                         // 'time' method returns time in seconds, so converting to ms
}

function drawPlayhead(beatIndex) {
    stroke('red');
    fill(255, 0, 0, 30);
    rect((beatIndex - 1) * cellWidth, 0, cellWidth, height);
}

/* This function allows you to input an array of numbers to convert to a beat pattern. If you enter the boolean value true for the second argument, 
the pattern will add an extra beat to create a regular meter */
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
    if (selectMetre === 'regular' && (isIrregular(sequenceLength)) === true) {
        sequenceLength++;
        originalPtn.push(0);
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
    return (sequenceLength % 2 !== 0) ? true : false;
}

// extends the pattern if shorter than the 
function extendPtn() {
    let originalPtn = snarePat.slice();
    let cycle1 = originalPtn.slice();
    console.log('user sequence length is longer than the pattern')
    let remainder = userSequenceLength - userPatternLength;
    let toFill = remainder;
    // fill out remainder of sequence
    for (let i = 0; i < remainder; i++) {
        if (remainder > originalPtn.length) {
            console.log('need to repeat this until the sequence is filled!')
        }
        cycle1.push(originalPtn[i]);
    }
    console.log(`original pattern: ${originalPtn}`);
    console.log(`pattern extended to fit sequence length: ${cycle1}`);
    return cycle1;
}

// Re-cycles through the pattern if the user sequence length is longer than the length of the user pattern
function recyclePtn(cycle1) {
    let originalPtn = snarePat.slice();
    let remainder = userSequenceLength - userPatternLength;
    let toFill = remainder;
    // Modify array so that it can be redrawn on each cycle
    function cycles(arr) {
        for (let i = 0; i < (originalPtn.length - 1); i++) {
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
    console.log(`remainder: ${remainder}`)
    console.log(`converted output pattern: ${originalPtn}`)
    console.log(recycledUserPtns);
}



