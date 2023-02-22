const socket = io();

// HTML elemanlarını seçin
const form = document.getElementById('form');
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('input');
const messages = document.getElementById('messages');

// Formu gönderdiğinde chat mesajını sunucuya gönderin
form.addEventListener('submit', e => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const message = messageInput.value.trim();
  if (username && message) {
    const data = { username, message };
    socket.emit('chat message', data);
    messageInput.value = '';
  }
});

// Chat mesajı aldığında ekranda gösterin
socket.on('chat message', data => {
  const li = document.createElement('li');
  li.innerHTML = `<strong>${data.username}: </strong>${data.message}`;
  messages.appendChild(li);
});



