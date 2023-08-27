
// Your client.js code here
const socket = io('http://localhost:8000');

const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
var audio = new Audio("js/notification.mp3"); 
const append = (message, position)=>{
    const messageElement = document.createElement('div');
    messageElement.innerHTML = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageContainer.append(messageElement);
    if (position == 'left') {
        audio.play();
    }
}

form.addEventListener('submit', (e) =>{
    e.preventDefault();

    const message = messageInput.value;
    let time = new Date().toLocaleTimeString();
    append(`${time}, You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = "";
})

const name = prompt("Enter your name to join:");
socket.emit('new-user-joined', name);

socket.on('user-joined', name =>{
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', data =>{
    let time = new Date().toLocaleTimeString();
    append(`${time}, ${data.name}: ${data.message}`, 'left');
});

socket.on('left', name =>{
    append(`${name} left the chat`, 'left');
});
