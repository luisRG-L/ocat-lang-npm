class OCC extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div class="oc-container">${super.innerHTML}</div>`;
    }
}

customElements.define("oc-c", OCC);
  