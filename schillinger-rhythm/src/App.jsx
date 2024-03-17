import { useState } from "react";
import "./App.css";
import Sequencer from "./Sequencer";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <label for="numInput">
          Add a number here - this is your rhythm pattern (e.g. 1240652)
        </label>
        <input type="number" id="numInput" />
        <label for="metre">
          Choose a regular or irregular metre ('Regular' forces the sequence to
          an even length even if the generated pattern is an odd/irregular
          length, so the pulse will continue to follow an even pattern.
          'Irregular' (default) preserves an odd pattern length if the generated
          pattern is odd/irregular, so the pulse will go in and out of phase
          with your pattern as it cycles through). There is no change if the
          pattern is an even length.
        </label>
        <select name="metre" id="metre">
          <option value="irregular">Irregular</option>
          <option value="regular">Regular</option>
        </select>
        <label for="userSequenceLength">
          Sequence length (Optional - leave blank to let this follow number of
          beats in user pattern)
        </label>
        <input type="number" id="userSequenceLength" />
        <button id="numBtn" onclick="applyRhythm()">
          Apply Rhythm
        </button>
      </div>
      <div id="startBtn">
        <button>
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="sequencer">
        <div class="trackLabels">
          <p>Click</p>
          <p>Snare</p>
          <p>Hi-hat pulse</p>
          <p>Bass Drum</p>
        </div>
        <div id="sequencerLanes"></div>
      </div>
      <div id="bpmSlider">
        <h3 id="bpmValue">BPM 120</h3>
      </div>
      <Sequencer />
    </>
  );
}

export default App;
