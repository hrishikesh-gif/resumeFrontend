export function apiErrorToMessage(error, fallback = "Something went wrong") {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!status) {
    return "Backend not reachable. Check NEXT_PUBLIC_API_URL.";
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message;
  }

  return fallback;
}
