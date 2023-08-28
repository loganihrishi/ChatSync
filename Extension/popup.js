async function getActiveTabURL() {
  const tabs = await chrome.tabs.query({
      currentWindow: true,
      active: true
  });

  return tabs[0];
}
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
    if (extensionOn) {
      toggleButton.textContent = "Turn Off Extension";
    } else {
      toggleButton.textContent = "Turn On Extension";
    }
    chrome.tabs.sendMessage(activeTab.id, {
      type: "extensionValue",
      value: extensionOn,
    });
  }

  const setUsername = async () => {
    const activeTab = await getActiveTabURL();

    username = usernameField.value.trim();

    chrome.tabs.sendMessage(activeTab.id, {
      type: "username",
      value: username,
    });
  }

  toggleButton.addEventListener('click', toggleExtension);
  submitUsername.addEventListener('click', setUsername);
});


