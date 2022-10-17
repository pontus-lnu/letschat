const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
  <link rel="stylesheet" href="/vendor/fontawesome/css/all.css">
    <div class="columns my-2">
      <div class="column is-narrow">
        <i class="fas fa-user p-2"></i><span id="sender"></slot>
      </div>
      <div class="column is-half">
        <p><slot name="timestamp"></slot></p>
        <div class="box content">
          <p><slot name="content"></slot></p>
        </div>
      </div>
      <div class="column"></div>
    </div>
`;

customElements.define(
  "chat-message-sent",
  class extends HTMLElement {
    #sender;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#sender = this.shadowRoot.querySelector("#sender");
    }

    static get observedAttributes() {
      return ["sender"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "sender") {
        this.#sender.innerHTML = newValue;
      }
    }
  }
);
