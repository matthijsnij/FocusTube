// ================= MOCK DATABASE =================
const mockUsers = [
    { email: "matta@gmail.com", password: "matta" }
];

// ================= HELPER FUNCTIONS =================

// Check if email exists
function emailExists(email) {
    return mockUsers.some(user => user.email === email);
}

// Show/hide elements helper
function showElement(id) {
    document.getElementById(id).style.display = 'block';
}

function hideElement(id) {
    document.getElementById(id).style.display = 'none';
}


document.addEventListener('DOMContentLoaded', () => {
    // ================= ELEMENTS =================
    const emailInput = document.getElementById('emailInput');
    const continueButton = document.getElementById('continueButton');

    const passwordInput = document.getElementById('passwordInput');
    const loginButton = document.getElementById('loginButton');

    const firstNameInput = document.getElementById('firstNameInput');
    const lastNameInput = document.getElementById('lastNameInput');
    const signUpPasswordInput = document.getElementById('signUpPasswordInput');
    const signUpButton = document.getElementById('signUpButton');

    emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();

    if (email.length > 0) {
        // Show continue button if at least one character
        showElement('continueButton');
    } else {
        // Hide all other inputs/buttons
        hideElement('continueButton');
        hideElement('passwordInput');
        hideElement('loginButton');
        hideElement('firstNameInput');
        hideElement('lastNameInput');
        hideElement('signUpPasswordInput');
        hideElement('signUpButton');

        // Clear all other input fields
        passwordInput.value = '';
        firstNameInput.value = '';
        lastNameInput.value = '';
        signUpPasswordInput.value = '';
    }
    });

    continueButton.addEventListener('click', () => {
        const email = emailInput.value.trim();

        if (emailExists(email)) {
            // Existing user → show login
            showElement('passwordInput');
            showElement('loginButton');

            hideElement('firstNameInput');
            hideElement('lastNameInput');
            hideElement('signUpPasswordInput');
            hideElement('signUpButton');
        } else {
            // New user → show sign up
            showElement('firstNameInput');
            showElement('lastNameInput');
            showElement('signUpPasswordInput');
            showElement('signUpButton');

            hideElement('passwordInput');
            hideElement('loginButton');
        }

        // Hide continue button
        hideElement('continueButton');
    });
});
