export interface ParsedError {
  title: string;
  details: string[];
}

export function parseAuthError(err: any, type: "login" | "register" | "general" = "general"): ParsedError {
  if (!err) {
    return { title: "", details: [] };
  }

  // Connection/Network Errors
  if (err?.status === "FETCH_ERROR" || err?.error?.includes("FetchError")) {
    return {
      title: "Backend Connection Failed",
      details: [
        "Could not connect to backend server at http://localhost:3001.",
        "Please ensure the backend API server is running and accessible.",
      ],
    };
  }

  const data = err?.data;
  let title = data?.message || err?.message || (type === "login" ? "Login Failed" : "Registration Failed");
  const details: string[] = [];

  // Parse array of detailed error strings from backend validation
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    data.errors.forEach((e: string) => {
      if (typeof e === "string" && e.trim()) {
        details.push(e.replace(/"/g, ""));
      }
    });
  }

  // Contextual fallback hints based on HTTP status codes
  if (err?.status === 401) {
    if (!details.length) {
      details.push("Invalid credentials. Please double check your email/username and password.");
    }
  } else if (err?.status === 404) {
    if (!details.length) {
      details.push("No account found matching the provided email or username.");
    }
  } else if (err?.status === 409) {
    if (!details.length) {
      details.push("An account with this email or username already exists. Try logging in instead.");
    }
  } else if (err?.status === 400 && !details.length) {
    details.push("Please verify that all fields meet the required format.");
  } else if (err?.status === 500 && !details.length) {
    details.push("Internal server error. Please try again in a few moments.");
  }

  return { title, details };
}
