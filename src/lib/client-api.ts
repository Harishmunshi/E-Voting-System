type ApiPayload = {
  error?: string;
  [key: string]: unknown;
};

export async function readApiJson(response: Response): Promise<ApiPayload> {
  const text = await response.text();
  if (!text) {
    return {
      error: response.ok
        ? "The server returned an empty response."
        : "The server returned an empty error response. Check the terminal for backend errors.",
    };
  }

  try {
    return JSON.parse(text) as ApiPayload;
  } catch {
    return {
      error: response.ok
        ? "The server returned an invalid response."
        : text.slice(0, 240) || "The server returned an invalid error response.",
    };
  }
}
