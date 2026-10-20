const status = document.querySelector('circle');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const messages = document.getElementById('chat-messages');
const nameArea = document.getElementById('name-area');
const phoneArea = document.querySelector('.phone-shell');
const nameInput = document.getElementById('name-input');
const nameButton = document.getElementById('name-button');

// Connect to the WebSocket server
let ws = null;
let userId = null;
// Connection opened
nameArea.style.display = 'block';
phoneArea.style.display = 'none';

nameButton.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (!name) return;
  ws = new WebSocket(`ws://localhost:8080?name=${encodeURIComponent(name)}`);
  ws.onopen = () => {
    nameArea.style.display = 'none';
    phoneArea.style.display = 'flex';
    status.style.fill = 'green';
  };

  ws.onclose = () => {
    status.style.fill = 'red';
  };
  let previousId = null
  ws.onmessage = (event) => {
    const eventData = JSON.parse(event.data);
    if (eventData.type === 'init') {
      userId = eventData.data.id;
      return;
    }
    if (eventData.type === 'history') {

      eventData.data.forEach(entry => {
        const isSameUser = previousId === entry.user.id
        showMessages(entry.user.id, entry.user.name, entry.message, isSameUser);
        previousId = entry.user.id;
      });
      return;
    }
    const isSameUser = previousId === eventData.data.userId
    showMessages(eventData.data.userId, eventData.data.senderName, eventData.data.message, isSameUser);
    previousId = eventData.data.userId;
  };
});

function showMessages(senderId, senderName, message, isSameUser) {
  const isOwn = (senderId === userId);
  const messageHolder = document.createElement('div');

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  const actualMsg = document.createElement('div');
  actualMsg.className = 'message-text';
  actualMsg.textContent = message;

  if (isOwn) {
    messageHolder.className = 'message user'
    bubble.appendChild(actualMsg);
    messageHolder.appendChild(bubble);
    if (isSameUser) {
      messageHolder.className = 'message user consecutive'
    }
  }
  else {
    if (!isSameUser) {
      messageHolder.className = 'message bot'
      const senderImg = document.createElement('img');
      senderImg.className = 'sender-avatar';
      senderImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName || 'User')}&background=3b82f6&color=fff&size=128`;

      const senderLabel = document.createElement('div');
      senderLabel.className = 'sender-name';
      senderLabel.textContent = senderName;

      bubble.appendChild(senderLabel);
      bubble.appendChild(actualMsg);

      messageHolder.appendChild(senderImg);
      messageHolder.appendChild(bubble);
    }
    else {
      messageHolder.className = 'message bot consecutive'
      const spacer = document.createElement('div');
      spacer.className = 'avatar-spacer';

      bubble.appendChild(actualMsg);

      messageHolder.appendChild(spacer);
      messageHolder.appendChild(bubble);
    }
  }
  messages.appendChild(messageHolder);

  requestAnimationFrame(() => {
    messages.scrollTop = messages.scrollHeight;
  });
}

function sendMessage() {
  const message = userInput.value.trim();
  if (message) {
    ws.send(message);
    userInput.value = '';
  }
}

// Send message
sendButton.addEventListener('click', (e) => {
  sendMessage();
});
//when user presses enter key send the message
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});
