// lib/api.ts
import { getDeviceId } from './device-id';

// Debug: Environment variables yoxlayırıq
console.log('API Client - Environment Variables:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

console.log('API Client - Final API_BASE_URL:', API_BASE_URL);

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    console.log('ApiClient constructor - baseURL:', this.baseURL);
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  private saveToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  private clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getCsrfToken(): string | null {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
      return match ? match[2] : null;
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('API Request:', url);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Device-ID': getDeviceId(),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // CSRF tokenu əlavə et
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method?.toUpperCase() || '')) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
      } else {
        console.warn('API: CSRF token not found');
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Sessiya və CSRF üçün
    };

    try {
      console.log('API: Sending request to:', url, config);
      const response = await fetch(url, config);
      console.log('API: Response status:', response.status);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('API: Failed to parse error response');
        }
        
        // Stok hatası durumunda daha anlamlı mesaj
        if (response.status === 400 && errorData.error && errorData.error.includes('Stokda yalnız')) {
          throw new Error(errorData.error);
        }
        
        // Şifrə xətalarını daha səliqəli göstər
        if (response.status === 400 && errorData.password) {
          const passwordErrors = errorData.password;
          let errorMessage = "Şifrə tələbləri qarşılanmır:\n";
          
          if (Array.isArray(passwordErrors)) {
            passwordErrors.forEach((error: string, index: number) => {
              errorMessage += `• ${error}\n`;
            });
          } else {
            errorMessage += `• ${passwordErrors}`;
          }
          
          throw new Error(errorMessage.trim());
        }
        
        // 429 xətası üçün xüsusi mesaj (Rate Limiting)
        if (response.status === 429) {
          let errorMessage = "Çox tez-tez istək göndərirsiniz. ";
          if (errorData.detail) {
            errorMessage += errorData.detail;
          } else {
            errorMessage += "Zəhmət olmasa bir az gözləyin və yenidən cəhd edin.";
          }
          throw new Error(errorMessage);
        }
        
        // Digər xətalar üçün console.error
        console.error('API: Response not ok:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log('API: JSON response:', data);
        return data;
      }
      console.log('API: Non-JSON response');
      return {} as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Books API
  async getBooks(params: Record<string, string> = {}): Promise<BookListResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<BookListResponse>(`/books/?${queryString}`);
  }
  

  async getFeaturedBooks() {
    return this.request<BookListResponse>('/books/featured/');
  }

  async getBestsellerBooks() {
    return this.request<BookListResponse>('/books/bestsellers/');
  }

  async getNewBooks() {
    return this.request<BookListResponse>('/books/new/');
  }

  async getBook(slug: string) {
    return this.request<Book>(`/books/${slug}/`);
  }

  async getCategories(): Promise<CategoriesResponse | Category[]> {
    return this.request<CategoriesResponse | Category[]>('/books/categories/');
  }

  async getBookReviews(bookId: number) {
    return this.request<any>(`/books/${bookId}/reviews/`);
  }

  async createBookReview(bookId: number, data: any) {
    return this.request<any>(`/books/${bookId}/reviews/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBanners() {
    return this.request<any[]>('/books/banners/');
  }

  async getSiteSettings() {
    return this.request<any>('/settings/site-settings/');
  }

  async getWhatsAppNumber() {
    return this.request<{ whatsapp_number: string }>('/settings/whatsapp-number/');
  }

  // Auth API
  async login(credentials: { username: string; password: string }) {
    const response = await this.request<any>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (response.tokens && response.tokens.access) {
      this.saveToken(response.tokens.access);
    }
    return response;
  }

  async register(userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) {
    const response = await this.request<any>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.tokens && response.tokens.access) {
      this.saveToken(response.tokens.access);
    }
    return response;
  }

  async getProfile() {
    return this.request<any>('/auth/profile/');
  }

  logout() {
    this.clearToken();
  }

  // Cart API
  async getCart() {
    return this.request<any>('/orders/cart/');
  }

  async addToCart(bookId: number, quantity: number = 1) {
    try {
      const response = await this.request<any>('/orders/cart/add/', {
        method: 'POST',
        body: JSON.stringify({ book_id: bookId, quantity }),
      });
      console.log('API: Added to cart:', response);
      return response;
    } catch (error) {
      console.error('API: Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<any>(`/orders/cart/update/${itemId}/`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId: number) {
    return this.request<any>(`/orders/cart/remove/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return this.request<any>('/orders/cart/clear/', {
      method: 'DELETE',
    });
  }

  // Orders API
  async createOrder(orderData: {
    delivery_name: string;
    delivery_phone: string;
    delivery_address_text: string;
    payment_method: string;
    notes?: string;
  }) {
    // Device ID-ni al
    const deviceId = this.getDeviceId();
    
    return this.request<any>('/orders/orders/create/', {
      method: 'POST',
      headers: {
        'X-Device-ID': deviceId
      },
      body: JSON.stringify(orderData),
    });
  }

  private getDeviceId(): string {
    // Local storage-dan device ID-ni al və ya yeni yarad
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  // Contact API
  async sendContactMessage(data: {
    name?: string;
    email?: string;
    subject: string;
    message: string;
  }) {
    // Giriş olan istifadəçilər üçün name və email sahələrini tamamilə çıxar
    const cleanData = { ...data };
    
    // Əgər name və email boş və ya undefined-dirsə, onları çıxar
    if (!cleanData.name || cleanData.name === '') {
      delete cleanData.name;
    }
    if (!cleanData.email || cleanData.email === '') {
      delete cleanData.email;
    }
    
    console.log('Contact API - Sending data:', cleanData);
    
    return this.request<any>('/contact/send/', {
      method: 'POST',
      body: JSON.stringify(cleanData),
    });
  }
}

const api = new ApiClient();

export default api;

// Types
export interface Book {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  cover_image?: string;
  stock_quantity: number;
  average_rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  discount_percentage: number;
  language: string;
  pages: number;
  publication_date: string;
  isbn?: string;
  authors: Author[];
  category: Category;
  publisher?: Publisher;
}

export interface Author {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  books_count?: number;
}

export interface Publisher {
  id: number;
  name: string;
}

export interface BookListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Book[];
}

export interface CategoriesResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Category[];
}

// Auth types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}