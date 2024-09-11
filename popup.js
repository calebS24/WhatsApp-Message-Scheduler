// Function to initialize the minimum time to current time
function setMinTime() {
    const timeInput = document.getElementById('time');
    const now = new Date();

    // Format hours and minutes as "HH:MM"
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Set the minimum time value for the time input field
    timeInput.min = `${hours}:${minutes}`;
}

// Call setMinTime when the page loads
document.addEventListener('DOMContentLoaded', setMinTime);

// Countdown timer interval
let countdownInterval;

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

    const now = new Date();
    const selectedTime = new Date(now.toDateString() + ' ' + time); // Combine date and time

    // If the selected time is in the past, show an error message
    if (selectedTime <= now) {
        document.getElementById("status").innerText = "Selected time is in the past. Please choose a valid time.";
        return;
    }

    const [hour, minute] = time.split(':').map(Number);

    // Check if the message is already scheduled
    chrome.runtime.sendMessage({
        action: "scheduleMessage",
        phone: phone,
        message: message,
        hour: hour,
        minute: minute
    }, function(response) {
        // Update status message based on the response
        if (response.status === "success") {
            document.getElementById("status").innerText = "Message scheduled successfully!";
        } else if (response.status === "already_scheduled") {
            document.getElementById("status").innerText = "Message already scheduled!";
        } else {
            document.getElementById("status").innerText = response.message || "Failed to send message. Please try again.";
        }
    });

    // Show the countdown timer
    startCountdown(selectedTime);
});

// Functionality for the Reset button
document.getElementById("reset").addEventListener("click", function() {
    document.getElementById("phone").value = "";
    document.getElementById("message").value = "";
    document.getElementById("time").value = "";
    document.getElementById("status").innerText = ""; // Clear the status message

    // Clear the countdown
    clearInterval(countdownInterval);
    document.getElementById("countdown").innerText = ""; // Clear the countdown timer display

    setMinTime(); // Reset the minimum time after clearing the form
});

// Functionality for the Reload button
document.getElementById("reload").addEventListener("click", function() {
    location.reload(); // Reload the page to reset everything
});

// Functionality for the Add button (schedule more messages)
document.getElementById("add").addEventListener("click", function() {
    document.getElementById("phone").value = "";
    document.getElementById("message").value = "";
    document.getElementById("time").value = "";
    document.getElementById("status").innerText = ""; // Clear the status message
    document.getElementById("countdown").innerText = ""; // Clear the countdown timer display

    setMinTime(); // Reset the minimum time for new message scheduling
});

// Function to start the countdown timer
function startCountdown(scheduledTime) {
    const countdownElement = document.getElementById("countdown");

    // Clear any existing interval
    clearInterval(countdownInterval);

    // Start the countdown interval
    countdownInterval = setInterval(function() {
        const now = new Date();
        const timeDifference = scheduledTime - now; // Difference in milliseconds

        // Calculate time parts
        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDifference / 1000) % 60);

        // Display the countdown
        countdownElement.innerText = `Time until message is sent: ${hours}h ${minutes}m ${seconds}s`;

        // Stop countdown when timeDifference reaches 0
        if (timeDifference <= 0) {
            clearInterval(countdownInterval);
            countdownElement.innerText = "The message has been sent!";
        }
    }, 1000); // Update the countdown every second
}
