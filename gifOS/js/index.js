const API_KEY = 'KL15HIYDgw5jAPCqW0b1eh4El9QJy8wk';

const computeSearchUrl = query => 
    `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY}&q=${query}`;

const computeRelatedSearchUrl = term => 
    `https://api.giphy.com/v1/tags/related/${term}?api_key=${API_KEY}`;

const computeTrendingsUrl = (offset, limit) => 
    `https://api.giphy.com/v1/gifs/trending?api_key=${API_KEY}&offset=${offset}&limit=${limit}`;

const computeSuggestionsUrl = _ => 
    `https://api.giphy.com/v1/gifs/random?api_key=${API_KEY}`;

const computeAutocompleteUrl = query => 
    `https://api.giphy.com/v1/gifs/search/tags?api_key=${API_KEY}&q=${query}`;

const extractGifInformation = payload => 
    payload.map(gif => ({
        url: gif.images.preview_gif.url,
        title: gif.title,
        tags: gif.title.split(' ')
    }));

const extractSingleGifPreview = payload => payload.images.preview_gif.url;

let tendenciesOffset = 25;

window.addEventListener('scroll', e => {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        loadTendencies(tendenciesOffset, 25)
            .then(() => tendenciesOffset += 25);
    }
});

const checkResponseStatus = response => {
    if (!response.ok) {
        throw new Error(`An unexpected error has occurred: ${response.status} (${response.statusText})`);
    }
    return response;
} 

const isVisible = id => document.getElementById(id).classList.contains("visible");

const toggleVisibility = id => {
    const element = document.getElementById(id);
    element.classList.toggle("hidden");
    element.classList.toggle("visible");
};

const truncate = (str, maxChars) => 
    (str.length > maxChars) ? str.substring(0, maxChars) + '...' : str;

const buildGifSuggestionsHtml = (url, title) => 
    `<div class="box suggestions-box">
        <div class="box-header light-box-header">
            <h2 class="box-header-text">#${truncate(title.replace(/ /g, ""), 30)}</h2> 
            <a href="#" class="close-current-gif">
                <i class="cross-icon"></i> 
            </a>
        </div>
        <a href="#" data-search="${title}" class="third-button related-search-trigger">Ver más…</a>
        <div class="suggestions-img">
            <img src="${url}"/>
        </div>
    </div>`;

const buildGifHtml = url => 
    `<div class="box"><img src="${url}"/></div>`;

