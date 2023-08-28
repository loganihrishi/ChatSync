(() => {
    let username = 'user';
    let extensionOn = true;
    let last_their_messages_length = 0;

    // Receiving the message in content.js
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "username") {
            username = message.value;
            main();
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
        console.log("extracting chats");
        const messageDivs = document.querySelectorAll(".message");
        let messageTexts = [];
        messageDivs.forEach(div => {
            let text = div.textContent.trim(); 
            messageTexts.push(text); 
        });
        return messageTexts;
    }

    function extract_their_chats_length() {
        let messages = document.getElementById("message-list");
        let their_messages = messages.querySelectorAll('.message.left');
        return their_messages.length;
    }


    // ----- METHODS TO EXTRACT THE CHAT END HERE -----


    async function start_application() {
        console.log('app started');
        let chats = extractChats();
        let their_messages_length = extract_their_chats_length();
        if (their_messages_length > last_their_messages_length) {
            last_their_messages_length = their_messages_length;
            // generating the request message 
            let request_message = generatePrompt(chats);
            // make the api request 
            let response = await make_api_calls(request_message);
            setTimeout(() => {
                console.log("waiting to send the message")
            }, 2000); 
            // sending back the message to the chat
            sendMessage(response);
        }
    }
    // ----- METHODS TO GENERATE THE PROMPT BEGIN HERE -----

    function generatePrompt(chats) {;
        return getRules() + chats;
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
                temperature: 0.5
            }),
        };

        try {
            const response = await fetch(apiUrl, requestOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(`API request error: ${data.error.message}`);
            }

            const chatCompletion = data.choices[0].message.content;
            return chatCompletion;
        } catch (error) {
            console.error('API Request Error:', error);
            return "Error processing the request";
        }
    }

    // ----- METHODS TO MAKE THE API CALL END HERE -----


    // ----- METHODS TO SEND THE MESSAGE BEGIN HERE ----- 

    function simulateTyping(message, inputElement, delay = 60) {
        let currentIndex = 0;
    
        function typeNextCharacter() {
            if (currentIndex < message.length) {
                inputElement.value = message.substring(0, currentIndex + 1);
                currentIndex++;
                setTimeout(typeNextCharacter, delay);
            } else {
                const sendButton = document.querySelector(".btn");
                sendButton.click();
            }
        }
        typeNextCharacter();
    }
    
    function sendMessage(message) {
        const messageInput = document.getElementById("messageInp"); 
        simulateTyping(message, messageInput);
    }
    
    // ----- METHODS TO SEND THE MESSAGE END HERE ----- 

    async function main() {
        console.log("main running");
        if (extensionOn) {
            setInterval(start_application, 5000);
        }
    }
})();
