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

function updateActionButtons() {
    // Login button: only if password field is visible and not empty
    loginButton.style.display =
        passwordInput.style.display !== 'none' && passwordInput.value.trim().length > 0
            ? 'block'
            : 'none';

    // Sign up button: only if all signup fields are visible and filled
    signUpButton.style.display =
        firstNameInput.style.display !== 'none' &&
        firstNameInput.value.trim().length > 0 &&
        lastNameInput.value.trim().length > 0 &&
        signUpPasswordInput.value.trim().length > 0
            ? 'block'
            : 'none';
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

    const backButton = document.getElementById("backButton");
    const dropdown = document.getElementById('loginLanguageSelect');

    backButton.addEventListener("click", () => {
        // Clear email
        emailInput.value = "";

        // Hide everything except email input
        continueButton.style.display = "none";

        passwordInput.style.display = "none";
        loginButton.style.display = "none";

        firstNameInput.style.display = "none";
        lastNameInput.style.display = "none";
        signUpPasswordInput.style.display = "none";
        signUpButton.style.display = "none";

        backButton.style.display = "none";
    });

    if (dropdown) {
        // Set dropdown to previously selected language
        const savedLang = localStorage.getItem('language') || 'en';
        dropdown.value = savedLang;

        // When user changes language
        dropdown.addEventListener('change', (e) => {
            languageManager.loadLanguage(e.target.value);
        });
    }

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

            hideElement('firstNameInput');
            hideElement('lastNameInput');
            hideElement('signUpPasswordInput');
            hideElement('signUpButton');
            hideElement('backButton')
        } else {
            // New user → show sign up
            showElement('backButton')
            showElement('firstNameInput');
            showElement('lastNameInput');
            showElement('signUpPasswordInput');

            hideElement('passwordInput');
            hideElement('loginButton');
        }

        // Hide continue button
        hideElement('continueButton');
    });

    loginButton.addEventListener('click', () => {
    console.log("Logging in:", emailInput.value, passwordInput.value);
    // Here you can later add real authentication
    });

    signUpButton.addEventListener('click', () => {
        console.log("Signing up:", emailInput.value, firstNameInput.value, lastNameInput.value, signUpPasswordInput.value);
        // Here you can later add real signup logic
    });

    passwordInput.addEventListener('input', updateActionButtons);
    firstNameInput.addEventListener('input', updateActionButtons);
    lastNameInput.addEventListener('input', updateActionButtons);
    signUpPasswordInput.addEventListener('input', updateActionButtons);
});
