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

    #scrollDown = () => {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    };

    #createChatMessage = (element, content, time, from) => {
      element.setAttribute("sender", from);
      const elementContent = document.createElement("span");
      elementContent.setAttribute("slot", "content");
      elementContent.innerText = content;
      element.appendChild(elementContent);
      const timestamp = document.createElement("span");
      timestamp.setAttribute("slot", "timestamp");
      timestamp.innerText = time;
      element.appendChild(timestamp);
      return element;
    };
  }
);
