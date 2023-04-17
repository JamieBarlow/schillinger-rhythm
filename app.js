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


// p5 sketch setup
function setup() {
    createCanvas(400, 400);
    hh = loadSound('assets/MPC60/CH 909 A MPC60 07.wav', () => {drums.loop()});  // return to this callback later
    // snare = loadSound('assets/MPC60/Snare Wood Tail Short MPC60 13.wav', () => {drums.loop()});  // return to this callback later
    // bd = loadSound('assets/MPC60/BD Club Pressure MPC60 11.wav', () => {drums.loop()});  // return to this callback later

    hhPat = [1, 0, 1, 0, 1, 1, 1, 0];
    hhPhrase = new p5.Phrase('hh', (time) => {
        hh.play(time);
        console.log(time);
    }, hhPat);    // return to this callback later
    drums = new p5.Part();
    drums.addPhrase(hhPhrase);
}

function draw() {
    background(220);
}

// instrument parts
let bd, snare, hh;           // instrument. This serves as a container that will hold a sound source.
let bdPat, snarePat, hhPat;  // pattern. Will be an array of numbers (1 = on-note, 0 = rest)
let bdPhrase, snarePhrase, hhPhrase;  // defines how the pattern is interpreted
let drums;  // full drum part. We will attach the phrase to the part, which will serve as our transport to drive the phrase.