class Instrument extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  get instrument() {
    return this.getAttribute("instrument") || "";
  }
  connectedCallback() {
    this.render();
  }
  render() {
    const lineHeight = `${this.getAttribute("height")}px`;
    this.shadowRoot.innerHTML = `
        <style>
            .instrument {
                display: flex;
                align-items: center;
                padding: 0 5px;
                border: 1px solid hsl(204, 41%, 24%);
                height: ${lineHeight};
                box-sizing: border-box;
                color: white;
            }
            h4 {
                padding: 5px;
                margin: 0;
                width: max-content;
                font-family: var(--sl-font-sans);
                font-weight: var(--sl-font-weight-normal);
            }
        </style>
        <div class="instrument">
            <h4>${this.instrument}</h4>
            <slot name="content"></slot>
        </div>
        `;
  }
}

customElements.define("instrument-card", Instrument);
