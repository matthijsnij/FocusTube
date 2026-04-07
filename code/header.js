// Dynamically loads header.html into the placeholder when the page is opened
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    const placeholder = document.getElementById('logo-placeholder');
    if (placeholder) {
      placeholder.innerHTML = data;
      const logoLink = document.getElementById('logoLink');
      if (logoLink) {
        logoLink.addEventListener('click', () => NProgress.start());
      }
    }
  })
  .catch(error => console.error('Error loading header:', error));
