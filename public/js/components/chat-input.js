const template = document.createElement("template");
template.innerHTML = `
<style>
  #submitbutton {
    min-width: 130px;
  }
</style>
<link href="/css/bulma.min.css" rel="stylesheet">
<link rel="stylesheet" href="/vendor/fontawesome/css/all.css">
<div class="column is-full">
  <form id="chat-form">
    <div class="field is-grouped">
      <p class="control is-expanded">
        <input class="input" type="text" id="chat-input" />
      </p>
      <p class="control" id="submitbutton">
        <button class="button is-info" type="submit">
          Send
        </button>
      </p>
    </div>
  </form>
</div>
`;

customElements.define(
  "chat-input",
  class extends HTMLElement {
    #chatForm;
    #chatInput;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addSelectors();
      this.#addEventListeners();
    }

    #addSelectors = () => {
      this.#chatForm = this.shadowRoot.querySelector("#chat-form");
      this.#chatInput = this.shadowRoot.querySelector("#chat-input");
    };

    #addEventListeners = () => {
      this.#chatForm.addEventListener("submit", this.#sendMessage);
    };

    #sendMessage = (event) => {
      event.preventDefault();
      if (!this.#isEmpty()) {
        this.dispatchEvent(
          new CustomEvent("lc-input-submitted", {
            detail: { message: this.#chatInput.value },
          })
        );
        this.#chatInput.value = "";
      }
    };

    #isEmpty() {
      return this.#chatInput.value == "";
    }
  }
);
