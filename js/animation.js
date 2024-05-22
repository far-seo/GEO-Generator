document.addEventListener('DOMContentLoaded', function () {
    const resultArea = document.getElementById('result-area');
    resultArea.style.display = 'none'; // Initially hide the results area

    const form = document.getElementById('location-form');
    form.addEventListener('submit', function () {
        resultArea.style.display = 'block'; // Change to 'block' to make it visible
    });
});



