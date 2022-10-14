const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
<div
  id="chat-messages"
  class="section"
  style="height: calc(100vh - 80px); overflow: scroll"
></div>
`;

customElements.define(
  "chat-messages",
  class extends HTMLElement {
    #chatmessages;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addSelectors();
      this.#addEventListeners();
    }

    #addSelectors = () => {
      this.#chatmessages = this.shadowRoot.querySelector("#chat-messages");
    };

    #addEventListeners = () => {
      this.addEventListener("lc-clear-chat-messages", () => {
        this.#chatmessages.innerHTML = "";
      });
      this.addEventListener("lc-add-sent-message", (event) => {
        this.#addSentMessage(event);
      });
      this.addEventListener("lc-add-received-message", (event) => {
        this.#addReceivedMessage(event);
      });
    };

    #addSentMessage = (event) => {
      const sentMessageElement = document.createElement("chat-message-sent");
      const newMessage = this.#createChatMessage(sentMessageElement, event);
      this.#chatmessages.appendChild(newMessage);
      this.#scrollDown();
    };

    #addReceivedMessage = (event) => {
      const receivedMessageElement = document.createElement(
        "chat-message-received"
      );
      const newMessage = this.#createChatMessage(receivedMessageElement, event);
      this.#chatmessages.appendChild(newMessage);
      this.#scrollDown();
    };

    #createChatMessage = (messageElement, event) => {
      const { from, content, timestamp } = event.detail;
      messageElement.setAttribute("sender", from);
      const contentSlot = document.createElement("span");
      contentSlot.setAttribute("slot", "content");
      contentSlot.innerText = content;
      messageElement.appendChild(contentSlot);
      const timestampSlot = document.createElement("span");
      timestampSlot.setAttribute("slot", "timestamp");
      timestampSlot.innerText = timestamp;
      messageElement.appendChild(timestampSlot);
      return messageElement;
    };

    #scrollDown = () => {
      this.#chatmessages.scrollTop = this.#chatmessages.scrollHeight;
    };
  }
);
