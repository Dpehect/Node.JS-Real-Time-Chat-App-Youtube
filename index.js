const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

// MongoDB bağlantısı
mongoose.connect('mongodb+srv://Dpehect:deneme123@cluster0.olfqcop.mongodb.net/testchat-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB bağlantı hatası:'));
db.once('open', function() {
  console.log('MongoDB bağlantısı başarılı');
});

// MongoDB Chat modeli
const chatSchema = new mongoose.Schema({
  username: String,
  message: String,
  created_at: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// Express ve Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Sunucu portu
const PORT = process.env.PORT || 3000;

// Express middleware
app.use(express.static('public'));

// Socket.IO event dinleyicileri
io.on('connection', socket => {
  console.log(`Yeni bir kullanıcı bağlandı: ${socket.id}`);

  // Son 10 mesajı gönder
  Chat.find({})
    .sort({ created_at: -1 })
    .limit(10)
    .exec((err, chats) => {
      if (err) return console.error(err);
      chats.reverse().forEach(chat => {
        socket.emit('chat message', chat);
      });
    });

  socket.on('disconnect', () => {
    console.log(`Kullanıcı ayrıldı: ${socket.id}`);
  });

  socket.on('chat message', data => {
    console.log(`Mesaj alındı: ${data.username}: ${data.message}`);
    const chat = new Chat(data);
    chat.save(err => {
      if (err) return console.error(err);
      io.emit('chat message', chat);
    });
  });
});

// Sunucuyu başlat
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
