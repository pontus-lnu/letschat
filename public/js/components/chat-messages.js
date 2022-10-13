const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
<div
  id="socketmessages"
  class="section"
  style="height: calc(100vh - 80px); overflow: scroll"
></div>
`;

customElements.define(
  "chat-messages",
  class extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );
    }
  }
);
