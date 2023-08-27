let extensionOn = false;
let username = '';

// Receiving the message in content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "username") {
      username = message.data;
      console.log("Received username:", username);
      // Do something with the received username data
    } else if (message.type === "extensionValue") {
      extensionOn = message.data;
      console.log("Received extensionOn status:", extensionOn);
      // Do something with the received extensionOn data
    }
  });

function getRules() {
    let rules = ` Follow these rules for success: 1) Base model on ${username}'s pattern. 
    2) One line for ${username}. Wait for user input.
    3) Imagine being human, indulge & focus on topic.
    4) Avoid consecutive questions.
    5) Use typos, emotions for humanness.
    6) Never admit being AI, convince as human.
    7) Be short & precise.
    8) Don't ask until believed real.
    9) Just return the message, don't provide the conversation log in any scenario. 
    Here are the chats:`;
    return rules;
}

// ------ METHODS TO EXTRACT THE CHAT BEGIN HERE ----- 

function extractChats() {
    let my_messages = [];
    let their_messages = [];

    let message_list = document.getElementById('message-list');
    let my_message_array = message_list.querySelectorAll('.message.right');
    let their_message_array  =message_list.querySelectorAll('.message.left');
    my_messages = parse_messages(my_message_array);
    their_messages = parse_messages(their_message_array);
    return {my_messages: my_messages, their_messages: their_messages};
}

function parse_messages(messages_array) {
    result = [];
    messages_array.forEach( function (message) {
        result.push(message.textContent.trim());
    })
    return result;
}

// ----- METHODS TO EXTRACT THE CHAT END HERE -----

let initial_chats = extractChats();

function start_application() {
    let new_chats = extractChats();
    // checking if chats are updated 
    if (isChatsUpdated(initial_chats, new_chats)) {

        // TODO: update this part, if needed
        initial_chats = new_chats;

        // generate the request message 
        let request_message = generatePrompt(new_chats);

        // generating the api response 
        let response = make_api_calls(request_message);

        // sending back the message 
        sendMessage(response);
    }
}

function isChatsUpdated(chats1, chats2) {
    return !arraysAreEqual(chats1.their_messages, chats2.their_messages);
}
  
function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
        return false;
    }
    
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}
  

// ----- METHODS TO GENERATE THE PROMPT BEGIN HERE -----

function generatePrompt(chats) {
    let my_messages = `[${chats.my_messages.toString()}]`;
    let their_messages = `[${chats.their_messages.toString()}]`;

    // just for debugging purposes only 
    console.log(my_messages);
    console.log(their_messages);

    let prompt = getRules() + `my messages: [${my_messages}]` + "\n" + `their messages: [${their_messages}]`;
    return prompt;
}


// ----- METHODS TO GENERATE THE PROMPT END HERE -----


// ----- METHODS TO MAKE THE API CALL START HERE -----

async function make_api_calls(prompt) {
    const OpenAI = require("openai");
    const openai = new OpenAI({
        apiKey: "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"
    });

    let response;

    let chat_completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", 
        messages: [{role:"user", content: prompt}],
        temperature: 0.8, 
        max_tokens: 100,
    });

    response = chat_completion.choices[0].message.content;
    console.log(response); // just for debuggin purposes 
    
    return response;
}

// ----- METHODS TO MAKE THE API CALL END HERE -----


// ----- METHODS TO SEND THE MESSAGE BEGIN HERE ----- 
function sendMessage(message) {
    const messageInput = document.getElementById("messageInp"); 
    const sendButton = document.querySelector(".btn");
    messageInput.value = message;
    sendButton.click();
}

// our looping function, which will run every 10 seconds 

async function main() {
    if (extensionOn) {
        setInterval(start_application, 10000);
    }
}

main();