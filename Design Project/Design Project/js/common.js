/**
 * FacultySync - Common UI Logic
 * Handles sidebar injection, navbar updates, and session management across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Check
    if (typeof db !== 'undefined') {
        const currentUser = db.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();

        if (!currentUser && currentPage !== 'index.html' && currentPage !== '') {
            window.location.href = 'index.html';
            return;
        }

        // 1.5 Admin Redirection: If admin, they shouldn't be on faculty pages
        const isAdmin = currentUser && currentUser.role === 'admin';
        const facultyOnlyPages = ['dashboard.html', 'leave-history.html'];
        if (isAdmin && facultyOnlyPages.includes(currentPage)) {
            window.location.href = 'admin-dashboard.html';
            return;
        }

        // 2. Update UI with User Info
        if (currentUser) {
            updateUserUI(currentUser);
            updateNotificationBadge(currentUser.id);
            if (isAdmin) simplifyUIForAdmin();
        }
    }

    // 3. Highlight Active Link in Sidebar
    highlightActiveLink();

    // 4. Profile Dropdown Logic
    const profilePill = document.getElementById('profilePill');
    const profileMenu = document.getElementById('profileMenu');
    if (profilePill && profileMenu) {
        profilePill.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!profilePill.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('active');
            }
        });
    }

    // 5. Command Search Shortcut (unique feature)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.command-search');
            if (searchInput) searchInput.focus();
        }
    });
});

function updateUserUI(user) {
    const nameEls = document.querySelectorAll('#user-display-name, #current-user-name, #user-nav-name');
    const avatarEls = document.querySelectorAll('#user-initials, #quick-user-avatar, #user-nav-avatar');
    const roleEls = document.querySelectorAll('#user-nav-role');

    nameEls.forEach(el => el.innerText = user.name);

    if (avatarEls.length > 0) {
        avatarEls.forEach(el => {
            if (user.photo) {
                el.innerHTML = `<img src="${user.photo}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                el.style.background = 'transparent';
            } else {
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
                el.innerText = initials;
            }
        });
    }

    roleEls.forEach(el => el.innerText = user.desig || 'Faculty');
}

/**
 * Hides faculty-specific UI elements for admin users
 */
function simplifyUIForAdmin() {
    // Redirect Dashboard links to admin version and update labels
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const text = link.innerText.trim();
        if (text.includes('Dashboard')) {
            link.href = 'admin-dashboard.html';
            link.innerHTML = '<i class="fas fa-chart-pie"></i> Admin Dashboard';
        }
        if (text.includes('Leave History')) {
            link.style.display = 'none';
        }
    });

    // Hide Request Leave button on all pages
    const leaveBtns = document.querySelectorAll('button[onclick*="openLeaveModal"]');
    leaveBtns.forEach(btn => btn.style.display = 'none');

    // Hide specific dashboard stat blocks if they exist (though we usually redirect)
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0 && window.location.pathname.includes('dashboard.html')) {
        // Redundancy check if redirect fails
        document.querySelector('.main-content').innerHTML = '<div style="padding: 4rem; text-align:center;">Redirecting to Faculty Directory...</div>';
    }
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.nav-link, .sidebar-link, .profile-dropdown-menu a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            // Special case for dashboard
            if (currentPage === 'dashboard.html' && href === 'dashboard.html') link.classList.add('active');
            else link.classList.remove('active');
        }
    });
}

/**
 * Log out the user and redirect to login page
 */
function handleLogout() {
    if (typeof db !== 'undefined') {
        db.logout();
    }
    window.location.href = 'index.html';
}

/**
 * Update the notification badge count in the sidebar
 */
function updateNotificationBadge(userId) {
    if (typeof db === 'undefined') return;

    const notifs = db.getNotifications(userId);
    const unreadCount = notifs.filter(n => !n.read).length;

    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.innerText = unreadCount;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    });
}

// ============================================
// Toast Notification System
// ============================================

function initToastContainer() {
    if (document.querySelector('.toast-container')) return;
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
}

/**
 * Show a professional toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 */
function showToast(message, type = 'info') {
    initToastContainer();
    const container = document.querySelector('.toast-container');

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <div class="toast-icon"><i class="fas ${icon}"></i></div>
        <div class="toast-message">${message}</div>
        <div class="toast-close"><i class="fas fa-times"></i></div>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    const closeToast = () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close').onclick = (e) => {
        e.stopPropagation();
        closeToast();
    };

    // Auto-remove after 4 seconds
    const timeout = setTimeout(closeToast, 4000);

    toast.onclick = () => {
        clearTimeout(timeout);
        closeToast();
    };
}

// Override native alert for consistency
window.alert = (msg) => showToast(msg, 'info');
