const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

// API client class
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Token-i localStorage-dan al
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("access_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  removeToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    console.log("API: Making request to:", url)

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      console.log("API: Response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, try to refresh
          console.log("API: Token expired, refreshing...")
          await this.refreshToken()
          // Retry original request
          const retryConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${this.token}`,
            },
          }
          const retryResponse = await fetch(url, retryConfig)
          console.log("API: Retry response status:", retryResponse.status)
          if (!retryResponse.ok) {
            const errorData = await retryResponse.json()
            console.error("API: Retry failed:", errorData)
            throw new Error(errorData.detail || `HTTP error! status: ${retryResponse.status}`)
          }
          return retryResponse.json()
        }
        const errorData = await response.json()
        console.error("API: Request failed:", errorData)
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API: Request successful, data:", data)
      return data
    } catch (error) {
      console.error("API: Request failed:", error)
      throw error
    }
  }

  private async refreshToken() {
    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      this.removeToken()
      throw new Error("No refresh token available")
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (!response.ok) {
        this.removeToken()
        const errorData = await response.json()
        throw new Error(errorData.detail || "Token refresh failed")
      }

      const data = await response.json()
      this.setToken(data.access)
    } catch (error) {
      this.removeToken()
      throw error
    }
  }

  // Books API
  async getBooks(params?: {
    page?: number
    search?: string
    category?: string
    ordering?: string
    is_featured?: boolean
    is_bestseller?: boolean
    is_new?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }
    const query = searchParams.toString()
    return this.request<BooksResponse>(`/books/${query ? `?${query}` : ""}`)
  }

  async getBook(slug: string) {
    console.log("API: Getting book with slug:", slug)
    try {
      // Önce slug ile deneyelim
      const result = await this.request<Book>(`/books/${slug}/`)
      console.log("API: Book data received:", result)
      return result
    } catch (error) {
      console.error("API: Error getting book with slug, trying with detail endpoint:", error)
      try {
        // Eğer slug ile çalışmazsa, detail endpoint'ini deneyelim
        const result = await this.request<Book>(`/books/detail/${slug}/`)
        console.log("API: Book data received from detail endpoint:", result)
        return result
      } catch (detailError) {
        console.error("API: Error getting book with detail endpoint:", detailError)
        throw detailError
      }
    }
  }

  async getFeaturedBooks() {
    try {
      const response = await this.request<BooksResponse | Book[]>(`/books/featured/`)
      console.log("API Response for featured books:", response)
      return response
    } catch (error) {
      console.error("API Error in getFeaturedBooks:", error)
      throw error
    }
  }

  async getBestsellerBooks() {
    return this.request<BooksResponse | Book[]>(`/books/bestsellers/`)
  }

  async getNewBooks() {
    return this.request<BooksResponse | Book[]>(`/books/new/`)
  }

  async getCategories() {
    return this.request<CategoriesResponse | Category[]>(`/books/categories/`)
  }

  async getBookStats() {
    return this.request<BookStats>(`/books/stats/`)
  }

  // Auth API
  async register(userData: RegisterData) {
    return this.request<AuthResponse>(`/auth/register/`, {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: LoginData) {
    const response = await this.request<AuthResponse>(`/auth/login/`, {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.tokens) {
      this.setToken(response.tokens.access)
      localStorage.setItem("refresh_token", response.tokens.refresh)
    }

    return response
  }

  async getProfile() {
    return this.request<User>(`/auth/profile/`)
  }

  async updateProfile(userData: Partial<User>) {
    return this.request<User>(`/auth/profile/`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  }

  // Cart API
  async getCart() {
    return this.request<Cart>(`/orders/cart/`)
  }

  async addToCart(bookId: number, quantity = 1) {
    return this.request<{ message: string; cart: Cart }>(`/orders/cart/add/`, {
      method: "POST",
      body: JSON.stringify({ book_id: bookId, quantity }),
    })
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<{ message: string; cart: Cart }>(`/orders/cart/items/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId: number) {
    return this.request<{ message: string }>(`/orders/cart/items/${itemId}/remove/`, {
      method: "DELETE",
    })
  }

  // Orders API
  async getOrders() {
    return this.request<OrdersResponse>(`/orders/`)
  }

  async getOrder(orderId: number) {
    return this.request<Order>(`/orders/${orderId}/`)
  }

  async createOrder(orderData: CreateOrderData) {
    return this.request<{ message: string; order: Order }>(`/orders/create/`, {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  // Addresses API
  async getAddresses() {
    return this.request<Address[]>(`/auth/addresses/`)
  }

  async createAddress(addressData: CreateAddressData) {
    return this.request<Address>(`/auth/addresses/`, {
      method: "POST",
      body: JSON.stringify(addressData),
    })
  }

  // Reviews API
  async createReview(bookId: number, rating: number, comment: string) {
    return this.request<BookReview>(`/books/${bookId}/reviews/`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    })
  }

  async getBookReviews(bookId: number) {
    return this.request<BookReview[]>(`/books/${bookId}/reviews/`)
  }
}

// Types
export interface Book {
  id: number
  title: string
  slug: string
  authors: Author[]
  category: Category
  publisher?: Publisher
  isbn?: string
  description: string
  language: string
  pages: number
  publication_date: string
  price: string
  original_price?: string
  stock_quantity: number
  cover_image: string
  back_image?: string
  is_featured: boolean
  is_bestseller: boolean
  is_new: boolean
  views_count: number
  sales_count: number
  created_at: string
  average_rating: number
  reviews_count: number
  discount_percentage: number
  reviews?: BookReview[]
}

export interface Author {
  id: number
  name: string
  biography?: string
  birth_date?: string
  death_date?: string
  photo?: string
  nationality?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
}

export interface Publisher {
  id: number
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
}

export interface BookReview {
  id: number
  user: number
  user_name: string
  rating: number
  comment: string
  created_at: string
}

export interface BooksResponse {
  count: number
  next?: string
  previous?: string
  results: Book[]
}

export interface CategoriesResponse {
  count: number
  next?: string
  previous?: string
  results: Category[]
}

export interface BookStats {
  total_books: number
  featured_books: number
  bestsellers: number
  new_books: number
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  profile: UserProfile
  date_joined: string
}

export interface UserProfile {
  phone?: string
  birth_date?: string
  gender?: string
  avatar?: string
  address?: string
  city?: string
  postal_code?: string
  newsletter_subscription: boolean
  sms_notifications: boolean
  email_notifications: boolean
}

export interface RegisterData {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface LoginData {
  username: string
  password: string
}

export interface AuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

export interface CartItem {
  id: number
  book: Book
  quantity: number
  total_price: string
  added_at: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total_price: string
  total_items: number
  updated_at: string
}

export interface Order {
  id: number
  order_number: string
  status: string
  status_display: string
  payment_status: string
  payment_status_display: string
  payment_method: string
  subtotal: string
  shipping_cost: string
  discount_amount: string
  total_amount: string
  delivery_name: string
  delivery_phone: string
  delivery_address: Address
  delivery_address_text: string
  notes?: string
  created_at: string
  items: OrderItem[]
}

export interface OrderItem {
  id: number
  book: Book
  quantity: number
  price: string
  total_price: string
}

export interface OrdersResponse {
  count: number
  next?: string
  previous?: string
  results: Order[]
}

export interface CreateOrderData {
  delivery_address_id: number
  delivery_name: string
  delivery_phone: string
  payment_method: string
  notes?: string
}

export interface Address {
  id: number
  title: string
  address_type: string
  full_address: string
  city: string
  district?: string
  postal_code?: string
  phone?: string
  is_default: boolean
  is_active: boolean
}

export interface CreateAddressData {
  title: string
  address_type: string
  full_address: string
  city: string
  district?: string
  postal_code?: string
  phone?: string
  is_default?: boolean
}

// API client instance
export const api = new ApiClient(API_BASE_URL)

export default api
