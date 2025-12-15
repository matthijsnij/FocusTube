// ================= MOCK DATABASE =================
const mockUsers = [
    { email: "matta@gmail.com", password: "matta", firstName: "Matthijs", lastName: "Nijeboer"}
];

// ================= HELPER FUNCTIONS =================

// Check if email exists
function emailExists(email) {
    return mockUsers.some(user => user.email === email);
}

function isValidEmail(email) {
    // Simple regex for basic validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    const emailError = document.getElementById('emailError');
    const signUpPasswordError = document.getElementById('signUpPasswordError');

   backButton.addEventListener('click', () => {
    // Hide all additional inputs/buttons
    passwordInput.style.display = 'none';
    loginButton.style.display = 'none';
    firstNameInput.style.display = 'none';
    lastNameInput.style.display = 'none';
    signUpPasswordInput.style.display = 'none';
    signUpButton.style.display = 'none';
    
    // Clear all values
    emailInput.value = '';
    passwordInput.value = '';
    firstNameInput.value = '';
    lastNameInput.value = '';
    signUpPasswordInput.value = '';

    // Hide error messages
    emailError.style.display = 'none';
    signUpPasswordError.style.display = 'none';
    loginPasswordError.style.display = 'none';

    // Hide back button itself
    backButton.style.display = 'none';

    // Enable the email input again
    emailInput.classList.remove('frozen');
    emailInput.value = '';
    // Reset focus
    emailInput.focus();
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
        hideElement('loginPasswordError');
        hideElement('signupPasswordError');

        // Clear all other input fields
        passwordInput.value = '';
        firstNameInput.value = '';
        lastNameInput.value = '';
        signUpPasswordInput.value = '';
        emailError.style.display = 'none';
    }
    });

    continueButton.addEventListener('click', () => {
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            emailError.style.display = 'inline';
            return;
        } else {
            emailError.style.display = 'none';
        }


        if (emailExists(email)) {
            // Existing user → show login
            showElement('backButton')
            showElement('passwordInput');

            hideElement('firstNameInput');
            hideElement('lastNameInput');
            hideElement('signUpPasswordInput');
            hideElement('signUpButton');
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
        emailInput.classList.add('frozen');
    });

    loginButton.addEventListener('click', () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const user = mockUsers.find(u => u.email === email);

        if (user.password !== password) {
            loginPasswordError.style.display = 'block';
            return;
        }

        // Succesful login; go to index.html
        console.log("Logging in")
    });

    signUpButton.addEventListener('click', () => {
        console.log("Signing up:", emailInput.value, firstNameInput.value, lastNameInput.value, signUpPasswordInput.value);
        // Here you can later add real signup logic
    });

    passwordInput.addEventListener('input', updateActionButtons);
    firstNameInput.addEventListener('input', updateActionButtons);
    lastNameInput.addEventListener('input', updateActionButtons);
    signUpPasswordInput.addEventListener('input', updateActionButtons);

    signUpButton.addEventListener('click', () => {
        const password = signUpPasswordInput.value.trim();

        // Check password length
        if (password.length < 8) {
            signUpPasswordError.style.display = 'block';
            return; // stop here, do not submit
        } else {
            signUpPasswordError.style.display = 'none';
        }

        // If valid, continue with signup (mock or database call)
        console.log('Signing up user...');
    });
});
