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
      <user-list id="user-list">


      </user-list>
      <div class="column is-10 has-background-light">
        <chat-messages></chat-messages>
        <chat-input id="chat-input">
        </chat-input>
      </div>
    </div>
  </section>
`;

customElements.define(
  "lets-chat",
  class extends HTMLElement {
    #socket;
    #chatinput;
    #userlist;

    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template.content.cloneNode(true)
      );

      this.#addEventListeners();
      this.#createWebsocketClient();
      this.#addEventHandlers();
    }

    #addEventListeners = () => {
      this.#chatinput = this.shadowRoot.querySelector("#chat-input");
      this.#chatinput.addEventListener("lc-input-submitted", (event) => {
        console.log(event.detail);
      });
      this.#userlist = this.shadowRoot.querySelector("#user-list");
    };

    #createWebsocketClient = () => {
      this.#socket = io({ autoConnect: false });
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        this.#socket.auth = { sessionId };
      }
      this.#socket.connect();
    };

    #addEventHandlers = () => {
      this.#event();
      this.#users();
      this.#userConnect();
      this.#userDisconnect();
      this.#getMessages();
      this.#privateMessage();
    };

    #event = () => {
      this.#socket.on("session", ({ sessionId, userId, username }) => {
        console.log("session established", sessionId);
        this.#socket.auth = { sessionId };
        localStorage.setItem("sessionId", sessionId);
        this.#socket.userId = userId;
        this.#socket.username = username;
      });
    };

    #users = () => {
      this.#socket.on("users", (users) => {
        console.log("users", users);
        for (const user of users) {
          this.#addUserToList(user.userId, user.username);
        }
      });
    };

    #userConnect = () => {
      this.#socket.on("user connected", (user) => {
        console.log("user connected", user);
        if (user.userId != this.#socket.userId) {
          // addUserToList(user.userId, user.username);
          console.log(user);
          this.#addUserToList(user.userId, user.username);
        }
      });
    };

    #userDisconnect = () => {
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

    #privateMessage = () => {
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

    #getMessages = () => {
      this.#socket.on("messages", (messages) => {
        console.log(messages);
        messages.forEach((message) => {
          if (message.from == this.#socket.userId) {
            const el = document.createElement("chat-message-sent");
            const chatMessage = createChatMessage(
              el,
              message.content,
              message.timestamp,
              this.#socket.username
            );
            messageContainer.appendChild(chatMessage);
          }
          if (message.from != this.#socket.userId) {
            const el = document.createElement("chat-message-received");
            const chatMessage = createChatMessage(
              el,
              message.content,
              message.timestamp,
              selectedUser.username
            );
            messageContainer.appendChild(chatMessage);
          }
        });
        scrolldown();
      });
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

    #addUserToList = (userId, username) => {
      console.log("add user to list");
      const chatUser = this.#createUser(userId, username);
      this.#userlist.appendChild(chatUser);
    };

    #createUser = (userId, username) => {
      console.log("create", userId, username);
      const newUser = document.createElement("chat-user");
      newUser.setAttribute("userid", userId);
      newUser.setAttribute("username", username);
      newUser.setAttribute("slot", "user");
      newUser.addEventListener("lc-user-selected", (event) => {
        console.log(event.detail);
      });
      return newUser;
    };
  }
);
