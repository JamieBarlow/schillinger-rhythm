class InstrumentsColumn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.render();
  }
  render() {
    this.shadowRoot.innerHTML = `
          <style>
              .trackLabels {
                  display: flex;
                  flex-direction: column;
                  gap: ${this.getAttribute("gap")}px;
              }
          </style>
          <div class="trackLabels">
              <slot></slot>
          </div>
          `;
  }
}

customElements.define("instruments-column", InstrumentsColumn);
