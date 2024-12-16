class OCC extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<div class="oc-container">${super.innerHTML}</div>`;
    }
}

class Template extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.setAttribute("ocm", "template");
        this.innerHTML = `<div class="oc-template">${super.innerHTML}</div>`;
    }
}

customElements.define("oc-c", OCC);
customElements.define("oc-template", Template);