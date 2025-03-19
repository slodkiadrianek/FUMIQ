// Simulate a logout process with a delay
function simulateLogout() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000); // Simulate a 3-second logout process
  });
}

// Handle the logout process
async function handleLogout() {
  const cancelButton = document.getElementById("cancelButton");
  cancelButton.disabled = true; // Disable the cancel button during logout

  try {
    // Simulate the logout process
    await logout();

    // Redirect to the login page after successful logout
    window.location.href = "login.html"; // Replace with your login page URL
  } catch (error) {
    console.error("Logout failed:", error);
    alert("Logout failed. Please try again.");
    cancelButton.disabled = false; // Re-enable the cancel button
  }
}

// Cancel button functionality
document.getElementById("cancelButton").addEventListener("click", () => {
  window.location.href = "dashboard.html"; // Redirect back to the dashboard
});

// Start the logout process when the page loads
handleLogout();

async function logout() {
  const token = sessionStorage.getItem("authToken");
  const response = await fetch(
    `http://${base_url}/api/v1/auth/logout
`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
