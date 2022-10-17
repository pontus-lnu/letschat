import "./chat-user.js";

const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
<link rel="stylesheet" href="/vendor/fontawesome/css/all.css">
    <aside class="column is-narrow is-fullheight" id="aside">
      <i class="fas fa-bars m-5" style="cursor: pointer" id="togglebutton"></i>
      <div class="menu px-5" style="width: 200px">
        <h1 class="title is-4">Let's chat</h1>
        <p class="menu-label">Online</p>
        <ul class="menu-list" id="user-list">
        </ul>
        <form action="/auth/logout" method="post" class="form m-5">
          <button class="button is-small is-link" type="submit">Logout</button>
        </form>
      </div>
    </aside>
`;

customElements.define(
  "user-list",
  class extends HTMLElement {
    toggleButton;
    #userList;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addSelectors();
      this.#addEventListeners();
    }

    #addSelectors = () => {
      this.toggleButton = this.shadowRoot.querySelector("#togglebutton");
      this.#userList = this.shadowRoot.querySelector("#user-list");
    };

    #addEventListeners = () => {
      this.toggleButton.addEventListener("click", this.#toggleUserlist);
      this.addEventListener("lc-add-user", (event) => this.#addUser(event));
      this.addEventListener("lc-remove-user", (event) => {
        this.#removeUser(event);
      });
    };

    #toggleUserlist = () => {
      this.shadowRoot.querySelector(".menu").toggleAttribute("hidden");
    };

    #addUser = (event) => {
      const { userId, username } = event.detail;
      console.log("create", userId, username);
      const newUser = document.createElement("chat-user");
      newUser.setAttribute("userid", userId);
      newUser.setAttribute("username", username);
      newUser.addEventListener("lc-user-selected", (event) =>
        this.dispatchEvent(new CustomEvent("lc-user-selected", event))
      );
      this.#userList.appendChild(newUser);
    };

    #removeUser = (event) => {
      console.log(event);
      const { userId } = event.detail;
      const currentUsers = this.#userList.querySelectorAll("chat-user");
      currentUsers.forEach((user) => {
        if (user.getAttribute("userid") == userId) {
          user.remove();
        }
      });
    };
  }
);
