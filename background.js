chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const { phone, message, hour, minute } = request;

    // Create a date object for the scheduled time
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // Check if the scheduled time is in the future
    const timeDifference = scheduledTime - now;

    if (timeDifference > 0) {
        setTimeout(() => {
            try {
                const whatsappUrl = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;

                // Log the attempt to create the WhatsApp tab
                console.log(`Opening WhatsApp Web: ${whatsappUrl}`);

                // Create a new tab for WhatsApp Web
                chrome.tabs.create({ url: whatsappUrl }, function(tab) {
                    if (chrome.runtime.lastError) {
                        console.error("Tab Creation Error: ", chrome.runtime.lastError.message);
                        sendResponse({ status: "error", message: "Failed to open WhatsApp Web." });
                    } else {
                        console.log("WhatsApp Web tab created successfully.");

                        // Inject content script to simulate the send button click after loading
                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            function: simulateSendMessage
                        });

                        sendResponse({ status: "success" });
                    }
                });
            } catch (error) {
                console.error("Error while opening WhatsApp Web: ", error);
                sendResponse({ status: "error", message: "An error occurred while trying to open WhatsApp Web." });
            }
        }, timeDifference);
    } else {
        console.warn("Scheduled time is in the past.");
        sendResponse({ status: "error", message: "Scheduled time is in the past." });
    }

    return true; // Indicate that the response is asynchronous
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