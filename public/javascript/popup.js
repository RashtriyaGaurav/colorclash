function openSettings(event) {
    event.preventDefault(); // Prevents page jump
    document.getElementById("editProfile").classList.remove("hidden");
}

function closeSettings() {
    document.getElementById("editProfile").classList.add("hidden");
}

