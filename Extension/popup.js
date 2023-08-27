import { getActiveTabURL } from "./utils.js";

let extensionOn = false;
let username = '';

document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const status = document.getElementById('status');
  const usernameInput = document.getElementById('usernameInput');
  const submitUsername = document.getElementById('submitUsername');
  const usernameField = document.getElementById('username');

  const toggleExtension = async () => {
    const activeTab = await getActiveTabURL();

    extensionOn = !extensionOn;
    status.textContent = extensionOn ? 'ON' : 'OFF';
    usernameInput.style.display = extensionOn ? 'block' : 'none';

    chrome.tabs.sendMessage(activeTab.id, {
      type: "extensionValue",
      value: extensionOn,
    });
    // chrome.tabs.sendMessage({ type: "extensionOn", data: extensionOn }, (response) => {
    //   console.log(extensionOn);
    //     console.log("ExtensionOn status sent to content script:", response);
    //   });
  }

  const setUsername = async () => {
    const activeTab = await getActiveTabURL();

    username = usernameField.value.trim();

    chrome.tabs.sendMessage(activeTab.id, {
      type: "username",
      value: username,
    });
    // chrome.tabs.sendMessage({ type: "username", data: username }, (response) => {
    //     console.log("Username sent to content script:", response);
    //   });
  }

  toggleButton.addEventListener('click', toggleExtension);
  submitUsername.addEventListener('click', setUsername);
});


