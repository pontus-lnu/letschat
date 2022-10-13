const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
<link rel="stylesheet" href="/vendor/fontawesome/css/all.css">
    <aside class="column is-narrow is-fullheight" id="aside">
      <i class="fas fa-bars m-5" style="cursor: pointer" id="togglesidebar"></i>
      <div class="menu px-5" style="width: 200px">
        <h1 class="title is-4">Let's chat</h1>
        <p class="menu-label">Online</p>
        <ul class="menu-list" id="userscontainer"></ul>
        <form action="/auth/logout" method="post" class="form m-5">
          <button class="button is-small is-link" type="submit">Logout</button>
        </form>
      </div>
    </aside>
`;

customElements.define(
  "user-list",
  class extends HTMLElement {
    #users = [];
    #usersContainer;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      // Selectors.
      this.#usersContainer = this.shadowRoot.querySelector("#userscontainer");
    }
  }
);
