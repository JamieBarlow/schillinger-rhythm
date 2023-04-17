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


// p5 sketch

function setup() {
    createCanvas(400, 400);
}

function draw() {
    background(220);
}