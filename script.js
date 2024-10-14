const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.categoryButton');
const searchButton = document.getElementById('searchButton');
const clearButton = document.getElementById('clearButton');
const resultsDiv = document.getElementById('results');
let selectedCategory = null;
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        categoryButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        selectedCategory = button.getAttribute('data-category');
    });
});

searchButton.addEventListener('click', async () => {
    if (!selectedCategory || !searchInput.value.trim()) {
        alert('Veuillez sélectionner une catégorie et entrer un terme de recherche.');
        return;
    }
    logUserDetails();
    const response = await sendRequest('data/search', {
        terms: [searchInput.value.trim()],
        types: [selectedCategory],
        wildcard: false,
    });

    displayResults(response);
});
clearButton.addEventListener('click', () => {
    resultsDiv.innerHTML = '';
});

function displayResults(response) {
    resultsDiv.innerHTML = '';
    resultsDiv.innerHTML += '<h2>Search Results</h2>';
    resultsDiv.innerHTML += `<pre>${JSON.stringify(response, null, 2)}</pre>`;
}

async function sendRequest(url, body = false) {
    const options = {
        method: (body) ? 'POST' : 'GET',
        headers: {
            'Auth': 'sb0sl0hf866dmrtc4fkeatw7h8wlfo',
            'Content-Type': 'application/json',
        },
        body: (body) ? JSON.stringify(body) : null
    };
    const response = await fetch('https://api-experimental.snusbase.com/' + url, options);
    return await response.json();
}
