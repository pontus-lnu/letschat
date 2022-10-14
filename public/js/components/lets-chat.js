import "./user-list.js";
import "./chat-input.js";
import "./chat-messages.js";
import "./chat-message-sent.js";
import "./chat-message-received.js";
import "./chat-user.js";

const template = document.createElement("template");
template.innerHTML = `
<link href="/css/bulma.min.css" rel="stylesheet">
  <section class="hero is-fullheight">
    <div class="columns">
      <user-list id="user-list"></user-list>
      <div class="column is-10 has-background-light">
        <chat-messages id="chat-messages"></chat-messages>
        <chat-input id="chat-input"></chat-input>
      </div>
    </div>
  </section>
`;

customElements.define(
  "lets-chat",
  class extends HTMLElement {
    #socket;
    #chatInput;
    #userList;
    #chatMessages;
    #selectedUser;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addSelectors();
      this.#addEventListeners();
      this.#connectWebsocketClient();
      this.#addEventHandlers();
    }

    #addSelectors = () => {
      this.#chatInput = this.shadowRoot.querySelector("#chat-input");
      this.#chatMessages = this.shadowRoot.querySelector("#chat-messages");
      this.#userList = this.shadowRoot.querySelector("#user-list");
    };

    #addEventListeners = () => {
      this.#chatInput.addEventListener("lc-input-submitted", (event) => {
        console.log(event.detail);
      });
      this.#userList.addEventListener("lc-user-selected", (event) => {
        this.#userSelected(event);
      });
    };

    #connectWebsocketClient = () => {
      this.#socket = io({ autoConnect: false });
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        this.#socket.auth = { sessionId };
      }
      this.#socket.connect();
    };

    #addEventHandlers = () => {
      this.#onSession();
      this.#onUsers();
      this.#onUserConnect();
      this.#onUserDisconnect();
      this.#onMessages();
      this.#onPrivateMessage();
    };

    #onSession = () => {
      this.#socket.on("session", ({ sessionId, userId, username }) => {
        console.log("session established", sessionId);
        this.#socket.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
        this.#socket.userId = userId;
        this.#socket.username = username;
      });
    };

    #onUsers = () => {
      this.#socket.on("users", (users) => {
        console.log("users", users);
        for (const user of users) {
          if (this.#isMyself(user.userId)) {
            continue;
          }
          this.#userList.dispatchEvent(
            new CustomEvent("lc-add-user", { detail: user })
          );
        }
      });
    };

    #onUserConnect = () => {
      this.#socket.on("user connected", (user) => {
        console.log("user connected", user);
        if (this.#isMyself(user.userId)) {
          return;
        }
        this.#userList.dispatchEvent(
          new CustomEvent("lc-add-user", { detail: user })
        );
      });
    };

    #onUserDisconnect = () => {
      this.#socket.on("user disconnected", (userId) => {
        console.log("user disconnected", userId);
        const users = participantsContainer.querySelectorAll("li");
        users.forEach((userInList) => {
          if (userInList.getAttribute("userid") == userId) {
            userInList.remove();
          }
        });
      });
    };

    #onPrivateMessage = () => {
      this.#socket.on("private message", ({ content, from, timestamp }) => {
        console.log("received message", content, "from", from.username);
        if (from.id == this.#socket.userId) {
          const el = document.createElement("chat-message-sent");
          const message = createChatMessage(
            el,
            content,
            timestamp,
            from.username
          );
          messageContainer.append(message);
        } else {
          const el = document.createElement("chat-message-received");
          const message = createChatMessage(
            el,
            content,
            timestamp,
            from.username
          );
          messageContainer.append(message);
        }
        scrolldown();
      });
    };

    #onMessages = () => {
      this.#socket.on("messages", (messages) => {
        messages.forEach((message) => {
          if (this.#isFromMyself(message.from)) {
            message.from = this.#socket.username;
            this.#chatMessages.dispatchEvent(
              new CustomEvent("lc-add-sent-message", {
                detail: message,
              })
            );
          } else {
            message.from = this.#selectedUser.username;
            this.#chatMessages.dispatchEvent(
              new CustomEvent("lc-add-received-message", {
                detail: message,
              })
            );
          }
        });
      });
    };

    #userSelected = (event) => {
      this.#chatMessages.dispatchEvent(
        new CustomEvent("lc-clear-chat-messages")
      );
      const { peerUserId, peerUsername } = event.detail;
      this.#selectedUser = { userId: peerUserId, username: peerUsername };
      this.#getMessages(this.#selectedUser.userId);
    };

    #sendMessage = (event) => {
      event.preventDefault();
      if (selectedUser == "") {
        return;
      }
      console.log("sending message to", selectedUser);
      this.#socket.emit("private message", {
        content: chatInput.value,
        to: selectedUser.userId,
      });
      const element = document.createElement("chat-message-sent");
      const date = new Date().toString();
      const chatMessageSent = createChatMessage(
        element,
        chatInput.value,
        date,
        this.#socket.username
      );
      messageContainer.append(chatMessageSent);
      chatInput.value = "";
      scrolldown();
    };

    #getMessages = (peerUserId) => {
      this.#socket.emit("get messages", {
        user1: this.#socket.userId,
        user2: peerUserId,
      });
    };

    #isMyself = (userId) => {
      return this.#socket.userId == userId;
    };

    #isFromMyself = (userId) => {
      return this.#isMyself(userId);
    };
  }
);
