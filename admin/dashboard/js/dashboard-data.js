// js/dashboard-data.js

// ====== Imports ======
import { db, showLoader, hideLoader, collection, getDocs, query, where, Timestamp } from '../../../config/firebase.js';


export async function initDashboard() {
    showLoader("Loading dashboard data...");
    try {
        // Get references to the DOM elements that will display the data
        const todaysOpsEl = document.getElementById('todays-operations');
        const upcomingOpsEl = document.getElementById('upcoming-operations');
        const availableDoctorsEl = document.getElementById('available-doctors');

        // 1. Fetch Today's Operations
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));

        // FIX: Query the "schedules" collection and use the "operationDateTime" field
        const operationsRef = collection(db, "schedules");
        const todayOpsQuery = query(operationsRef,
            where("operationDateTime", ">=", Timestamp.fromDate(startOfToday)),
            where("operationDateTime", "<=", Timestamp.fromDate(endOfToday))
        );
        const todayOpsSnapshot = await getDocs(todayOpsQuery);
        todaysOpsEl.textContent = todayOpsSnapshot.size;

        // 2. Fetch Upcoming Operations
        // FIX: Use the "operationDateTime" field for the query
        const upcomingOpsQuery = query(operationsRef, where("operationDateTime", ">", Timestamp.fromDate(endOfToday)));
        const upcomingOpsSnapshot = await getDocs(upcomingOpsQuery);
        upcomingOpsEl.textContent = upcomingOpsSnapshot.size;

        // 3. Fetch Total Doctors
        const doctorsRef = collection(db, "doctors");
        const doctorsSnapshot = await getDocs(doctorsRef);
        availableDoctorsEl.textContent = doctorsSnapshot.size;

    } catch (error) {
        console.error("Error loading dashboard data:", error);
        alert("Could not load dashboard data. Please check the console for errors.");
    } finally {
        hideLoader();
    }
}
