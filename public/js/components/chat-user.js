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

      this.#addEventListeners();
    }

    #addEventListeners = () => {
      this.#a = this.shadowRoot.querySelector("a");
      this.#a.addEventListener("click", this.#selectUser);
    };

    static get observedAttributes() {
      return ["userid", "username"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name == "userid") {
        console.log("setting user id");
        this.#userid = newValue;
      }
      if (name == "username") {
        console.log("setting username");
        this.#a.innerText = newValue;
        this.#username = newValue;
      }
    }

    #selectUser = () => {
      console.log("dispatching event");
      this.dispatchEvent(
        new CustomEvent("lc-user-selected", {
          detail: { userId: this.#userid, username: this.#username },
          bubbles: true,
        })
      );
    };
  }
);
