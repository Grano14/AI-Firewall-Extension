// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "UPDATE_BADGE") {
        const { color, text } = request.payload;
        
        // Imposta il colore
        chrome.action.setBadgeBackgroundColor({ color: color });
        // Imposta un testo (opzionale, es: "OK" o "...")
        chrome.action.setBadgeText({ text: text });
    }
});