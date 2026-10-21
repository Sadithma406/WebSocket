const { createApp, ref } = Vue;

createApp({
  setup() {
    const phoneShell = ref(null);
    const status = ref(null);
    const messages = ref(null);
    const userInput = ref('');
    const name = ref('');
    const joined = ref(false);

    let ws = null;
    let userId = null;
    let previousId = null;

    const joinChat = () => {
      if (!name.value.trim()) return;
      ws = new WebSocket(`ws://localhost:8080?name=${encodeURIComponent(name.value.trim())}`);

      ws.onopen = () => {
        joined.value = true;
        status.value.setAttribute('fill', 'green');
      };

      ws.onclose = () => {
        status.value.setAttribute('fill', 'red');
      };

      ws.onmessage = (event) => {
        const eventData = JSON.parse(event.data);

        if (eventData.type === 'init') {
          userId = eventData.data.id;
          return;
        }

        if (eventData.type === 'history') {
          eventData.data.forEach(entry => {
            const isSameUser = previousId === entry.user.id;
            showMessages(entry.user.id, entry.user.name, entry.message, isSameUser);
            previousId = entry.user.id;
          });
          return;
        }

        const isSameUser = previousId === eventData.data.userId;
        showMessages(eventData.data.userId, eventData.data.senderName, eventData.data.message, isSameUser);
        previousId = eventData.data.userId;
      };
    };

    const sendMessage = () => {
      if (userInput.value.trim() && ws) {
        ws.send(userInput.value.trim());
        userInput.value = '';
      }
    };

    const showMessages = (senderId, senderName, message, isSameUser) => {
      const isOwn = (userId === senderId);
      const messageHolder = document.createElement('div');
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      const actualMsg = document.createElement('div');
      actualMsg.classList.add('message-text');
      actualMsg.textContent = message;

      if (isOwn) {
        messageHolder.className = isSameUser ? 'message user consecutive' : 'message user';
        bubble.appendChild(actualMsg);
        messageHolder.appendChild(bubble);
      } else {
        if (!isSameUser) {
          messageHolder.className = 'message bot';
          const senderImg = document.createElement('img');
          senderImg.className = 'sender-avatar';
          senderImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName || 'User')}&background=3b82f6&color=fff&size=128`;

          const senderLabel = document.createElement('div');
          senderLabel.classList.add('sender-name');
          senderLabel.textContent = senderName;

          bubble.appendChild(senderLabel);
          bubble.appendChild(actualMsg);
          messageHolder.appendChild(senderImg);
          messageHolder.appendChild(bubble);
        } else {
          messageHolder.className = 'message bot consecutive';
          const spacer = document.createElement('div');
          spacer.className = 'avatar-spacer';

          bubble.appendChild(actualMsg);
          messageHolder.appendChild(spacer);
          messageHolder.appendChild(bubble);
        }
      }

      messages.value.appendChild(messageHolder);
      requestAnimationFrame(() => {
        messages.value.scrollTop = messages.value.scrollHeight;
      });
    };

    return {
      phoneShell,
      status,
      messages,
      userInput,
      name,
      joined,
      sendMessage,
      joinChat
    };
  }
}).mount('#app');
