// Store scheduled messages to prevent duplicate scheduling
let scheduledMessages = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const { phone, message, hour, minute, action } = request;

    // Check if the action is to schedule a message
    if (action === "scheduleMessage") {
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(hour, minute, 0, 0);

        // Create a unique key for each phone + message combo
        const scheduleKey = `${phone}_${hour}:${minute}`;

        // Check if this message is already scheduled
        if (scheduledMessages[scheduleKey]) {
            sendResponse({ status: "already_scheduled" });
            return true;
        }

        // Set the message as scheduled
        scheduledMessages[scheduleKey] = { phone, message, time: scheduledTime };

        // Show an orange badge indicating the extension is active
        chrome.action.setBadgeBackgroundColor({ color: "#FFA500" }); // Orange color
        chrome.action.setBadgeText({ text: "●" }); // Display a small dot

        setTimeout(() => {
            try {
                const whatsappUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

                // Create a new tab for WhatsApp Web
                chrome.tabs.create({ url: whatsappUrl }, function(tab) {
                    if (chrome.runtime.lastError) {
                        console.error("Tab Creation Error: ", chrome.runtime.lastError.message);
                        sendResponse({ status: "error", message: "Failed to open WhatsApp Web." });
                        chrome.action.setBadgeText({ text: "" }); // Clear the badge
                    } else {
                        // Simulate sending the message
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: simulateSendMessage, // Use the function directly
                        });

                        sendResponse({ status: "success" });
                        chrome.action.setBadgeText({ text: "" }); // Clear the badge after message is sent
                    }
                });
            } catch (error) {
                console.error("Error while opening WhatsApp Web: ", error);
                sendResponse({ status: "error", message: "An error occurred while trying to open WhatsApp Web." });
                chrome.action.setBadgeText({ text: "" }); // Clear the badge
            }
        }, scheduledTime - now);
    }

    return true;
});

// Function to be injected that simulates the send button click
function simulateSendMessage() {
    const interval = setInterval(() => {
        const sendButton = document.querySelector("button span[data-icon='send']");
        if (sendButton) {
            sendButton.click(); // Simulate the click
            clearInterval(interval); // Stop the interval after sending
        }
    }, 1000); // Keep checking every second until the button is found
}
