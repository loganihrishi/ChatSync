// Node Server which will handle socket io connection

// const io = require('socket.io')(8000);
const io = require('socket.io')(8000, {
    cors: {
        origin: "http://127.0.0.1:5501", // or the origin of your client application
        methods: ["GET", "POST"]
    }
});
const users = {};

io.on('connection', socket =>{
    socket.on('new-user-joined', name =>{
        console.log("New user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    socket.on('send', message =>{
        socket.broadcast.emit('receive', {message: message, name: users[socket.id]})
    });
    
    socket.on('disconnect', message =>{
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });
})
