/**
 * FacultySync - Database Utility
 * Handles persistence for faculty profiles and directory.
 */

const API_URL = 'https://faculty-alteraion.onrender.com/api';

const DB_KEYS = {
    CURRENT_USER: 'facultySync_current_user',
    SESSION_TOKEN: 'facultySync_session_token'
};

class FacultyDB {
    constructor() {
        this.token = localStorage.getItem(DB_KEYS.SESSION_TOKEN);
    }

    _getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    login(email, token) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, email);
        if (token) {
            this.token = token;
            localStorage.setItem(DB_KEYS.SESSION_TOKEN, token);
        }
    }

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
        localStorage.removeItem(DB_KEYS.SESSION_TOKEN);
        this.token = null;
    }

    async _fetch(url, options = {}) {
        const headers = { ...this._getHeaders(), ...(options.headers || {}) };
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401) {
            this.logout();
            // Store a message to show after redirect
            sessionStorage.setItem('login_error', 'Session expired. Please log in again.');
            window.location.href = 'index.html';
            throw new Error('Unauthorized');
        }
        return response;
    }

    async getCurrentUser() {
        const email = localStorage.getItem(DB_KEYS.CURRENT_USER);
        if (!email) return null;
        return await this.getProfile(email);
    }

    // DATA OPERATIONS
    async getProfile(email) {
        try {
            const response = await this._fetch(`${API_URL}/profiles/${email}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return null;
        }
    }

    async saveProfile(email, data) {
        try {
            const response = await this._fetch(`${API_URL}/profiles`, {
                method: 'POST',
                body: JSON.stringify({ ...data, id: email })
            });
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return { error: 'Failed to save profile' };
        }
    }

    async getAllFaculties() {
        try {
            const response = await this._fetch(`${API_URL}/profiles`);
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return [];
        }
    }

    async validateLogin(id, password) {
        try {
            // Note: validateLogin doesn't use _fetch as it handles its own 401 on failure
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });
            const data = await response.json();
            if (data.success) {
                this.login(id, data.token);
                return data.profile;
            }
            return false;
        } catch (e) {
            console.error('Database Error:', e);
            return false;
        }
    }

    // NOTIFICATIONS & REQUESTS
    async sendNotification(toId, fromId, type, data) {
        try {
            const fromProfile = await this.getProfile(fromId);
            const response = await this._fetch(`${API_URL}/notifications`, {
                method: 'POST',
                body: JSON.stringify({
                    to: toId,
                    from: fromId,
                    fromName: fromProfile ? fromProfile.name : 'Unknown',
                    type: type,
                    data: data
                })
            });
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return null;
        }
    }

    async getNotifications(userId) {
        try {
            const response = await this._fetch(`${API_URL}/notifications/${userId}`);
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return [];
        }
    }

    async getAllNotifications() {
        try {
            const response = await this._fetch(`${API_URL}/notifications`);
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return [];
        }
    }

    async markAsRead(notifId) {
        try {
            await this._fetch(`${API_URL}/notifications/${notifId}/read`, {
                method: 'PUT'
            });
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
        }
    }

    async deleteProfile(email) {
        try {
            await this._fetch(`${API_URL}/profiles/${email}`, {
                method: 'DELETE'
            });
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
        }
    }

    async changePassword(id, oldPassword, newPassword) {
        try {
            const response = await this._fetch(`${API_URL}/change-password`, {
                method: 'POST',
                body: JSON.stringify({ id, oldPassword, newPassword })
            });
            const data = await response.json();
            if (!response.ok) return { error: data.error || 'Failed to change password' };
            return data;
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return { error: 'Server error' };
        }
    }

    // CURRICULUM MANAGEMENT
    async getCurriculum() {
        try {
            const response = await this._fetch(`${API_URL}/curriculum`);
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return {};
        }
    }

    async saveCurriculum(data) {
        try {
            const response = await this._fetch(`${API_URL}/curriculum`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return { error: 'Failed to save curriculum' };
        }
    }

    // SECTION MANAGEMENT
    async getSections() {
        try {
            const response = await this._fetch(`${API_URL}/sections`);
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return {};
        }
    }

    async saveSections(data) {
        try {
            const response = await this._fetch(`${API_URL}/sections`, {
                method: 'POST',
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (e) {
            if (e.message !== 'Unauthorized') console.error('Database Error:', e);
            return { error: 'Failed to save sections' };
        }
    }
}

const db = new FacultyDB();
window.db = db;

