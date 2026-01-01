const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // ✅ FIX: Check BOTH LocalStorage AND SessionStorage for the token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Default headers
    const headers = {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // ⚠️ CRITICAL: Only set JSON Content-Type if NOT sending FormData.
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 (Unauthorized) specifically
      if (response.status === 401) {
        console.warn('[API] 401 Unauthorized - Session expired or invalid.');
        
        // ✅ FIX: Clear BOTH storages on 401
        if (token) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token'); // Clear session too
            sessionStorage.removeItem('user');
            
            if (!window.location.pathname.includes('/auth')) {
                window.location.href = '/auth';
            }
        }
        throw new Error('Session expired. Please login again.');
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;

    } catch (error) {
      console.error('[API] Request failed:', error);
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // 🔐 AUTHENTICATION & PROFILE
  // ---------------------------------------------------------------------------
  
  async login(email, password) {
    return this.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }
  
  async register(email, password, name) {
    return this.request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name }) });
  }
  
  async getCurrentUser() { 
    return this.request('/auth/me'); 
  }
  
  async logout() { 
      // ✅ FIX: Clear BOTH storages on logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/auth'; 
  }

  async updateProfile(data) {
    return this.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) });
  }

  async changePassword(data) {
    return this.request('/auth/profile/password', { method: 'PUT', body: JSON.stringify(data) });
  }

  async requestPasswordReset(email) {
    return this.request('/auth/forgot-password', { 
      method: 'POST', 
      body: JSON.stringify({ email }) 
    });
  }

  async resetPassword(email, otp, newPassword) {
    return this.request('/auth/reset-password', { 
      method: 'POST', 
      body: JSON.stringify({ email, otp, newPassword }) 
    });
  }
  
  // ---------------------------------------------------------------------------
  // 📅 EVENTS MANAGEMENT
  // ---------------------------------------------------------------------------
  
  async getEvents(filter) {
    const query = filter ? `?filter=${filter}` : '';
    return this.request(`/events${query}`);
  }

  async getEventById(id) {
    return this.request(`/events/${id}`);
  }

  // ---------------------------------------------------------------------------
  // 👥 VOLUNTEERS
  // ---------------------------------------------------------------------------
  
  async getVolunteers() { 
    return this.request('/volunteers'); 
  }
  
  async getVolunteerMe() { 
    return this.request('/volunteers/me'); 
  } 

  async updateVolunteer(id, data) { 
    return this.request(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }); 
  }

  // ---------------------------------------------------------------------------
  // 🎤 Team Member
  // ---------------------------------------------------------------------------
  
  async getTeamMembers() {
    return this.request('/team-members');
  }

  // ---------------------------------------------------------------------------
  // 🎟️ REGISTRATIONS
  // ---------------------------------------------------------------------------
  
  async getAllRegistrations(page = 1, search = '', limit = 10, eventId = null) { 
    const params = new URLSearchParams();
    
    params.append('page', page);
    params.append('limit', limit);
    
    if (search) {
        params.append('search', search);
    }
    
    if (eventId && eventId !== 'all') {
        params.append('eventId', eventId);
    }

    return this.request(`/registrations?${params.toString()}`); 
  }

  async getRecentRegistrations() {
    return this.request('/registrations/recent');
  }

  async getEventRegistrations(eventId) {
    return this.request(`/registrations/event/${eventId}`);
  }

  async toggleRegistrationAttendance(id, isAttended) {
      return this.request(`/registrations/${id}/attendance`, { 
        method: 'PUT', 
        body: JSON.stringify({ isAttended }) 
      });
  }

  async deleteRegistration(id) {
    return this.request(`/registrations/${id}`, { method: 'DELETE' });
  }

  async checkInRegistration(tokenId) {
    return this.request(`/registrations/checkin/${tokenId}`, { method: 'PUT' });
  }
  
  // ---------------------------------------------------------------------------
  // 📩 MESSAGES (CONTACT)
  // ---------------------------------------------------------------------------
  
  async sendContactMessage(data) {
    // Assuming this maps to POST /api/contact
    return this.request('/contact', { method: 'POST', body: JSON.stringify(data) });
  }
  
  async getContactMessages() {
    return this.request('/contact'); 
  }
  
  async deleteContactMessage(id) {
    return this.request(`/contact/${id}`, { method: 'DELETE' });
  }

  // ✅ NEW: Mark Message as Read
  async markMessageAsRead(id) {
    return this.request(`/contact/${id}/read`, { method: 'PUT' });
  }

  // ---------------------------------------------------------------------------
  // 🌍 EXTERNAL EVENTS
  // ---------------------------------------------------------------------------

  async getExternalEvents(type = null, status = null) {
    const params = new URLSearchParams();
    
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/external-events${query}`);
  }

  async getExternalEvent(id) {
    return this.request(`/external-events/${id}`);
  }
}

export const apiClient = new ApiClient();