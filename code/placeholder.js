const placeholder = (() => {
    let typingTimeout;  // stores the ID of the current timeout for typewriter animation
    let currentIndex = 0; // tracks the current suggestion being typed
    let charIndex = 0;    // tracks the current character position in the suggestion
    let suggestions = []; // array of suggestions in the current language

    // Core typewriter function: types out the current suggestion character by character
    function typePlaceholder(searchInput) {
        const currentText = suggestions[currentIndex];
        searchInput.placeholder = currentText.slice(0, charIndex + 1); // update placeholder with next character
        charIndex++;

        if (charIndex < currentText.length) {
            // schedule next character
            typingTimeout = setTimeout(() => typePlaceholder(searchInput), 50);
        } else {
            // after finishing a suggestion, pause then move to next
            typingTimeout = setTimeout(() => {
                charIndex = 0;
                currentIndex = (currentIndex + 1) % suggestions.length; // loop back at end
                typePlaceholder(searchInput);
            }, 5000); // 5-second pause at full suggestion
        }
    }

    // Public function to refresh the suggestions array and restart the typewriter
    function refreshSuggestions() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return; // exit if input not found

        // Don't override custom placeholder when in channel mode
        if (new URLSearchParams(window.location.search).get('channelId')) return;

        // fetch suggestions in current language from languageManager
        suggestions = languageManager.getTranslation("suggestions") || [];

        clearTimeout(typingTimeout); // stop any ongoing typing
        currentIndex = Math.floor(Math.random() * suggestions.length); // start at random suggestion
        charIndex = 0;

        if (suggestions.length > 0) {
            typePlaceholder(searchInput); // start typing animation
        }
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        refreshSuggestions();

        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // pause typing when user focuses input
        searchInput.addEventListener('focus', () => clearTimeout(typingTimeout));
        // resume typing when input loses focus
        searchInput.addEventListener('blur', () => refreshSuggestions());

        document.addEventListener('languageChanged', () => {
            refreshSuggestions();
        });
    });

    // expose only the refreshSuggestions function publicly
    return { refreshSuggestions };
})();



