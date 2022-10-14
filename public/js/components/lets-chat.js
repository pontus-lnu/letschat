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
    #selectedUser = {};

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
        this.#sendMessage(event.detail.message);
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
      this.#socket.on("private message", (messageToAdd) => {
        if (this.#notFromSelectedUser(messageToAdd.from.userId)) {
          return;
        }
        this.#addReceivedMessage({
          ...messageToAdd,
          from: this.#selectedUser.username,
        });
      });
    };

    #onMessages = () => {
      this.#socket.on("messages", (messages) => {
        messages.forEach((messageToAdd) => {
          if (this.#isFromMyself(messageToAdd.from)) {
            messageToAdd.from = this.#socket.username;
            this.#addSentMessage(messageToAdd);
          } else {
            messageToAdd.from = this.#selectedUser.username;
            this.#addReceivedMessage(messageToAdd);
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

    #sendMessage = (textToSend) => {
      if (this.#selectedUser == {}) {
        return;
      }
      console.log("sending message to", this.#selectedUser);
      this.#socket.emit("private message", {
        content: textToSend,
        to: this.#selectedUser.userId,
      });
      const dateForMessage = new Date().toString();
      const messageToAddLocally = {
        from: this.#socket.username,
        content: textToSend,
        timestamp: dateForMessage,
      };
      this.#addSentMessage(messageToAddLocally);
    };

    #addSentMessage = (message) => {
      this.#chatMessages.dispatchEvent(
        new CustomEvent("lc-add-sent-message", {
          detail: message,
        })
      );
    };

    #addReceivedMessage = (message) => {
      this.#chatMessages.dispatchEvent(
        new CustomEvent("lc-add-received-message", {
          detail: message,
        })
      );
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

    #notFromSelectedUser = (userIdToCompare) => {
      return this.#selectedUser.userId != userIdToCompare;
    };
  }
);
