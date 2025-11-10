export const postRequest = async (url: string, data: unknown) => {
  const response = await fetch(`http://localhost:3333/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to complete the request. Please try again later.");
  }

  return response.json();
};
