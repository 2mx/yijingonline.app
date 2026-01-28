document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    const acceptButton = document.getElementById('accept-cookies');

    if (!banner || !acceptButton) return;

    const hasConsented = localStorage.getItem('cookie-consent');

    if (hasConsented) {
        banner.classList.add('hidden');
    } else {
        banner.classList.remove('hidden');
    }

    const acceptConsent = () => {
        localStorage.setItem('cookie-consent', 'true');
        banner.classList.add('hidden');
    };

    acceptButton.addEventListener('click', (e) => {
        e.stopPropagation();
        acceptConsent();
    });

    // We removed the scroll and click-outside listeners to avoid premature dismissal.
    // The banner now stays until the "Accepter" button is clicked.
});
