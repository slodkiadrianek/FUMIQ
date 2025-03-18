async function verifyUser() {
    const token = sessionStorage.getItem("authToken");
    const response = await fetch(
      "http://localhost:3000/api/v1/auth/check",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const responseData = await response.json();
    if (!responseData.success) {
      location.href = "login.html";
    }
  }
  verifyUser();