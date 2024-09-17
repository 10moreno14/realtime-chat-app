const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Inicializar Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Conexión a MongoDB (en Docker)
mongoose.connect('mongodb://localhost:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch((err) => {
  console.error('Error al conectarse a MongoDB', err);
});

// Esquema de mensajes
const MessageSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// Configurar Socket.io
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Escuchar nuevos mensajes
  socket.on('message', (msg) => {
    const message = new Message({ text: msg });
    message.save().then(() => {
      io.emit('message', msg); // Enviar mensaje a todos los usuarios conectados
    });
  });

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

// Servir archivos estáticos para el frontend
app.use(express.static('public'));

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
