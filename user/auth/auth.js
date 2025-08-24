import { auth, onAuthStateChanged, signOut } from '../../config/firebase.js';

// Check if user is admin
export function checkAdminRole() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) return reject("Not logged in");
            try {
                const idTokenResult = await user.getIdTokenResult(true);
                const role = idTokenResult.claims.role || "member";
                if (role !== "admin") return reject("Access denied. Admins only.");
                resolve(user);
            } catch (error) {
                reject(error);
            }
        });
    });
}
export function checkUserLoggedIn() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe(); // Stop listening after the first check
            if (user) {
                resolve(user);
            } else {
                reject("User is not logged in.");
            }
        }, (error) => {
            unsubscribe();
            reject(error);
        });
    });
}
// Logout handler
export function logoutHandler() {
    document.getElementById("logoutBtn")?.addEventListener("click", async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await signOut(auth);
                localStorage.removeItem('jwtToken');

                const dashboard = document.getElementById('dashboard');
                if (dashboard) {
                    dashboard.style.animation = 'slideOut 0.5s ease-in forwards';
                    setTimeout(() => {
                        window.location.href = '../../home/index.html';
                    }, 500);
                } else {
                    // fallback if dashboard element is missing
                    window.location.href = '../../home/index.html';
                }
            } catch (error) {
                console.error("Sign out error:", error);
                alert("Error signing out, please try again.");
            }
        }
    });
}