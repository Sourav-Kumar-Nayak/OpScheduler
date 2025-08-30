// js/dashboard.js

import { checkAdminRole, logoutHandler } from '../../user/auth/auth.js';

// ====== DOM Elements ======
const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
const contentSections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('section-title');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

// ====== Event Listeners ======
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
});

sidebarLinks.forEach(link => {
    link.addEventListener('click', handleNavigation);
});

logoutHandler();

checkAdminRole()
    .then(user => {
        // If the promise resolves, the user is an admin.
        console.log("Admin access granted for:", user.email);
        initializeApp();
    })
    .catch(error => {
        // If the promise rejects, the user is not an admin or not logged in.
        console.error("Authentication check failed:", error);
        // The logout handler will redirect to the login page.
        // As a fallback, we can redirect here as well.
        window.location.href = '../../user/auth/login/login.html';
    });



function initializeApp() {
    const defaultSection = 'dashboard';
    const defaultLink = document.querySelector(`.sidebar-nav-link[data-section="${defaultSection}"]`);

    if (defaultLink) {
        defaultLink.classList.add('active');
    }
    showSection(defaultSection);
}


function handleNavigation(e) {
    e.preventDefault();
    const section = e.currentTarget.getAttribute('data-section');

    // Update the active state of sidebar links
    sidebarLinks.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');

    // Show the selected section
    showSection(section);
}


function showSection(sectionName) {
    // Hide all content sections
    contentSections.forEach(section => section.classList.add('hidden'));

    const sectionEl = document.getElementById(sectionName);
    if (!sectionEl) {
        console.error(`Error: Content section "${sectionName}" could not be found in the DOM.`);
        return;
    }

    // Show the target section and update the main title
    sectionEl.classList.remove('hidden');
    const titleSpan = document.querySelector(`.sidebar-nav-link[data-section="${sectionName}"] span`);
    if (titleSpan) {
        sectionTitle.textContent = titleSpan.textContent;
    }

    // Dynamically import the corresponding JavaScript module for the section
    switch(sectionName) {
        case 'dashboard':
            import('./js/dashboard-data.js').then(module => module.initDashboard());
            console.log("Dashboard section loaded.");
            break;
        case 'doctors':
            import('./js/doctors.js').then(module => module.initDoctors()).catch(err => console.error('Failed to load doctors module:', err));
            break;
        case 'schedule':
            import('./js/schedule.js').then(module => module.initSchedule());
            console.log("Schedule section loaded.");
            break;
        case 'patients':
            import('./js/patients.js').then(module => module.initPatients());
            console.log("Patients section loaded.");
            break;
        default:
            console.warn(`No JavaScript module is defined for the section: ${sectionName}`);
            break;
    }
}
