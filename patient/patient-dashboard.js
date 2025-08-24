// js/patient-dashboard.js

// ====== Imports ======
import { db, auth, showLoader, hideLoader, collection, getDocs, query, where, Timestamp, doc, getDoc } from '../config/firebase.js';
import { checkUserLoggedIn, logoutHandler } from "../user/auth/auth.js";

// ====== Initialize Handlers ======
logoutHandler();

// ====== DOM Elements ======
const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
const contentSections = document.querySelectorAll('.content-section');
const sectionTitle = document.getElementById('section-title');
const menuToggle = document.getElementById('menu-toggle');
const doctorDetailsModal = document.getElementById('doctorDetailsModal');
const closeDoctorModal = document.getElementById('closeDoctorModal');
const doctorDetailsContent = document.getElementById('doctorDetailsContent');

// ====== App Initialization ======
checkUserLoggedIn()
    .then(user => {
        loadPatientData(user.uid);
    })
    .catch(error => {
        console.error("Authentication check failed:", error);
        window.location.href = '../user/auth/login/login.html';
    });

// ====== Event Listeners ======
menuToggle.addEventListener('click', () => document.getElementById('sidebar').classList.toggle('collapsed'));

closeDoctorModal.addEventListener('click', () => {
    doctorDetailsModal.style.display = 'none';
});

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const sectionId = link.getAttribute('data-section');
        contentSections.forEach(s => s.classList.add('hidden'));
        document.getElementById(sectionId).classList.remove('hidden');
        sectionTitle.textContent = link.querySelector('span').textContent;
    });
});

// ====== Data Loading Functions ======
async function loadPatientData(authUid) {
    showLoader("Loading your data...");
    try {
        const patientsRef = collection(db, "patients");
        const patientQuery = query(patientsRef, where("authUid", "==", authUid));
        const patientSnapshot = await getDocs(patientQuery);

        if (patientSnapshot.empty) {
            renderProfile({});
            renderUpcomingOperations(null);
            return;
        }

        const patientDoc = patientSnapshot.docs[0];
        const patientId = patientDoc.id;

        renderProfile(patientDoc.data());

        const schedulesRef = collection(db, "schedules");
        const upcomingOpsQuery = query(schedulesRef,
            where("patientId", "==", patientId),
            where("operationDateTime", ">=", Timestamp.now())
        );
        const upcomingOpsSnapshot = await getDocs(upcomingOpsQuery);
        renderUpcomingOperations(upcomingOpsSnapshot);

    } catch (error) {
        console.error("Error loading patient data:", error);
        alert("Could not load your data.");
    } finally {
        hideLoader();
    }
}

function renderProfile(data) {
    const profileDetails = document.getElementById('profile-details');
    if (!profileDetails) return;
    profileDetails.innerHTML = `
        <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Date of Birth:</strong> ${data.dob || 'N/A'}</p>
        <p><strong>Address:</strong> ${data.address || 'N/A'}</p>
    `;
}

function renderUpcomingOperations(snapshot) {
    const list = document.querySelector('#upcoming-operations-list tbody');
    if (!list) return;
    list.innerHTML = '';
    if (!snapshot || snapshot.empty) {
        list.innerHTML = '<tr><td colspan="5">You have no upcoming operations.</td></tr>';
        return;
    }
    snapshot.forEach(doc => {
        const data = doc.data();
        const opDate = data.operationDateTime.toDate();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${opDate.toLocaleDateString()}</td>
            <td>${opDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${data.operationType || 'N/A'}</td>
            <td><a href="#" class="doctor-link" data-doctor-id="${data.doctorId}">${data.doctorName || 'N/A'}</a></td>
            <td>${data.notes || ''}</td>
        `;
        list.appendChild(row);
    });

    // Add event listeners to the new doctor links
    document.querySelectorAll('.doctor-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const doctorId = e.target.getAttribute('data-doctor-id');
            showDoctorDetails(doctorId);
        });
    });
}

async function showDoctorDetails(doctorId) {
    if (!doctorId) return;
    showLoader("Fetching doctor details...");
    try {
        const doctorDocRef = doc(db, 'doctors', doctorId);
        const doctorDoc = await getDoc(doctorDocRef);

        if (doctorDoc.exists()) {
            const data = doctorDoc.data();
            doctorDetailsContent.innerHTML = `
                <p><strong>Name:</strong> ${data.name || 'N/A'}</p>
                <p><strong>Specialty:</strong> ${data.specialty || 'N/A'}</p>
                <p><strong>Email:</strong> ${data.email || 'N/A'}</p>
            `;
            doctorDetailsModal.style.display = 'flex';
        } else {
            alert("Doctor details not found.");
        }
    } catch (error) {
        console.error("Error fetching doctor details:", error);
        alert("Could not fetch doctor details.");
    } finally {
        hideLoader();
    }
}
