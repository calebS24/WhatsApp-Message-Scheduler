// Function to handle the message scheduling
document.getElementById("msgForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();
    const time = document.getElementById("time").value;

    // Validate inputs
    if (!phone || !message || !time) {
        document.getElementById("status").innerText = "Please fill in all fields.";
        return;
    }

    const [hour, minute] = time.split(':').map(Number);

    // Send message data to the background script
    chrome.runtime.sendMessage({
        phone: phone,
        message: message,
        hour: hour,
        minute: minute
    }, function(response) {
        // Update status message based on the response
        if (response.status === "success") {
            document.getElementById("status").innerText = "Message scheduled successfully!";
        } else {
            document.getElementById("status").innerText = response.message || "Failed to send message. Please try again.";
        }
    });
});

// Functionality for the Reset button
document.getElementById("reset").addEventListener("click", function() {
    document.getElementById("msgForm").reset(); // Reset form fields
    document.getElementById("status").innerText = ""; // Clear the status message
});

// Functionality for the Reload button
document.getElementById("reload").addEventListener("click", function() {
    location.reload(); // Reload the page to reset everything
});