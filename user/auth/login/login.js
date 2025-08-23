import{ auth, signInWithEmailAndPassword } from '../../../config/firebase.js';


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');
    const messageBox = document.getElementById('message-box');
    const toggleButton = document.getElementById('togglePassword');
    const icon = toggleButton.querySelector('i');

    // Toggle Password Visibility
    toggleButton.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        icon.classList.toggle('bi-eye-slash');
        icon.classList.toggle('bi-eye');
    });

    // Form Submit
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        messageBox.classList.add('d-none');
        messageBox.textContent = '';
        messageBox.classList.remove('alert-success', 'alert-danger');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            messageBox.textContent = 'Please fill in both fields.';
            messageBox.classList.add('alert-danger');
            messageBox.classList.remove('d-none');
            return;
        }

        // ===== Sign In =====
        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const idTokenResult = await user.getIdTokenResult(true);
                const token = idTokenResult.token;
                const role = idTokenResult.claims.role || "member";
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('uid', user.uid);

                messageBox.textContent = 'Login successful! Redirecting...';
                messageBox.classList.add('alert-success');
                messageBox.classList.remove('d-none');

                setTimeout(() => {
                    if (role === "admin") {
                        window.location.href = "../../../admin/dashboard/dashboard.html"
                    } else {
                        window.location.href = "../../../patient/patient-dashboard.html";
                    }
                }, 800);
            })
            .catch((error) => {
                let errorMessageText;
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessageText = 'Invalid email address.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessageText = 'Incorrect email or password.';
                        break;
                    default:
                        errorMessageText = `Login failed. Error: ${error.message}`;
                        break;
                }
                messageBox.textContent = errorMessageText;
                messageBox.classList.add('alert-danger');
                messageBox.classList.remove('d-none');
                console.error('Login error:', error.code, error.message);
            });
    });
});
