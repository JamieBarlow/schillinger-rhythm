class Instrument extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const lineHeight = `${this.getAttribute("height")}px`;
    this.shadowRoot.innerHTML = `
        <style>
            .instrument {
                padding: 0 5px;
                border: 1px solid white;
                font-family: Poppins, sans-serif;
                height: ${lineHeight};
                box-sizing: border-box;
            }
            h4 {
                padding: 5px;
                margin: 0;
                width: max-content;
            }
        </style>
        <div class="instrument">
            <h4>${this.getAttribute("instrument")}</h4>
        </div>
        `;
  }
}

customElements.define("instrument-card", Instrument);