const buildGifTendenciesHtml = (url, title, tags) => 
    `<div class="box tendencies-box">
        <a href="#" data-search="${title}" class="related-search-trigger">
            <img src="${url}"/>
            <div class="box-footer">
                <h2 class="box-header-text">${tags.reduceRight((tag, acc) => acc = `#${acc} ${tag}`,'').trim()}</h2>
            </div>
        </a>
    </div>`;

const putElementsInGrid = (gridId, elements) => {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    grid.innerHTML += elements.reduce((acc, element) => acc + element, '');
}

const appendElementInGrid = (gridId, element) => {
    const grid = document.getElementById(gridId);
    grid.innerHTML += element;
}

// Search form
const searchForm = document.getElementById('search_form');
searchForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const query = document.getElementById('search-input').value;
    
    search(query);
});

const search = query => {
    const searchSuggestionsContainer = document.getElementById('search-suggestions-container');

    const searchQueryContainer = document.getElementById('search-query-container');

    if (isVisible('suggestions-container') && isVisible('tendencies-container')) {
        toggleVisibility('suggestions-container');
        toggleVisibility('tendencies-container');
    }

    if (!isVisible('search-result-container')) {
        toggleVisibility('search-result-container');
    }

    if(query !== null) {
        fetch(computeSearchUrl(query))
            .then(rawResponse => checkResponseStatus(rawResponse))
            .then(rawResponse => rawResponse.json())
            .then(parsedResponse => extractGifInformation(parsedResponse.data))
            .then(gifsInformation => gifsInformation.map(gifInfo => buildGifHtml(gifInfo.url)))
            .then(gridElements => putElementsInGrid('search-result-grid', gridElements))
            .then(() => searchQueryContainer.innerText = query)
            .catch(err => console.log(err));

        fetch(computeRelatedSearchUrl(query))
            .then(rawResponse => checkResponseStatus(rawResponse))
            .then(rawResponse => rawResponse.json())
            .then(parsedResponse => parsedResponse.data)
            .then(payload => payload.slice(0,3).map(searchSuggestion =>
                `<a href="#" data-search="${searchSuggestion.name}" class="button third-button search-suggestion-button">${searchSuggestion.name}</a>`
            ))
            .then(suggestionButtons => {
                searchSuggestionsContainer.innerHTML = '';
                suggestionButtons.forEach(suggestionButton => searchSuggestionsContainer.innerHTML += suggestionButton);
            })
            .then(() => bindSearchRelatedEvents())
            .catch(err => console.log(err));
    }
}

const bindSearchRelatedEvents = function() {
    Array.from(document.getElementsByClassName('search-suggestion-button')).forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault();

            const dataSearch = element.getAttribute('data-search');

            search(dataSearch);
        })
    });
};

// GET para traer resultados del endpoint correspondiente​.
// ​Tarjetas recomendadas - los términos pueden estar predefinidos como constantes en el código, pero todos los resultados deben venir desde la API.
// tarjetas azules
// ver mas: te redirige a la pagina de giphy ?
// cruz: cierra y trae otro de la misma categoria

// Suggestions

Promise.all([
    fetch(computeSuggestionsUrl()),
    fetch(computeSuggestionsUrl()),
    fetch(computeSuggestionsUrl()),
    fetch(computeSuggestionsUrl()),
])
.then(rawResponses => rawResponses.map(rawResponse => checkResponseStatus(rawResponse)))
.then(rawResponses => rawResponses.map(rawResponse => rawResponse.json())) // retorna un array con 4 promesas (.json() retorna una promesa)
.then(rawResponsesPromises => extractResponseFromPromisesArray(rawResponsesPromises))
.then(parsedResponses => parsedResponses.map(parsedResponse => parsedResponse.data))
.then(payloads => extractGifInformation(payloads))
.then(gifsInformation => gifsInformation.map(gifInfo => buildGifSuggestionsHtml(gifInfo.url, gifInfo.title))) 
.then(elements => putElementsInGrid('suggestions-result-grid', elements))
.then(() => bindSuggestionEvents()) //ver
.catch(err => console.log("Ha ocurrido un error" + err));

const bindSuggestionEvents = function() {
    Array.from(document.getElementsByClassName('related-search-trigger')).forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault();

            const dataSearch = element.getAttribute('data-search');

            search(dataSearch);
        })
    });


    Array.from(document.getElementsByClassName('close-current-gif')).forEach(element => {
        element.addEventListener('click', e => {
            e.preventDefault();

            fetch(computeSuggestionsUrl())
                .then(rawResponse => checkResponseStatus(rawResponse))
                .then(rawResponse => rawResponse.json())
                .then(parsedResponse => ({ url: parsedResponse.data.images.preview_gif.url, title: parsedResponse.data.title }))
                .then(gifInformation => {
                    let currentBox = element.parentElement.parentElement;

                    currentBox.querySelector(".box-header-text").innerText = gifInformation.title; 
                    currentBox.querySelector("img").src = gifInformation.url;
                    currentBox.querySelector(".see-more-button").setAttribute('data-search', gifInformation.title);
                })
                .catch(e => console.log(e));

        })
    });
};

// Trends

const loadTendencies = (offset, limit) =>
    fetch(computeTrendingsUrl(offset, limit)) 
        .then(rawResponse => checkResponseStatus(rawResponse))
        .then(rawResponse => rawResponse.json())
        .then(parsedResponse => extractGifInformation(parsedResponse.data))
        .then(gifsInformation => gifsInformation.map(gifInfo => buildGifTendenciesHtml(gifInfo.url, gifInfo.title, gifInfo.tags)))
        .then(gridElements => putElementsInGrid('tendencies-result-grid', gridElements))
        .then(() => bindSuggestionEvents()) //ojo
        .catch(err => console.log("Ha ocurrido un error" + err));

loadTendencies(0, 25);

const extractResponseFromPromisesArray = promises => Promise.all(promises);

// Theme selector button

const themeDropdownButton = document.getElementById('theme-selector-button');
themeDropdownButton.addEventListener('click', e => {
    e.preventDefault();

    toggleVisibility('theme-selector-dropdown');
});


const lightThemeSelector = document.getElementById('light-theme');
const darkThemeSelector = document.getElementById('dark-theme');

darkThemeSelector.addEventListener('click', e => {
    e.preventDefault();

    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('dark-theme');
});

lightThemeSelector.addEventListener('click', e => {
    e.preventDefault();

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.add('light-theme');
});

// Search input

const searchInput = document.getElementById('search-input');

const searchButton = document.getElementById('search-button');

searchInput.addEventListener('focus', e => {
    e.preventDefault();

    toggleVisibility('search-options-container');
    searchButton.classList.remove('default-search-button');
    searchButton.classList.add('primary-button');

});

searchInput.addEventListener('focusout', e => {
    e.preventDefault();

    toggleVisibility('search-options-container');
    if (!searchInput.value) {
        searchButton.classList.add('default-search-button');
        searchButton.classList.remove('primary-button');
    }
});

// Similar search results
const firstSuggestionSearchButton = document.getElementById('first-suggestion-search-button');
const secondSuggestionSearchButton = document.getElementById('second-suggestion-search-button');
const thirdSuggestionSearchButton = document.getElementById('third-suggestion-search-button');

Array.from(document.getElementsByClassName('autocomplete-button')).forEach(element => {
    element.addEventListener('mousedown', e => {
        e.preventDefault();
        
        const searchValue = element.getAttribute('data-search');
        search(searchValue);
    })
});

const setAutocompleteDataSearch = (button, suggestedTerm, defaultValue) => {
    if (suggestedTerm !== undefined) {
        button.innerText = suggestedTerm.name;
        button.setAttribute('data-search', suggestedTerm.name);
    } else {
        button.innerText = `${defaultValue} (aleatorio)`;
        button.setAttribute('data-search', defaultValue);
    }
}

searchInput.addEventListener('keyup', e => {
    if (searchInput.value.length >= 3) {
        fetch(computeAutocompleteUrl(searchInput.value))
            .then(rawResponse => checkResponseStatus(rawResponse))
            .then(rawResponse => rawResponse.json())
            .then(parsedResponse => parsedResponse.data)
            .then(payload => {
                setAutocompleteDataSearch(firstSuggestionSearchButton, payload[0], "foca");
                setAutocompleteDataSearch(secondSuggestionSearchButton, payload[1], "perro");
                setAutocompleteDataSearch(thirdSuggestionSearchButton, payload[2], "gato");

            })
            .catch(e => console.log(e));
    }
});