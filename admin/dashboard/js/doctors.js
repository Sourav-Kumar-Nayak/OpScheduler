// js/doctors.js

// ====== Imports ======
import { db, showLoader, hideLoader,collection,
    getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp  } from '../../../config/firebase.js';


// ====== DOM Elements ======
const doctorForm = document.getElementById('doctorForm');
const doctorFormElement = document.getElementById('doctorFormElement');
const doctorFormTitle = document.getElementById('doctorFormTitle');
const doctorsTableBody = document.getElementById('doctorsTableBody');
const addDoctorBtn = document.getElementById('addDoctorBtn');
const cancelDoctorFormBtn = document.getElementById('cancelDoctorForm');

// ====== State ======
let isInitialized = false;

// ====== Core Functions ======

/**
 * Initializes the doctor management section.
 * Sets up event listeners and performs the initial data load.
 */
export function initDoctors() {
    if (isInitialized) return; // Prevent re-initializing

    addDoctorBtn.addEventListener('click', setupFormForCreate);
    cancelDoctorFormBtn.addEventListener('click', hideForm);
    doctorFormElement.addEventListener('submit', handleDoctorFormSubmit);

    loadDoctors();
    isInitialized = true;
}

/**
 * Fetches all doctor documents from Firestore and renders them in the table.
 */
async function loadDoctors() {
    showLoader("Loading doctors...");
    doctorsTableBody.innerHTML = ''; // Clear existing table data
    try {
        const doctorsCollection = collection(db, "doctors");
        const querySnapshot = await getDocs(doctorsCollection);
        if (querySnapshot.empty) {
            doctorsTableBody.innerHTML = '<tr><td colspan="4">No doctors found.</td></tr>';
        } else {
            querySnapshot.forEach(doc => {
                renderDoctorRow(doc.id, doc.data());
            });
        }
    } catch (error) {
        console.error("Error loading doctors:", error);
        doctorsTableBody.innerHTML = '<tr><td colspan="4">Error loading data. Check console and Firebase config.</td></tr>';
    } finally {
        hideLoader();
    }
}

/**
 * Renders a single doctor's data as a row in the HTML table.
 * @param {string} id - The Firestore document ID for the doctor.
 * @param {object} data - The data object for the doctor.
 */
function renderDoctorRow(id, data) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', id);
    row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${data.specialty || 'N/A'}</td>
        <td>${data.phone || 'N/A'}</td>
        <td class="actions">
            <button class="btn btn-secondary btn-sm edit-btn" title="Edit"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn btn-danger btn-sm delete-btn" title="Delete"><i class="bi bi-trash-fill"></i></button>
        </td>
    `;

    // Attach event listeners for edit and delete buttons
    row.querySelector('.edit-btn').addEventListener('click', () => setupFormForEdit(id, data));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteDoctor(id));

    doctorsTableBody.appendChild(row);
}

/**
 * Handles the submission of the add/edit doctor form.
 * @param {Event} e - The form submission event.
 */
async function handleDoctorFormSubmit(e) {
    e.preventDefault();
    showLoader("Saving doctor...");

    const doctorId = document.getElementById('doctorId').value;
    const doctorData = {
        name: document.getElementById('doctorName').value,
        email: document.getElementById('doctorEmail').value,
        phone: document.getElementById('doctorPhone').value,
        specialty: document.getElementById('doctorSpecialty').value,
        updatedAt: serverTimestamp()
    };

    try {
        if (doctorId) {
            // Update existing document
            await updateDoc(doc(db, "doctors", doctorId), doctorData);
        } else {
            // Create new document
            doctorData.createdAt = serverTimestamp();
            await addDoc(collection(db, "doctors"), doctorData);
        }
        hideForm();
        loadDoctors(); // Refresh the table
    } catch (error) {
        console.error("Error saving doctor:", error);
        alert("Failed to save doctor. Please check the console for details.");
    } finally {
        hideLoader();
    }
}

/**
 * Deletes a doctor document from Firestore after user confirmation.
 * @param {string} id - The ID of the doctor document to delete.
 */
async function deleteDoctor(id) {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
        return;
    }
    showLoader("Deleting doctor...");
    try {
        await deleteDoc(doc(db, "doctors", id));
        loadDoctors(); // Refresh the table
    } catch (error) {
        console.error("Error deleting doctor:", error);
        alert("Failed to delete doctor.");
    } finally {
        hideLoader();
    }
}

// ====== UI Helper Functions ======

/**
 * Resets and displays the form for creating a new doctor.
 */
function setupFormForCreate() {
    doctorFormElement.reset();
    doctorForm.querySelector('#doctorId').value = '';
    doctorFormTitle.textContent = 'Add New Doctor';
    doctorForm.classList.remove('hidden');
}

/**
 * Fills and displays the form for editing an existing doctor.
 * @param {string} id - The Firestore document ID of the doctor.
 * @param {object} data - The data of the doctor to be edited.
 */
function setupFormForEdit(id, data) {
    doctorFormTitle.textContent = 'Edit Doctor';
    document.getElementById('doctorId').value = id;
    document.getElementById('doctorName').value = data.name;
    document.getElementById('doctorEmail').value = data.email;
    document.getElementById('doctorPhone').value = data.phone;
    document.getElementById('doctorSpecialty').value = data.specialty;
    doctorForm.classList.remove('hidden');
}

/**
 * Hides the doctor form and resets it.
 */
function hideForm() {
    doctorForm.classList.add('hidden');
    doctorFormElement.reset();
}
