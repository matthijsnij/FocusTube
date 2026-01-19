import { supabase } from './supabaseClient.js';
import { ANON_KEY } from './supabaseClient.js';

// ================= HELPER FUNCTIONS =================

// Check if email exists
async function checkEmailExists(email) {
  try {
    const res = await fetch("https://tdnjzgzyliugcxtkbhrk.supabase.co/functions/v1/emailCheck", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "apikey": ANON_KEY, 
            "Authorization": `Bearer ${ANON_KEY}` // same anon key
        },
        body: JSON.stringify({ email })
    });

    const data = await res.json();
    return data.exists || false;

  } catch (err) {
    console.error("Email check failed:", err);
    return false;
  }
}

// Login via supabase
async function loginWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user };
}

// Signup via supabase
async function signUpWithPassword(email, password, firstName, lastName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://127.0.0.1:5500/code/emailConfirmed.html',
      data: {
        firstName: firstName,
        lastName: lastName
      }
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user };
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
    const loginPasswordError = document.getElementById('loginPasswordError');
    const signUpError = document.getElementById('signUpError');

    const recoverMessage = document.getElementById('recoverMessage');
    const sendResetEmailBtn = document.getElementById('sendResetEmailBtn'); 

    const loginInstruction = document.getElementById('loginInstruction');
    const emailLabelRow = document.getElementById('emailLabelRow');

    let currentMode = 'email';

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

   backButton.addEventListener('click', () => {
    // Hide all additional inputs/buttons
    hideElement('passwordInput');
    hideElement('loginButton');
    hideElement('firstNameInput');
    hideElement('lastNameInput');
    hideElement('signUpPasswordInput');
    hideElement('signUpButton');
    hideElement('recoverMessage');
    hideElement('sendResetEmailBtn');

    // show base UI
    showElement('loginInstruction');
    emailLabelRow.style.display = 'flex';

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
    signUpError.style.display = 'none';

    // Hide back button itself
    backButton.style.display = 'none';

    // Enable the email input again
    emailInput.classList.remove('frozen');
    // Reset focus
    emailInput.focus();

    currentMode = 'email';
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

        if (currentMode === 'email') {
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
                hideElement('signUpPasswordError');
                hideElement('signUpError');

                // Clear all other input fields
                passwordInput.value = '';
                firstNameInput.value = '';
                lastNameInput.value = '';
                signUpPasswordInput.value = '';
                emailError.style.display = 'none';
            }
        }
    });

    continueButton.addEventListener('click', async () => {
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            emailError.style.display = 'block'; 
            return;
        } else {
            emailError.style.display = 'none';
        }

        const exists = await checkEmailExists(email).catch(() => false);

        if (exists) {
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

    loginButton.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const result = await loginWithPassword(email, password);

        if (!result.success) {
            loginPasswordError.style.display = 'block';
            return;
        }

        const user = result.user;

        // Check if profile already exists
        const { data: profile, error: profileSelectError } = await supabase
            .from('focustube_profiles')
            .select('*')
            .eq('auth_id', user.id)
            .maybeSingle(); // returns null if no profile

        if (profileSelectError) {
            console.error("Error checking profile:", profileSelectError.message);
        }

        if (!profile) {
            // Extract first/last name from user_metadata
            const firstName = user.user_metadata?.firstName || '';
            const lastName = user.user_metadata?.lastName || '';

            // Create profile now that user is confirmed/logged in
            const { error: profileInsertError } = await supabase
                .from('focustube_profiles')
                .insert([{
                    auth_id: user.id,
                    email: user.email,
                    firstName: firstName,
                    lastName: lastName
                }]);

            if (profileInsertError) {
                console.error("Profile creation failed:", profileInsertError.message);
            } else {
                console.log("Profile created successfully!");
            }
        }

        // Succesful login; go to index.html
        window.location.href = 'index.html';
    });

    signUpButton.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = signUpPasswordInput.value.trim();
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();

        // Check password length
        if (password.length < 8) {
            signUpPasswordError.style.display = 'block';
            return; // stop here, do not submit
        } else {
            signUpPasswordError.style.display = 'none';
        }

        // If valid, continue with signup 
        const result = await signUpWithPassword(
            email,
            password,
            firstName,
            lastName
        );

        if (!result.success) {
            signUpError.style.display = 'block';
            return;
        }

        // Hide all input fields and buttons
        const fieldsToHide = [
            emailInput,
            continueButton,
            passwordInput,
            loginButton,
            firstNameInput,
            lastNameInput,
            signUpPasswordInput,
            signUpButton,
            backButton,
            emailError,
            loginPasswordError,
            signUpPasswordError,
            signUpError,
            document.querySelector('.login-instruction'), 
            document.querySelector('.email-label-row')   
        ];

        fieldsToHide.forEach(el => el.style.display = 'none');

        document.getElementById("confirmEmailMessage1").style.display = "block";
        document.getElementById("confirmEmailMessage2").style.display = "block";
    });

    document.getElementById("goToLoginButton").addEventListener("click", () => {
        window.location.href = "login.html";
    });

    document.querySelector('.forgot-password').addEventListener('click', () => {
        currentMode = 'forgot';

        // Hide everything else
        hideElement('continueButton');
        hideElement('passwordInput');
        hideElement('loginButton');
        hideElement('firstNameInput');
        hideElement('lastNameInput');
        hideElement('signUpPasswordInput');
        hideElement('signUpButton');
        hideElement('loginPasswordError');
        hideElement('signUpPasswordError');
        hideElement('signUpError');
        hideElement('confirmEmailMessage1');
        hideElement('confirmEmailMessage2');
        hideElement('goToLoginButton');
        hideElement('loginInstruction');
        hideElement('emailLabelRow');

        // Show back button
        showElement('backButton');

        // Show recover message & send reset button
        showElement('recoverMessage');
        showElement('sendResetEmailBtn');

        // Focus email input
        emailInput.classList.remove('frozen');
        emailInput.value = '';
        emailInput.focus();
    });

    sendResetEmailBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            emailError.style.display = 'block'; 
            return;
        } else {
            emailError.style.display = 'none';
        }

        const exists = await checkEmailExists(email).catch(() => false);

        if (exists) {
            // Remove error if it is there
            emailError.style.display = 'none';
        } else {
            // Show error
            emailError.style.display = 'block';
            return; 
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://127.0.0.1:5500/code/resetPassword.html'
        });

        if (error) {
            console.error('Password reset failed:', error.message);
            alert('Failed to send reset email. Check console.');
            return;
        }

        alert('Password reset email sent! Check your inbox.');

        // Optionally hide the send button to prevent duplicate clicks
        hideElement('sendResetEmailBtn');
    });


    passwordInput.addEventListener('input', updateActionButtons);
    firstNameInput.addEventListener('input', updateActionButtons);
    lastNameInput.addEventListener('input', updateActionButtons);
    signUpPasswordInput.addEventListener('input', updateActionButtons);
});
