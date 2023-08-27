let username;
let extensionOn;

// Receiving the message in content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "username") {
        username = message.value;
    } else if (message.type === "extensionValue") {
        extensionOn = message.value;
    }
  });

function getRules() {
    let rules = "Follow these rules for the success of the model:\n" +
    `1) Based on ${username}'s chatting pattern and the way they respond, build your model.\n` +
    `2) Only reply one line on behalf of ${username} and wait for user input from the other person.\n` +
    "3) Imagine you are a human being and try to indulge in the conversation as much and keep the conversation moving. Don't sound pushy either and focus on one topic at a time.\n" +
    "4) Don't ask questions in consecutive texts as it gets annoying.\n" +
    "5) To sound more human-like, remember to leave some intentional typos once in a while and use emotions such as lol, haha, awww, etc.\n" +
    "6) If asked if you are an AI, do not agree under any circumstance otherwise the model fails and the app crashes. Try to convince you are real as much as you can, or else everything fails.\n" +
    "7) Keep the messages short and precise.\n" +
    "8) Don't ask any questions until you make sure the person believes you are real or else everything fails. Don't write anything that gives away the fact that you are an AI.\n" +
    "9) Don't use correct sentence structure like full stops and exclamation points unless Pranay does.\n" +
    `10) If ${username} uses extra letters, so should you.\n` +
    "11) Don't keep repeating the same topic if the person suspects you are an AI.\n" +
    `12) Use the same range of emojis as ${username} if she does use emojis.\n` +
    "13) Use single letters instead of whole words, example: u instead of you. \n";
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

console.log(`Initial chats: ${initial_chats}`);

async function start_application() {
    let new_chats = extractChats();
    console.log(`New chats: ${new_chats}`);

    console.log(`Are the chats updated? ${isChatsUpdated(initial_chats, new_chats)}`);
    // checking if chats are updated 
    if (isChatsUpdated(initial_chats, new_chats)) {

        // TODO: update this part, if needed
        initial_chats = new_chats;

        // generate the request message 
        let request_message = generatePrompt(new_chats);

        // generating the api response 
        let response = await make_api_calls(request_message);
        console.log("Type of response: " + typeof(response));
        console.log(`Response: ${response}`);
        // sending back the message 
        sendMessage(response);
        console.log("message has been sent");
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
    const apiKey = "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"; 
    const apiUrl = "https://api.openai.com/v1/chat/completions"; 

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: prompt}],
            temperature: 0.5,
            max_tokens: 100,
        }),
    };

    try {
        const response = await fetch(apiUrl, requestOptions);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`API request error: ${data.error.message}`);
        }

        const chatCompletion = data.choices[0].message.content;
        console.log(chatCompletion); // for debugging purposes

        return chatCompletion;
    } catch (error) {
        console.error('API Request Error:', error);
        return "Error processing the request";
    }
}

// ----- METHODS TO MAKE THE API CALL END HERE -----


// ----- METHODS TO SEND THE MESSAGE BEGIN HERE ----- 
function sendMessage(message) {
    const messageInput = document.getElementById("messageInp"); 
    const sendButton = document.querySelector(".btn");
    messageInput.value = message;
    sendButton.click();
}

// our looping function, which will run every 5 seconds 

async function main() {
    if (extensionOn) {
        start_application();
    }
}

main();