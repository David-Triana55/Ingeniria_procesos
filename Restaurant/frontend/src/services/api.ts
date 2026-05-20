const API_URL = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de conexión');
  return data;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () => request('/auth/me'),

  // Dashboard
  getDashboard: () => request('/dashboard'),
  getWeeklyData: () => request('/dashboard/weekly'),
  getRecentOrders: () => request('/dashboard/recent-orders'),
  getHourlyData: () => request('/dashboard/hourly'),

  // Orders
  getOrders: (params?: { status?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set('status', params.status);
    if (params?.search) qs.set('search', params.search);
    return request(`/orders?${qs.toString()}`);
  },
  updateOrderStatus: (displayId: string, status: string) =>
    request(`/orders/${encodeURIComponent(displayId)}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  createOrder: (order: { table: string; items: { name: string; quantity: number; price: number }[]; waiter?: string; guests?: number }) =>
    request('/orders', { method: 'POST', body: JSON.stringify(order) }),
  updateOrder: (displayId: string, order: { table: string; items: { name: string; quantity: number; price: number }[]; waiter?: string; guests?: number }) =>
    request(`/orders/${encodeURIComponent(displayId)}`, { method: 'PUT', body: JSON.stringify(order) }),

  // Kitchen
  getKitchen: () => request('/kitchen'),
  moveOrder: (displayId: string, toStatus: string) =>
    request(`/kitchen/${displayId}/move`, { method: 'PUT', body: JSON.stringify({ toStatus }) }),

  // Menu
  getMenu: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    return request(`/menu?${qs.toString()}`);
  },
  toggleProduct: (id: number) => request(`/menu/${id}/toggle`, { method: 'PUT' }),
  createProduct: (product: any) =>
    request('/menu', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (id: number, product: any) =>
    request(`/menu/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (id: number) => request(`/menu/${id}`, { method: 'DELETE' }),
  getCategories: () => request('/menu/categories'),

  // Reports
  getReports: (range: string) => request(`/reports?range=${encodeURIComponent(range)}`),
  getCategoryData: () => request('/reports/categories'),
  getTopProducts: () => request('/reports/top-products'),

  // Profile
  getProfile: () => request('/profile'),
  updatePersonal: (data: any) => request('/profile/personal', { method: 'PUT', body: JSON.stringify(data) }),
  updateRestaurant: (data: any) => request('/profile/restaurant', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: any) => request('/profile/password', { method: 'PUT', body: JSON.stringify(data) }),
  updateNotifications: (data: any) => request('/profile/notifications', { method: 'PUT', body: JSON.stringify(data) }),
};
