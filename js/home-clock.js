// for clock in home-widget.html
function updateClock() {
    const now = new Date();
    const options = {
        weekday: 'short', year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    const lang = document.documentElement.lang || 'en'; // fallback
    document.getElementById('clock').textContent =
        now.toLocaleString(lang, options);
}

setInterval(updateClock, 1000);
updateClock();
