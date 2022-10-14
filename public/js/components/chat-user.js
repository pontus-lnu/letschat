const template = document.createElement("template");
template.innerHTML = `
<style>
  a {
    cursor: pointer;
  }
</style>
<li><a></a></li>
`;

customElements.define(
  "chat-user",
  class extends HTMLElement {
    #a;
    #userid;
    #username;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addSelectors();
      this.#addEventListeners();
    }

    #addSelectors = () => {
      this.#a = this.shadowRoot.querySelector("a");
    };

    #addEventListeners = () => {
      this.#a.addEventListener("click", this.#selectUser);
    };

    static get observedAttributes() {
      return ["userid", "username"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name == "userid") {
        this.#userid = newValue;
      }
      if (name == "username") {
        this.#a.innerText = newValue;
        this.#username = newValue;
      }
    }

    #selectUser = () => {
      this.dispatchEvent(
        new CustomEvent("lc-user-selected", {
          detail: { peerUserId: this.#userid, peerUsername: this.#username },
          bubbles: true,
        })
      );
    };
  }
);
