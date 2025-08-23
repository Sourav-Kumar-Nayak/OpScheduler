// js/schedule.js

// ====== Imports ======
import { db, showLoader, hideLoader, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp  } from '../../../config/firebase.js';


// ====== DOM Elements ======
const scheduleForm = document.getElementById('scheduleForm');
const scheduleFormElement = document.getElementById('scheduleFormElement');
const scheduleFormTitle = document.getElementById('scheduleFormTitle');
const scheduleTableBody = document.getElementById('scheduleTableBody');
const addScheduleBtn = document.getElementById('addScheduleBtn');
const cancelScheduleFormBtn = document.getElementById('cancelScheduleForm');

// ====== State ======
let isInitialized = false;


export function initSchedule() {
    if (isInitialized) return;

    addScheduleBtn.addEventListener('click', setupFormForCreate);
    cancelScheduleFormBtn.addEventListener('click', hideForm);
    scheduleFormElement.addEventListener('submit', handleScheduleFormSubmit);

    loadSchedules();
    isInitialized = true;
}

/**
 * Fetches and displays all operation schedules from Firestore.
 */
async function loadSchedules() {
    showLoader("Loading schedule...");
    scheduleTableBody.innerHTML = '';
    try {
        const schedulesCollection = collection(db, "schedules");
        const querySnapshot = await getDocs(schedulesCollection);
        if (querySnapshot.empty) {
            scheduleTableBody.innerHTML = '<tr><td colspan="6">No operations scheduled.</td></tr>';
        } else {
            const schedules = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by operation date, newest first
            schedules.sort((a, b) => b.operationDateTime.toMillis() - a.operationDateTime.toMillis());
            schedules.forEach(schedule => renderScheduleRow(schedule.id, schedule));
        }
    } catch (error) {
        console.error("Error loading schedules:", error);
        scheduleTableBody.innerHTML = '<tr><td colspan="6">Error loading data.</td></tr>';
    } finally {
        hideLoader();
    }
}

/**
 * Renders a single schedule as a row in the table.
 * @param {string} id - The Firestore document ID.
 * @param {object} data - The schedule data.
 */
function renderScheduleRow(id, data) {
    const row = document.createElement('tr');
    const operationDate = data.operationDateTime.toDate();
    const formattedDate = operationDate.toLocaleDateString();
    const formattedTime = operationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    row.setAttribute('data-id', id);
    row.innerHTML = `
        <td>${data.patientName || 'N/A'}</td>
        <td>${data.doctorName || 'N/A'}</td>
        <td>${data.operationType || 'N/A'}</td>
        <td>${formattedDate}</td>
        <td>${formattedTime}</td>
        <td class="actions">
            <button class="btn btn-secondary btn-sm edit-btn" title="Edit"><i class="bi bi-pencil-fill"></i></button>
            <button class="btn btn-danger btn-sm delete-btn" title="Delete"><i class="bi bi-trash-fill"></i></button>
        </td>
    `;

    row.querySelector('.edit-btn').addEventListener('click', () => setupFormForEdit(id, data));
    row.querySelector('.delete-btn').addEventListener('click', () => deleteSchedule(id));
    scheduleTableBody.appendChild(row);
}

/**
 * Handles the submission of the schedule form for creating or updating an operation.
 * @param {Event} e - The form submission event.
 */
