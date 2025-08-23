// js/register.js


import { auth, db, createUserWithEmailAndPassword, doc, setDoc, serverTimestamp } from '../../../config/firebase.js';

// ====== DOM Elements ======
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');

// ====== Event Listener ======
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessage.classList.add('hidden');

    // Get form values
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const address = document.getElementById('address').value;
    const password = document.getElementById('password').value;

    try {
        // Step 1: Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Prepare patient data for Firestore
        const patientData = {
            name: fullName,
            email: email,
            phone: phone,
            dob: dob,
            address: address,
            createdAt: serverTimestamp(),
            authUid: user.uid // Link the patient record to the auth user ID
        };

        // Step 3: Create documents in Firestore
        // Create a 'users' document to store the role
        await setDoc(doc(db, "users", user.uid), { role: 'patient' });
        // Create a 'patients' document with the detailed profile
        await setDoc(doc(db, "patients", user.uid), patientData);

        // Step 4: Redirect on success
        alert("Registration successful! You will now be redirected to the login page.");
        window.location.href = '../../auth/login/login.html';

    } catch (error) {
        console.error("Registration Error:", error);
        errorMessage.textContent = error.message;
        errorMessage.classList.remove('hidden');
    }
});
