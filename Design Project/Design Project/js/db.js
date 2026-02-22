/**
 * FacultySync - Database Utility
 * Handles persistence for faculty profiles and directory.
 */

const DB_KEYS = {
    CURRENT_USER: 'facultySync_current_user', // The ID or email of the logged-in user
    PROFILES: 'facultySync_profiles', // Object map of all faculty profiles { email: profile_data }
    NOTIFICATIONS: 'facultySync_notifications', // Array of notification objects
};

const DEFAULT_FACULTIES = [
    {
        id: '001',
        password: '12345678',
        name: "Dr. Vikram Seth",
        dept: "Electronics (ECE)",
        desig: "Professor",
        phone: "9876543201",
        timetable: {
            'cell-0-1': { subject: 'Digital Circuits', section: 'ECE-C', year: '2' },
            'cell-2-4': { subject: 'Signal Processing', section: 'ECE-A', year: '3' }
        }
    },
    {
        id: '002',
        password: '12345678',
        name: "Prof. Anjali Sharma",
        dept: "Electronics (ECE)",
        desig: "Associate Professor",
        phone: "9876543202",
        timetable: {
            'cell-1-2': { subject: 'Microcontrollers', section: 'ECE-B', year: '3' },
            'cell-3-1': { subject: 'Embedded Systems', section: 'ECE-A', year: '4' }
        }
    },
    {
        id: 'rajesh@example.com',
        password: 'password',
        name: "Prof. Rajesh Kumar",
        dept: "Electronics (ECE)",
        desig: "Professor",
        phone: "9876543210",
        timetable: {
            'cell-0-2': { subject: 'Network Theory', section: 'ECE-A', year: '2' },
            'cell-1-3': { subject: 'VLSI Design', section: 'ECE-B', year: '4' }
        }
    },
    {
        id: 'kavita@example.com',
        password: 'password',
        name: "Dr. Kavita Singh",
        dept: "Electronics (ECE)",
        desig: "Associate Professor",
        phone: "9123456780",
        timetable: {
            'cell-0-3': { subject: 'Control Systems', section: 'ECE-C', year: '3' },
            'cell-2-1': { subject: 'Communication Systems', section: 'ECE-A', year: '3' }
        }
    },
    {
        id: 'jeevamkce14@gmail.com',
        password: '12345678',
        name: "Admin User",
        dept: "Administration",
        desig: "System Administrator",
        phone: "0000000000",
        role: 'admin',
        timetable: {}
    }
];

class FacultyDB {
    constructor() {
        this.init();
    }

    init() {
        const profilesExist = !!localStorage.getItem(DB_KEYS.PROFILES);
        let profiles = {};

        if (!profilesExist) {
            DEFAULT_FACULTIES.forEach(f => {
                profiles[f.id] = f;
            });
        } else {
            profiles = JSON.parse(localStorage.getItem(DB_KEYS.PROFILES));
            DEFAULT_FACULTIES.forEach(f => {
                if (profiles[f.id]) {
                    profiles[f.id].dept = "Electronics (ECE)";
                } else {
                    profiles[f.id] = f;
                }
            });
        }

        localStorage.setItem(DB_KEYS.PROFILES, JSON.stringify(profiles));
    }

    // AUTH / SESSION
    login(email) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, email);
    }

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }

    getCurrentUser() {
        const email = localStorage.getItem(DB_KEYS.CURRENT_USER);
        if (!email) return null;
        return this.getProfile(email);
    }

    // DATA OPERATIONS
    getProfile(email) {
        const profiles = JSON.parse(localStorage.getItem(DB_KEYS.PROFILES)) || {};
        return profiles[email] || null;
    }

    saveProfile(email, data) {
        const profiles = JSON.parse(localStorage.getItem(DB_KEYS.PROFILES)) || {};
        profiles[email] = { ...profiles[email], ...data, id: email };
        localStorage.setItem(DB_KEYS.PROFILES, JSON.stringify(profiles));

        // If updating current user, ensure we stay synced
        if (localStorage.getItem(DB_KEYS.CURRENT_USER) === email) {
            // Success
        }
    }

    getAllFaculties() {
        const profiles = JSON.parse(localStorage.getItem(DB_KEYS.PROFILES)) || {};
        return Object.values(profiles);
    }

    validateLogin(id, password) {
        const profile = this.getProfile(id);
        if (!profile) return false;
        // For sample demo, if password isn't set, allow 'password'
        const correctPassword = profile.password || 'password';
        return password === correctPassword;
    }

    // NOTIFICATIONS & REQUESTS
    sendNotification(toId, fromId, type, data) {
        const notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
        const fromProfile = this.getProfile(fromId);

        const newNotif = {
            id: Date.now(),
            to: toId,
            from: fromId,
            fromName: fromProfile ? fromProfile.name : 'Unknown',
            type: type, // 'request', 'approval', 'system'
            data: data, // { period, day, subject, etc }
            timestamp: new Date().toISOString(),
            read: false
        };

        notifs.unshift(newNotif);
        localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
        return newNotif;
    }

    getNotifications(userId) {
        const notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
        return notifs.filter(n => n.to === userId);
    }

    markAsRead(notifId) {
        const notifs = JSON.parse(localStorage.getItem(DB_KEYS.NOTIFICATIONS)) || [];
        const index = notifs.findIndex(n => n.id === notifId);
        if (index !== -1) {
            notifs[index].read = true;
            localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
        }
    }

    deleteProfile(email) {
        const profiles = JSON.parse(localStorage.getItem(DB_KEYS.PROFILES)) || {};
        delete profiles[email];
        localStorage.setItem(DB_KEYS.PROFILES, JSON.stringify(profiles));
    }
}

const db = new FacultyDB();
window.db = db; // Export to global for use in other scripts
window.DEFAULT_FACULTIES = DEFAULT_FACULTIES;
