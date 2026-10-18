const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  
  // For multipart form data uploads, ensure Content-Type is unset so the browser sets the boundary automatically
  if (options.body instanceof FormData) {
    headers.delete('Content-Type');
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fortress_auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // We should include credentials for refresh token (cookies)
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'omit', // We change to 'include' only when needed, e.g., refresh endpoint
  };

  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, config);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }

  if (!response.ok) {
    if (
      typeof window !== 'undefined' &&
      response.status === 401 &&
      !endpoint.includes('/auth/login') &&
      (data?.isDeactivated || data?.error?.toLowerCase().includes('deactivated'))
    ) {
      localStorage.removeItem('fortress_auth_token');
      localStorage.removeItem('fortress_user');
      window.location.href = '/login?deactivated=true';
    }
    throw new ApiError(response.status, data?.error || 'An error occurred', data);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  put: <T>(endpoint: string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  patch: <T>(endpoint: string, body: any, options?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  },
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { ...options, method: 'DELETE' }),
  
  // Specific auth configuration where credentials (cookies) are needed
  postWithCredentials: <T>(endpoint: string, body?: any, options?: RequestInit) => {
    return request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include' 
    });
  }
};

/**
 * Formats backend upload paths into fully qualified URLs accessible by the browser.
 */
export const getFullImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }
  const apiHost = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5001';
  return `${apiHost}${path.startsWith('/') ? '' : '/'}${path}`;
};
