# Operation Scheduler for Hospital Management (OpScheduler)

## 1. Introduction

OpScheduler is a web-based application designed to address the logistical challenges of managing surgical schedules in a hospital environment. It transforms the traditional static scheduling process into a dynamic, real-time system, allowing hospital administrators to efficiently manage operating rooms, doctors, and patient appointments. The application provides separate, secure dashboards for administrators and patients, ensuring a streamlined workflow for all users.

---

## 2. Problem Statement

Hospitals often face significant challenges in scheduling surgeries due to a variety of factors, including operating room availability, staff working hours, doctor preferences, and last-minute changes like cancellations or emergencies. Manual scheduling is inefficient, prone to errors, and lacks the flexibility to adapt to the dynamic nature of a hospital. OpScheduler aims to solve this by providing a centralized, digital platform that automates and simplifies the entire scheduling process.

---

## 3. Features

### Admin Dashboard
- **Secure Login:** Admins have a dedicated login to access their management dashboard.
- **Doctor Management (CRUD):**
    - **Add:** Add new doctors with their details (name, specialty, contact info, availability).
    - **View:** See a complete list of all doctors in the system.
    - **Edit:** Update the information of existing doctors.
    - **Delete:** Remove doctor records from the system.
- **Patient Management (CRUD):**
    - **Add:** Register new patients with their personal and contact details.
    - **View:** Access a comprehensive list of all patients.
    - **Edit:** Modify patient information as needed.
    - **Delete:** Remove patient records.
- **Operation Scheduling (CRUD):**
    - **Schedule:** Create new operation appointments, assigning a patient, doctor, operation type, date, and time.
    - **View:** See a full list of all scheduled, upcoming, and past operations.
    - **Edit:** Update the details of a scheduled operation.
    - **Cancel:** Remove a scheduled operation from the system.
- **Reporting:** View key metrics and generate reports on hospital activity.

### Patient Dashboard
- **Secure Registration & Login:** Patients can create their own accounts and log in to a personalized dashboard.
- **View Upcoming Operations:** Patients can see a clear list of their own upcoming scheduled surgeries, including date, time, doctor, and any notes.
- **View Doctor Details:** Patients can click on a doctor's name in their schedule to view more details about the physician in a pop-up modal.
- **Profile Management:** Patients can view their own profile information stored in the system.

---

## 4. Technologies Used

- **Frontend:** HTML5, CSS3 (Internal Styles), JavaScript (ES6 Modules)
- **Backend & Database:** Google Firebase (Firestore Database, Firebase Authentication)
- **Icons:** Bootstrap Icons

---

## 5. System Architecture

The application is a client-side web application that communicates directly with Google Firebase services.

- **Firebase Authentication:** Handles all user registration, login, and session management. It provides secure authentication for both admins and patients.
- **Firestore Database:** A NoSQL cloud database that stores all the application data in collections (`users`, `doctors`, `patients`, `schedules`). The frontend application reads from and writes to Firestore in real-time.
- **Client-Side Logic:** All the application's business logic, from displaying data to handling user input, is managed by JavaScript running in the user's browser.

---

## 6. Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox).
- A code editor (e.g., VS Code).

### Firebase Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  **Create a new project**.
3.  **Add a new web app** to your project to get your Firebase configuration credentials.
4.  Enable **Firebase Authentication** and add the "Email/Password" sign-in method.
5.  Enable the **Firestore Database** and create it in test mode for initial development (remember to secure your rules before deployment).
6.  **Create Collections:** Manually create the following collections in your Firestore database: `users`, `doctors`, `patients`, `schedules`.
7.  **Create Indexes:** The application requires two composite indexes for querying schedules. Run the application, and when you see a "The query requires an index" error in the console, click the provided link to automatically create the necessary indexes in Firestore.

### Installation
1.  Clone the repository:
    ```sh
    git clone [https://github.com/your-username/opscheduler.git](https://github.com/your-username/opscheduler.git)
    ```
2.  Navigate to the project directory:
    ```sh
    cd opscheduler
    ```
3.  Create a `firebase.js` file inside the `js/` directory.
4.  Copy and paste your Firebase project configuration into `js/firebase.js`:
    ```javascript
    // js/firebase.js
    import { initializeApp } from "[https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js](https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js)";
    import { getAuth } from "[https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js](https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js)";
    import { getFirestore } from "[https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js](https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js)";

    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_AUTH_DOMAIN",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_STORAGE_BUCKET",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getFirestore(app);

    // You can also export loader functions and other shared utilities from here.
    ```
5.  Open the `index.html` or `landing-page.html` file in your browser to start the application.

---

## 7. Project Structure


/OpScheduler
|-- /js/
|   |-- auth.js             # Handles user authentication checks and logout
|   |-- dashboard.js        # Main logic for the admin dashboard, navigation
|   |-- doctors.js          # CRUD logic for the Doctors section
|   |-- patients.js         # CRUD logic for the Patients section
|   |-- patient-dashboard.js# Logic for the patient-facing dashboard
|   |-- schedule.js         # CRUD logic for the Schedule section
|   |-- reports.js          # Logic for generating reports
|   |-- firebase.js         # Firebase configuration and initialization
|-- dashboard.html          # Admin dashboard page
|-- patient-dashboard.html  # Patient dashboard page
|-- login.html              # Login page
|-- register.html           # Patient registration page
|-- index.html              # Landing page
|-- dashboard.css           # Main stylesheet for the dashboards
|-- README.md               # This file


---

## 8. Workflow and Execution

1.  **Landing Page:** New users are greeted with a landing page explaining the application's features.
2.  **Registration/Login:**
    - Patients can register for a new account. Upon registration, a user is created in Firebase Authentication, and corresponding documents are created in the `users` and `patients` collections in Firestore.
    - Existing users (admins or patients) can log in.
3.  **Role-Based Redirection:** After login, the application checks the user's role from the `users` collection.
    - If the role is `admin`, the user is redirected to `dashboard.html`.
    - If the role is `patient`, the user is redirected to `patient-dashboard.html`.
4.  **Dashboard Interaction:**
    - **Admins** can navigate between sections (Doctors, Patients, Schedule) to manage all hospital data. Each section is powered by a dedicated JavaScript module that handles all interactions with Firestore.
    - **Patients** can view their upcoming appointments and personal profile details, with data fetched specifically for their user ID.
