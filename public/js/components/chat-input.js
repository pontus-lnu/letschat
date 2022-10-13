const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
<link rel="stylesheet" href="/vendor/fontawesome/css/all.css">
<div class="column is-full">
  <form id="chatform">
    <div class="field is-grouped">
      <p class="control is-expanded">
        <input class="input" type="text" id="chatinput" />
      </p>
      <p class="control">
        <button class="button is-info" type="submit">
          Send
        </button>
      </p>
    </div>
  </form>
</div>;
`;

customElements.define(
  "chat-input",
  class extends HTMLElement {
    #form;
    #input;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#form = this.shadowRoot.querySelector("#chatform");
      this.#form.addEventListener("submit", this.#sendMessage);
      this.#input = this.shadowRoot.querySelector("#chatinput");
    }

    #sendMessage = (event) => {
      console.log(this.#input.value);
      event.preventDefault();
      if (this.#input.value == "") {
        return;
      } else {
        this.dispatchEvent(
          new CustomEvent("lc-input-submitted", {
            detail: { message: this.#input.value },
          })
        );
        this.#input.value = "";
      }
    };
  }
);
