import React from "react";
import { useEffect, useRef } from "react";
import p5 from "p5";

// instrument parts
let bd, snare, hh, pulse; // instrument. This serves as a container that will hold a sound source.
let bdPat, snarePat, hhPat, pulsePat; // pattern. Will be an array of numbers (1 = on-note, 0 = rest)
let bdPhrase, snarePhrase, hhPhrase, pulsePhrase; // defines how the pattern is interpreted
let drums; // full drum part. We will attach the phrase to the part, which will serve as our transport to drive the phrase.
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
pulsePat = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
bdPat = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

export default function Sequencer() {
  const renderRef = useRef();
  const canvasCreated = useRef(false);
  useEffect(() => {
    // Conditional to prevent multiple canvases being created
    if (!canvasCreated.current) {
      new p5((p) => {
        p.setup = () => {
          //   getAudioContext().suspend();
          sequenceLength = snarePat.length; // determines num of cols. Default 16
          numInstruments = 4;
          cnv = p
            .createCanvas(40 * sequenceLength, 40 * numInstruments)
            .parent(renderRef.current)
            .mousePressed(canvasPressed);
        };
        p.draw = () => {
          let userPtn = snarePat;
          if (userSequenceLength > userPatternLength) {
            userPtn = extendPtn(snarePat);
          }
          p.resizeCanvas(40 * sequenceLength, 40 * numInstruments);
          cellWidth = p.width / sequenceLength;
          p.background(80);
          p.stroke("gray");
          p.strokeWeight(2);
          p.fill("white");

          cursorPos = 0;
          // Draw column grid lines
          for (let i = 0; i < sequenceLength + 1; i++) {
            // startx, starty, endx, endy
            p.line(i * cellWidth, 0, i * cellWidth, p.height);
          }
          // Draw row grid lines
          for (let i = 0; i < 4; i++) {
            p.line(
              0,
              (i * p.height) / numInstruments,
              p.width,
              (i * p.height) / numInstruments
            );
          }
          p.noStroke();
          // Drawing circles in column for pattern (updated with canvasPressed() function when user clicks)
          for (let i = 0; i < sequenceLength; i++) {
            if (hhPat[i] === 1) {
              p.ellipse(i * cellWidth + 0.5 * cellWidth, 0.5 * cellWidth, 10);
            }
            if (userPtn[i] === 1) {
              p.ellipse(i * cellWidth + 0.5 * cellWidth, 1.5 * cellWidth, 10);
            }
            if (pulsePat[i] === 1) {
              p.ellipse(i * cellWidth + 0.5 * cellWidth, 2.5 * cellWidth, 10);
            }
            if (bdPat[i] === 1) {
              p.ellipse(i * cellWidth + 0.5 * cellWidth, 3.5 * cellWidth, 10);
            }
          }
        };

        // Reverses / toggles the state of a sample - either '1' (active) or '0' (inactive)
        function invert(bitInput) {
          return bitInput === 1 ? 0 : 1;
        }

        function canvasPressed() {
          let rowClicked = Math.floor((numInstruments * p.mouseY) / p.height);
          let indexClicked = Math.floor((sequenceLength * p.mouseX) / p.width);
          if (rowClicked === 0) {
            console.log("first row " + indexClicked);
            hhPat[indexClicked] = invert(hhPat[indexClicked]);
          } else if (rowClicked === 1) {
            console.log("second row " + indexClicked);
            snarePat[indexClicked] = invert(snarePat[indexClicked]);
          } else if (rowClicked === 2) {
            console.log("third row " + indexClicked);
            pulsePat[indexClicked] = invert(pulsePat[indexClicked]);
          } else if (rowClicked === 3) {
            console.log("fourth row " + indexClicked);
            bdPat[indexClicked] = invert(bdPat[indexClicked]);
          }
          p.redraw();
        }

        // extends the pattern if shorter than the user pattern
        function extendPtn() {
          let originalPtn = snarePat.slice();
          let cycle1 = originalPtn.slice();
          console.log("user sequence length is longer than the pattern");
          let remainder = userSequenceLength - userPatternLength;
          let toFill = remainder;
          // fill out remainder of sequence
          for (let i = 0; i < remainder; i++) {
            if (remainder > originalPtn.length) {
              console.log("need to repeat this until the sequence is filled!");
            }
            cycle1.push(originalPtn[i]);
          }
          console.log(`original pattern: ${originalPtn}`);
          console.log(`pattern extended to fit sequence length: ${cycle1}`);
          return cycle1;
        }
      });
      canvasCreated.current = true;
    }
    // Cleanup function to remove canvas when component unmounts
    return () => {
      const canvas = renderRef.current.querySelector("canvas");
      if (canvas) {
        canvas.remove();
        canvasCreated.current = false;
      }
    };
  }, []);
  return <div ref={renderRef}></div>;
}
