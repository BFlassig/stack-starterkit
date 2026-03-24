export type ApiRequestOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
};

// External API client for `/api/v1` consumers.
// Internal app pages should continue to use Inertia page props.
export async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const response = await fetch(path, {
        method: options.method ?? 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: options.signal,
    });

    if (!response.ok) {
        throw new Error(`API request failed (${response.status}) for ${path}`);
    }

    return (await response.json()) as T;
}
