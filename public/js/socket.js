const socket = io();
// const URL = "http://localhost:3000";
// const socket = io({ autoConnect: false });
// socket.auth = { username: "pontus" };
// socket.connect();
// socket.onAny((event, ...args) => {
//   console.log(event, args);
// });

// const chatForm = document.querySelector("#chatform");
// const chatInput = document.querySelector("#chatinput");

// chatForm.addEventListener("submit", function (formWasSubmitted) {
//   formWasSubmitted.preventDefault();
//   if (chatInput.value && this.selectedUser) {
//     socket.emit("private message", {
//       content: chatInput.value,
//       to: this.selectedUser.userId,
//     });
//     this.selectedUser.messages.push({
//       content: chatInput.value,
//       fromSelf: true,
//     });
//   }
//   chatInput.value = "";
// });

// socket.on("connect_error", (err) => {
//   if (err.message === "invalid username") {
//     this.usernameAlreadySelected = false;
//   }
// });
const participantsContainer = document.querySelector("#socketparticipants");
const messageContainer = document.querySelector("#socketmessages");
const chatForm = document.querySelector("#chatform");
const chatInput = document.querySelector("#chatinput");
let selectedUser = {};
let thisUser = {};

const createChatMessage = (element, content, time, from) => {
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

const sendMessage = (event) => {
  event.preventDefault();
  if (selectedUser == {}) {
    return;
  }
  socket.emit("private message", {
    content: chatInput.value,
    userId: selectedUser.userId,
    socketId: selectedUser.socketId,
  });
  const element = document.createElement("chat-message-sent");
  const date = new Date();
  const chatMessageSent = createChatMessage(
    element,
    chatInput.value,
    date.toString(),
    thisUser.username
  );
  messageContainer.append(chatMessageSent);
  chatInput.value = "";
};
chatForm.addEventListener("submit", sendMessage);

socket.on("users", (users) => {
  console.log("users", users);
  for (let user of users) {
    if (socket.id == user.socketId) {
      thisUser.username = user.username;
      thisUser.userId = user.userId;
    }
    const li = document.createElement("li");
    li.setAttribute("socketid", user.socketId);
    li.setAttribute("userid", user.userId);
    li.addEventListener("click", selectUser);
    const a = document.createElement("a");
    a.innerText = user.username;
    li.appendChild(a);
    participantsContainer.appendChild(li);
  }
});

socket.on("user connected", (user) => {
  console.log("user connected", user);
  const li = document.createElement("li");
  li.setAttribute("socketid", user.socketId);
  li.setAttribute("userid", user.userId);
  li.addEventListener("click", selectUser);
  const a = document.createElement("a");
  a.innerText = user.username;
  li.appendChild(a);
  participantsContainer.appendChild(li);
});

socket.on("user disconnected", (user) => {
  console.log("user disconnected", user);
  const users = participantsContainer.querySelectorAll("li");
  users.forEach((userInList) => {
    if (userInList.getAttribute("userId") == user.userId) {
      userInList.remove();
    }
  });
});

const selectUser = (event) => {
  selectedUser.socketId = event.target.parentNode.getAttribute("socketid");
  selectedUser.userId = event.target.parentNode.getAttribute("userid");
  console.log(selectedUser);
};
// socket.on("chat message", function (message) {
//   const chatContainer = document.querySelector("#chatcontainer");
//   const chatElement = document.createElement("chat-message-sent");
//   chatElement.setAttribute("sender", message.sender);
//   const content = document.createElement("span");
//   content.setAttribute("slot", "content");
//   content.innerHTML = message.content;
//   chatElement.appendChild(content);
//   chatContainer.appendChild(chatElement);
//   console.log(chatElement);
//   chatContainer.scrollTop = chatContainer.scrollHeight;
// });
socket.on("private message", ({ content, from, timestamp }) => {
  console.log(content, from.username);
  const message = document.createElement("chat-message-received");
  message.setAttribute("sender", from.username);
  const messageContent = document.createElement("span");
  messageContent.setAttribute("slot", "content");
  messageContent.innerText = content;
  message.appendChild(messageContent);
  const time = document.createElement("span");
  time.setAttribute("slot", "timestamp");
  time.innerText = timestamp;
  message.appendChild(time);
  messageContainer.append(message);
});
