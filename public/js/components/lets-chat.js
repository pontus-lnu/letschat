import "./user-list.js";
import "./chat-input.js";
import "./chat-messages.js";
import "./chat-message-sent.js";
import "./chat-message-received.js";

const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
  <section class="hero is-fullheight">
    <div class="columns">
      <user-list></user-list>
      <div class="column is-10 has-background-light">
        <chat-messages></chat-messages>
        <chat-input id="chat-input"></chat-input>
      </div>
    </div>
  </section>
`;

customElements.define(
  "lets-chat",
  class extends HTMLElement {
    #chatinput;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#chatinput = this.shadowRoot.querySelector("#chat-input");
      this.#chatinput.addEventListener("lc-input-submitted", (event) => {
        console.log(event.detail);
      });
    }
  }
);