async function handleScheduleFormSubmit(e) {
    e.preventDefault();
    showLoader("Saving schedule...");

    const scheduleId = document.getElementById('scheduleId').value;
    const date = document.getElementById('operationDate').value;
    const time = document.getElementById('operationTime').value;
    const dateTime = new Date(`${date}T${time}`);

    const doctorSelect = document.getElementById('doctorSelect');
    const patientSelect = document.getElementById('patientSelect');

    const scheduleData = {
        patientId: patientSelect.value,
        patientName: patientSelect.options[patientSelect.selectedIndex].text,
        doctorId: doctorSelect.value,
        doctorName: doctorSelect.options[doctorSelect.selectedIndex].text,
        operationType: document.getElementById('operationType').value,
        operationDateTime: Timestamp.fromDate(dateTime),
        notes: document.getElementById('operationNotes').value,
        updatedAt: serverTimestamp()
    };

    try {
        if (scheduleId) {
            await updateDoc(doc(db, "schedules", scheduleId), scheduleData);
        } else {
            scheduleData.createdAt = serverTimestamp();
            await addDoc(collection(db, "schedules"), scheduleData);
        }
        hideForm();
        loadSchedules();
    } catch (error) {
        console.error("Error saving schedule:", error);
        alert("Failed to save schedule.");
    } finally {
        hideLoader();
    }
}

/**
 * Deletes a schedule from Firestore.
 * @param {string} id - The ID of the schedule document to delete.
 */
async function deleteSchedule(id) {
    if (!confirm('Are you sure you want to cancel this operation?')) return;
    showLoader("Canceling operation...");
    try {
        await deleteDoc(doc(db, "schedules", id));
        loadSchedules();
    } catch (error) {
        console.error("Error deleting schedule:", error);
        alert("Failed to cancel operation.");
    } finally {
        hideLoader();
    }
}

// ====== UI Helper Functions ======

/**
 * Sets up and displays the form for creating a new schedule.
 */
async function setupFormForCreate() {
    scheduleFormElement.reset();
    document.getElementById('scheduleId').value = '';
    scheduleFormTitle.textContent = 'Schedule New Operation';

    showLoader("Loading form data...");
    try {
        await populateDoctorsDropdown();
        await populatePatientsDropdown();
        scheduleForm.classList.remove('hidden');
    } catch (error) {
        alert("Failed to load necessary data for the form.");
        console.error(error);
    } finally {
        hideLoader();
    }
}

/**
 * Sets up and displays the form for editing an existing schedule.
 * @param {string} id - The document ID of the schedule to edit.
 * @param {object} data - The data of the schedule.
 */
async function setupFormForEdit(id, data) {
    scheduleFormElement.reset();
    scheduleFormTitle.textContent = 'Edit Operation Schedule';

    showLoader("Loading form data...");
    try {
        await populateDoctorsDropdown(data.doctorId);
        await populatePatientsDropdown(data.patientId);

        const operationDate = data.operationDateTime.toDate();
        const dateString = operationDate.toISOString().split('T')[0];
        const timeString = operationDate.toTimeString().split(' ')[0].substring(0, 5);

        document.getElementById('scheduleId').value = id;
        document.getElementById('operationType').value = data.operationType;
        document.getElementById('operationDate').value = dateString;
        document.getElementById('operationTime').value = timeString;
        document.getElementById('operationNotes').value = data.notes;

        scheduleForm.classList.remove('hidden');
    } catch (error) {
        alert("Failed to load necessary data for the form.");
        console.error(error);
    } finally {
        hideLoader();
    }
}

/**
 * Hides and resets the schedule form.
 */
function hideForm() {
    scheduleForm.classList.add('hidden');
    scheduleFormElement.reset();
}

/**
 * Fetches doctors from Firestore and populates the doctors dropdown.
 * @param {string} [selectedId] - Optional ID of the doctor to pre-select.
 */
async function populateDoctorsDropdown(selectedId) {
    const select = document.getElementById('doctorSelect');
    select.innerHTML = '<option value="">Select a Doctor</option>';
    const doctorsSnapshot = await getDocs(collection(db, "doctors"));
    doctorsSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        if (doc.id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

/**
 * Fetches patients from Firestore and populates the patients dropdown.
 * @param {string} [selectedId] - Optional ID of the patient to pre-select.
 */
async function populatePatientsDropdown(selectedId) {
    const select = document.getElementById('patientSelect');
    select.innerHTML = '<option value="">Select a Patient</option>';
    const patientsSnapshot = await getDocs(collection(db, "patients"));
    patientsSnapshot.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name;
        if (doc.id === selectedId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}
