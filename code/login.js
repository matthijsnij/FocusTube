const supabase = window.supabase;

// ================= HELPER FUNCTIONS =================

// Check if email exists
async function checkEmailExists(email) {
  const { data, error } = await supabase
    .from('focustube-profiles')
    .select('id')
    .eq('email', email)
    .single();

    if (error && error.code !== 'PGRST116') { // 116 = no rows
    console.error("Supabase error:", error);
  }

  return !!data; // true if exists, false if not
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
      data: {
        first_name: firstName,
        last_name: lastName
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
    const loginPasswordError = document.getElementById('loginPasswordError');
    const signUpError = document.getElementById('signUpError');

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
    signUpError.style.display = 'none';

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
        hideElement('signUpPasswordError');
        hideElement('signUpError');

        // Clear all other input fields
        passwordInput.value = '';
        firstNameInput.value = '';
        lastNameInput.value = '';
        signUpPasswordInput.value = '';
        emailError.style.display = 'none';
    }
    });

    continueButton.addEventListener('click', async () => {
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            emailError.style.display = 'inline'; // NOTE check why here it is inline, others its block
            return;
        } else {
            emailError.style.display = 'none';
        }

        console.log("supabase object:", supabase);
        console.log("supabase.from type:", typeof supabase.from);

        const exists = await checkEmailExists(email);

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

        // Succesful login; go to index.html
        console.log("Logging in: ", result.user)
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

        user = result.user;

        // Add first and last name to profile table
        const { data: profileData, error: profileError } = await supabase
        .from('focustube-profiles')
        .insert([{ id: user.id, email, firstName, lastName }]);

        if (profileError) {
            alert('Profile creation failed: ' + profileError.message);
            return;
        }

        // To index.html
        console.log("Signing up:", email, firstName, lastName, password);
        window.location.href = 'index.html';
    });

    passwordInput.addEventListener('input', updateActionButtons);
    firstNameInput.addEventListener('input', updateActionButtons);
    lastNameInput.addEventListener('input', updateActionButtons);
    signUpPasswordInput.addEventListener('input', updateActionButtons);
});
