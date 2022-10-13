const socket = io({ autoConnect: false });
const sessionId = localStorage.getItem("sessionId");
if (sessionId) {
  socket.auth = { sessionId };
  console.log("Found session", sessionId, "in local storage.");
}
socket.connect();

const participantsContainer = document.querySelector("#socketparticipants");
const messageContainer = document.querySelector("#socketmessages");
const chatForm = document.querySelector("#chatform");
const chatInput = document.querySelector("#chatinput");
let selectedUser = {};

const scrolldown = () => {
  messageContainer.scrollTop = messageContainer.scrollHeight;
};

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
  if (selectedUser == "") {
    return;
  }
  console.log("sending message to", selectedUser);
  socket.emit("private message", {
    content: chatInput.value,
    to: selectedUser.userId,
  });
  const element = document.createElement("chat-message-sent");
  const date = new Date().toString();
  const chatMessageSent = createChatMessage(
    element,
    chatInput.value,
    date,
    socket.username
  );
  messageContainer.append(chatMessageSent);
  chatInput.value = "";
  scrolldown();
};
chatForm.addEventListener("submit", sendMessage);

socket.on("session", ({ sessionId, userId, username }) => {
  console.log("session established", sessionId);
  socket.auth = { sessionId };
  localStorage.setItem("sessionId", sessionId);
  socket.userId = userId;
  socket.username = username;
});

socket.on("users", async (users) => {
  console.log("users", users);
  for (let i = 0; i < users.length; i++) {
    addUserToList(users[i].userId, users[i].username);
  }
});

const addUserToList = (userId, username) => {
  const li = document.createElement("li");
  li.setAttribute("userid", userId);
  li.setAttribute("username", username);
  li.addEventListener("click", selectUser);
  const a = document.createElement("a");
  a.innerText = username;
  li.appendChild(a);
  participantsContainer.appendChild(li);
};

socket.on("user connected", (user) => {
  console.log("user connected", user);
  const li = document.createElement("li");
  li.setAttribute("userid", user.userId);
  li.setAttribute("username", user.username);
  li.addEventListener("click", selectUser);
  const a = document.createElement("a");
  a.innerText = user.username;
  li.appendChild(a);
  participantsContainer.appendChild(li);
});

socket.on("user disconnected", (userId) => {
  console.log("user disconnected", userId);
  const users = participantsContainer.querySelectorAll("li");
  users.forEach((userInList) => {
    if (userInList.getAttribute("userid") == userId) {
      userInList.remove();
    }
  });
});

const selectUser = (event) => {
  selectedUser.userId = event.target.parentNode.getAttribute("userid");
  selectedUser.username = event.target.parentNode.getAttribute("username");
  console.log("selected user", selectedUser.userId);
  socket.emit("get messages", {
    user1: socket.userId,
    user2: selectedUser.userId,
  });
};

socket.on("private message", ({ content, from, timestamp }) => {
  console.log("received message", content, "from", from.username);
  if (from.id == socket.userId) {
    const el = document.createElement("chat-message-sent");
    const message = createChatMessage(el, content, timestamp, from.username);
    messageContainer.append(message);
  } else {
    const el = document.createElement("chat-message-received");
    const message = createChatMessage(el, content, timestamp, from.username);
    messageContainer.append(message);
  }
  scrolldown();
});

socket.on("private message", (message) => {
  console.log(message);
});

socket.on("messages", (messages) => {
  console.log(messages);
  messages.forEach((message) => {
    if (message.from == socket.userId) {
      const el = document.createElement("chat-message-sent");
      const chatMessage = createChatMessage(
        el,
        message.content,
        message.timestamp,
        socket.username
      );
      messageContainer.appendChild(chatMessage);
    }
    if (message.from != socket.userId) {
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
