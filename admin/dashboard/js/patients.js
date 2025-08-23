// js/patients.js

// ====== Imports ======
import { db,collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, showLoader, hideLoader, } from '../../../config/firebase.js';

// ====== DOM Elements ======
const patientForm = document.getElementById('patientForm');
const patientFormElement = document.getElementById('patientFormElement');
const patientFormTitle = document.getElementById('patientFormTitle');
const patientsTableBody = document.getElementById('patientsTableBody');
const addPatientBtn = document.getElementById('addPatientBtn');
const cancelPatientFormBtn = document.getElementById('cancelPatientForm');


let isInitialized = false;

export function initPatients() {
    if (isInitialized) return;

    addPatientBtn.addEventListener('click', setupFormForCreate);
    cancelPatientFormBtn.addEventListener('click', hideForm);
    patientFormElement.addEventListener('submit', handlePatientFormSubmit);

    loadPatients();
    isInitialized = true;
}

/**
 * Fetches and displays all patient records from Firestore.
 */
async function loadPatients() {
    showLoader("Loading patients...");
    patientsTableBody.innerHTML = '';
    try {
        const patientsCollection = collection(db, "patients");
        const querySnapshot = await getDocs(patientsCollection);
        if (querySnapshot.empty) {
            patientsTableBody.innerHTML = '<tr><td colspan="5">No patients found.</td></tr>';
        } else {
            querySnapshot.forEach(doc => {
                renderPatientRow(doc.id, doc.data());
            });
        }
    } catch (error) {
        console.error("Error loading patients:", error);
        patientsTableBody.innerHTML = '<tr><td colspan="5">Error loading data.</td></tr>';
    } finally {
        hideLoader();
    }
}

/**
 * Renders a single patient's data as a row in the table.
 * @param {string} id - The Firestore document ID.
 * @param {object} data - The patient data.
 */
function renderPatientRow(id, data) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', id);
    // Calculate age from DOB
    const age = data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : 'N/A';

    row.innerHTML = `
        <td>${data.name || 'N/A'}</td>
        <td>${age}</td>
        <td>${data.phone || 'N/A'}</td>
        <td>${data.address || 'N/A'}</td>
        <td class="actions">
            <button class="btn btn-secondary btn-sm edit-btn" title="Edit"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn btn-danger btn-sm delete-btn" title="Delete"><i class="bi bi-trash-fill"></i></button>
        </td>
    `;

    row.querySelector('.edit-btn').addEventListener('click', () => setupFormForEdit(id, data));
    row.querySelector('.delete-btn').addEventListener('click', () => deletePatient(id));
    patientsTableBody.appendChild(row);
}

/**
 * Handles the submission of the patient form.
 * @param {Event} e - The form submission event.
 */
async function handlePatientFormSubmit(e) {
    e.preventDefault();
    showLoader("Saving patient...");

    const patientId = document.getElementById('patientId').value;
    const patientData = {
        name: document.getElementById('patientName').value,
        email: document.getElementById('patientEmail').value,
        phone: document.getElementById('patientPhone').value,
        dob: document.getElementById('patientDob').value,
        address: document.getElementById('patientAddress').value,
        updatedAt: serverTimestamp()
    };

    try {
        if (patientId) {
            await updateDoc(doc(db, "patients", patientId), patientData);
        } else {
            patientData.createdAt = serverTimestamp();
            await addDoc(collection(db, "patients"), patientData);
        }
        hideForm();
        loadPatients();
    } catch (error) {
        console.error("Error saving patient:", error);
        alert("Failed to save patient.");
    } finally {
        hideLoader();
    }
}

/**
 * Deletes a patient record from Firestore.
 * @param {string} id - The ID of the patient document to delete.
 */
async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient record?')) return;
    showLoader("Deleting patient...");
    try {
        await deleteDoc(doc(db, "patients", id));
        loadPatients();
    } catch (error) {
        console.error("Error deleting patient:", error);
        alert("Failed to delete patient.");
    } finally {
        hideLoader();
    }
}

// ====== UI Helper Functions ======

/**
 * Sets up and displays the form for creating a new patient.
 */
function setupFormForCreate() {
    patientFormElement.reset();
    document.getElementById('patientId').value = '';
    patientFormTitle.textContent = 'Add New Patient';
    patientForm.classList.remove('hidden');
}


function setupFormForEdit(id, data) {
    patientFormElement.reset();
    patientFormTitle.textContent = 'Edit Patient Details';

    document.getElementById('patientId').value = id;
    document.getElementById('patientName').value = data.name;
    document.getElementById('patientEmail').value = data.email;
    document.getElementById('patientPhone').value = data.phone;
    document.getElementById('patientDob').value = data.dob;
    document.getElementById('patientAddress').value = data.address;

    patientForm.classList.remove('hidden');
}

/**
 * Hides and resets the patient form.
 */
function hideForm() {
    patientForm.classList.add('hidden');
    patientFormElement.reset();
}
