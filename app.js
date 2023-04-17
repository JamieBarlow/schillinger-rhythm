// navigator.permissions.query({ name: "midi", sysex: true }).then((result) => {
//     if (result.state === "granted") {
//       console.log('Access granted');
//     } else if (result.state === "prompt") {
//       console.log('Prompt for permission')
//     }
//     // console.log('Permission was denied by user prompt or permission policy');
//   });


if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(success, failure);
}

function success(midiAccess) {
    console.log(midiAccess);
    midiAccess.addEventListener('statechange', updateDevices);

    const inputs = midiAccess.inputs;
    console.log(inputs);
    inputs.forEach(input => {
        if (input.name !== "Komplete Audio 6 MIDI") {                       // Komplete Audio 6 MIDI logs constant MIDI data, this is excluding that input
            input.addEventListener('midimessage', handleInput);
        }
    })
}

function failure(err) {
    console.warn('The Web MIDI API is not supported in this browser', err);
}

// Logs MIDI inputs
function handleInput(event) {
    if (event.data[2] <= 35) {
        document.body.style.backgroundColor = "red";
    } else {
        document.body.style.backgroundColor = "white";
    }
    console.log(event);
}

// registers any change to connected MIDI devices
function updateDevices(event) {
    console.log(event);
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}


// instrument parts
let bd, snare, hh;           // instrument. This serves as a container that will hold a sound source.
let bdPat, snarePat, hhPat;  // pattern. Will be an array of numbers (1 = on-note, 0 = rest)
let bdPhrase, snarePhrase, hhPhrase;  // defines how the pattern is interpreted
let drums;  // full drum part. We will attach the phrase to the part, which will serve as our transport to drive the phrase.
let bpmControl;
let beatLength;
let cellWidth;
let numInstruments;

// p5 sketch setup
function setup() {
    createCanvas(320, 60);
    beatLength = 16;
    numInstruments = 3;
    cellWidth = width/beatLength;

    hh = loadSound('assets/MPC60/CH 909 A MPC60 07.wav', () => {});  // return to this callback later
    snare = loadSound('assets/MPC60/Snare Wood Tail Short MPC60 13.wav', () => {});  // return to this callback later
    bd = loadSound('assets/MPC60/BD Club Pressure MPC60 11.wav', () => {});  // return to this callback later

    hhPat = [0, 1, 0, 1, 0, 0, 1, 1];
    snarePat = [0, 0, 0, 0, 1, 0, 0, 0];
    bdPat = [1, 0, 0, 0, 1, 0, 0, 0];
    hhPhrase = new p5.Phrase('hh', (time) => {
        hh.play(time);
        console.log(time);
    }, hhPat); 
    snarePhrase = new p5.Phrase('snare', (time) => {
        snare.play(time);
        console.log(time);
    }, snarePat); 
    bdPhrase = new p5.Phrase('bd', (time) => {
        bd.play(time);
        console.log(time);
    }, bdPat); 

    drums = new p5.Part();

    drums.addPhrase(hhPhrase);
    drums.addPhrase(snarePhrase);
    drums.addPhrase(bdPhrase);

    bpmControl = createSlider(30, 300, 120, 1);
    bpmControl.position(10, 70);
    bpmControl.input(() => {drums.setBPM(bpmControl.value())});

    drums.setBPM('120');

    background(80);
    stroke('gray');
    strokeWeight(2);
    for (let i = 0; i < beatLength + 1; i++) {
        // startx, starty, endx, endy
        line(i * cellWidth, 0, i * cellWidth, height);
    }
    for (let i = 0; i < 4; i++) {
        line(0, i * height/numInstruments, width, i * height/numInstruments);
    }
    noStroke();
    for (let i = 0; i < beatLength; i++) {
        if (hhPat[i] === 1) {
            ellipse(i*cellWidth + 0.5*cellWidth, 0.5*cellWidth, 10);
        }
        if (snarePat[i] ===1) {
            ellipse(i*cellWidth + 0.5*cellWidth, 1.5*cellWidth, 10);
        }
        if (bdPat[i] === 1) {
            ellipse(i*cellWidth + 0.5*cellWidth, 2.5*cellWidth, 10);
        }
    }
}

// Toggle drum loop on pressing spacebar
function keyPressed() {
    if (key === " ") {
        if (hh.isLoaded() && snare.isLoaded() && bd.isLoaded()) {
            if (!drums.isPlaying) {
                drums.loop();
            } else {
                drums.stop();
            }
        } else {
            console.log('Samples have not loaded yet, please wait')
        }
    }
}