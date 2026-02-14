import { objectToFormData } from "./object-to-form-data";
import { getAccessToken, setAccessToken } from "./token-manager";

export const fetchClient = async <T, U>(
  url: string,
  options: Omit<RequestInit, "body"> & { body?: T } = {},
): Promise<U> => {
  const headers = new Headers(options.headers);
  const { body, ...rest } = options;

  const requestOptions: RequestInit = rest;
  const locale = window.location.pathname.split("/")[1];

  headers.set("Accept", "application/json");
  headers.set("X-Client-Type", "web");
  headers.set("X-Locale", locale);
  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  headers.set("X-Client-Version", import.meta.env.VITE_APP_VERSION || "1.0.0");
  headers.set("bypass-tunnel-reminder", "true");

  if (options?.method?.toUpperCase() === undefined) {
    requestOptions.method = "GET";
  }

  if (headers.get("Content-Type") === "multipart/form-data") {
    headers.delete("Content-Type");
    requestOptions.body = objectToFormData({ ...body });
  } else if (!headers.get("Content-Type")) {
    headers.set("Content-Type", "application/json");
    if (body) {
      if (requestOptions.method?.toUpperCase() === "GET") {
        const [baseUrl, queryString] = url.split("?");
        const existingParams = new URLSearchParams(queryString);
        const newParams = new URLSearchParams();

        Object.entries(body as Record<string, unknown>).forEach(
          ([key, value]) => {
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                newParams.set(key, value.join(","));
              } else {
                newParams.set(key, String(value));
              }
            }
          },
        );

        existingParams.forEach((value, key) => {
          newParams.set(key, value);
        });

        url = `${baseUrl}?${newParams.toString()}`;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }
  }

  requestOptions.headers = headers;

  const requestUrl = `/api/v1${url}`;

  const response = await fetch(requestUrl, requestOptions);

  if (response.status < 200 || response.status >= 400) {
    if (response.status === 401) {
      const isRefreshed = await refreshTokens();
      if (!isRefreshed) {
        throw new Error("Failed to fetch data");
      }
      return fetchClient(url, options);
    }

    let message = "Failed to fetch data";
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const body = await response.json();
        const msg = body?.message ?? body?.error ?? body?.msg;
        if (typeof msg === "string") message = msg;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<U>;
  }

  return response as unknown as Promise<U>;
};

export const refreshTokens = async (): Promise<boolean> => {
  const tokensResponse = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "bypass-tunnel-reminder": "true",
    },
    credentials: "include",
  });

  if (tokensResponse.status === 200) {
    const tokens = await tokensResponse.json();
    setAccessToken(tokens.accessToken);
    return true;
  }

  setAccessToken(null);

  return false;
};
