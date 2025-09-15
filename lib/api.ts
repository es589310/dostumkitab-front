// lib/api.ts
import { getDeviceId } from './device-id';

// Environment variables yoxlayırıq (development mühitində)
if (process.env.NODE_ENV === 'development') {
  console.log('API Client - Environment Variables:');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

if (process.env.NODE_ENV === 'development') {
  console.log('API Client - Final API_BASE_URL:', API_BASE_URL);
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (process.env.NODE_ENV === 'development') {
      console.log('ApiClient constructor - baseURL:', this.baseURL);
    }
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
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', url);
      }
      const response = await fetch(url, config);
      if (process.env.NODE_ENV === 'development') {
        console.log('API: Response status:', response.status);
      }

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.error('API: Failed to parse error response');
        }
        
        // İstifadəçi dostu xəta mesajları
        let userFriendlyMessage = "";
        
        // HTTP Status kodlarına görə mesajlar
        switch (response.status) {
          case 400:
            if (errorData.error && errorData.error.includes('Stokda yalnız')) {
              userFriendlyMessage = errorData.error;
            } else if (errorData.password) {
              const passwordErrors = errorData.password;
              userFriendlyMessage = "Şifrə tələbləri qarşılanmır:\n";
              
              if (Array.isArray(passwordErrors)) {
                passwordErrors.forEach((error: string) => {
                  userFriendlyMessage += `• ${error}\n`;
                });
              } else {
                userFriendlyMessage += `• ${passwordErrors}`;
              }
              userFriendlyMessage = userFriendlyMessage.trim();
            } else if (errorData.error) {
              userFriendlyMessage = errorData.error;
            } else {
              userFriendlyMessage = "Göndərilən məlumatlar düzgün deyil. Zəhmət olmasa yenidən yoxlayın.";
            }
            break;
            
          case 401:
            if (errorData.error) {
              userFriendlyMessage = errorData.error;
            } else {
              userFriendlyMessage = "İstifadəçi adı və ya şifrə yanlışdır!";
            }
            break;
            
          case 403:
            userFriendlyMessage = "Bu əməliyyatı yerinə yetirmək üçün icazəniz yoxdur.";
            break;
            
          case 404:
            userFriendlyMessage = "Axtardığınız səhifə tapılmadı.";
            break;
            
          case 409:
            if (errorData.error) {
              userFriendlyMessage = errorData.error;
            } else {
              userFriendlyMessage = "Bu məlumat artıq mövcuddur.";
            }
            break;
            
          case 422:
            if (errorData.error) {
              userFriendlyMessage = errorData.error;
            } else {
              userFriendlyMessage = "Göndərilən məlumatlar qəbul edilə bilmir.";
            }
            break;
            
          case 429:
            userFriendlyMessage = "Çox tez-tez istək göndərirsiniz. Zəhmət olmasa bir az gözləyin.";
            break;
            
          case 500:
            userFriendlyMessage = "Server xətası baş verdi. Zəhmət olmasa daha sonra cəhd edin.";
            break;
            
          case 502:
          case 503:
          case 504:
            userFriendlyMessage = "Server hazırda əlçatan deyil. Zəhmət olmasa daha sonra cəhd edin.";
            break;
            
          default:
            if (errorData.error) {
              userFriendlyMessage = errorData.error;
            } else if (errorData.message) {
              userFriendlyMessage = errorData.message;
            } else {
              userFriendlyMessage = "Gözlənilməz xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.";
            }
        }
        
        // Development mühitində ətraflı log
        if (process.env.NODE_ENV === 'development') {
          console.error('API: Response not ok:', response.status, errorData);
        }
        
        throw new Error(userFriendlyMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('API: JSON response:', data);
        }
        return data;
      }
      if (process.env.NODE_ENV === 'development') {
        console.log('API: Non-JSON response');
      }
      return {} as T;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Books API
  async getBooks(params: Record<string, string> = {}): Promise<BookListResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request<BookListResponse>(`/books/?${queryString}`);
  }
  

  async getFeaturedBooks() {
    return this.request<BookListResponse>('/books/featured');
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
    return this.request<CategoriesResponse | Category[]>('/books/categories/tree/');
  }

  async getCategory(categoryId: number): Promise<Category> {
    return this.request<Category>(`/books/categories/${categoryId}/`);
  }

  async getBooksByCategory(categoryId: number, page: number = 1): Promise<BookListResponse | Book[]> {
    return this.request<BookListResponse | Book[]>(`/books/category/${categoryId}/?page=${page}`);
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Contact API - Sending data:', cleanData);
    }
    
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
  cover_imagekit_url?: string;
  back_image?: string;
  back_imagekit_url?: string;
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
  slug?: string;
  description?: string;
  books_count?: number;
  parent?: number;
  parent_name?: string;
  level?: number;
  is_leaf?: boolean;
  order?: number;
  children?: Category[];
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