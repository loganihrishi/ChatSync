document.addEventListener("DOMContentLoaded", () => {
    const socket = io(); // Initialize Socket.IO connection

    const chatMessages = document.getElementById("chat-messages");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");

    sendButton.addEventListener("click", () => {
        const message = messageInput.value;
        if (message.trim() !== "") {
            socket.emit("chat-message", message); // Emit message to the server
            messageInput.value = "";
        }
    });

    socket.on("chat-message", (message) => {
        const messageElement = document.createElement("div");
        messageElement.innerText = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the bottom of the chat
    });
});
