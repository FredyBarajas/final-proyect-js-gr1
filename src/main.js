const postersContainer = document.getElementById('posters-container');
const paginationContainer = document.getElementById('pagination');
const eventInfoContainer = document.getElementById('event-info');
const searchInput = document.getElementById('search-input');
const countrySelect = document.getElementById('country-select');
const searchButton = document.getElementById('search-button');
const apiKey = 'LIhcnyJs36Qars7XbSGaCVMB6e31wrqF'; // Reemplaza esto con tu clave de API de Ticketmaster

const eventsPerPage = 16;
let currentPage = 1;
let totalEvents = 0;
let totalPages = 0;
let searchText = '';
let selectedCountry = '';

// Función para obtener la lista de países desde la API de Ticketmaster
function fetchCountries() {
  const url = `https://app.ticketmaster.com/discovery/v2/countries.json?apikey=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => data._embedded.countries);
}

// Función para generar las opciones del selector de países
function generateCountryOptions(countries) {
  countrySelect.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = 'Todos los países';
  countrySelect.appendChild(allOption);

  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country.countryCode;
    option.textContent = country.name;
    countrySelect.appendChild(option);
  });
}

// Llamar a la función fetchCountries para obtener la lista de países
fetchCountries()
  .then(countries => generateCountryOptions(countries))
  .catch(error => console.error(error));

// Función para obtener eventos de la API de Ticketmaster
function fetchEvents(page) {
  let url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&size=${eventsPerPage}&page=${page}`;

  if (searchText !== '') {
    url += `&keyword=${encodeURIComponent(searchText)}`;
  }

  if (selectedCountry !== '') {
    url += `&countryCode=${selectedCountry}`;
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      const events = data._embedded.events;
      totalEvents = data.page.totalElements;
      totalPages = data.page.totalPages;

      return events;
    });
}

// Función para generar el HTML de los pósters de los eventos
function generatePosters(events) {
  postersContainer.innerHTML = '';

  events.forEach(event => {
    const poster = document.createElement('div');
    poster.className = 'poster';

    const card = document.createElement('div');
    card.className = 'card';

    const image = document.createElement('img');
    image.src = event.images[0].url;
    image.alt = event.name;
    card.appendChild(image);

    const eventInfo = document.createElement('div');
    eventInfo.className = 'event-info';

    const eventName = document.createElement('h3');
    eventName.textContent = event.name;
    eventInfo.appendChild(eventName);

    const eventDate = document.createElement('p');
    eventDate.innerHTML = `<i class="fa fa-calendar"></i> Fecha: ${event.dates.start.localDate}`;
    eventInfo.appendChild(eventDate);

    const eventLocation = document.createElement('p');
    eventLocation.innerHTML = `<i class="fa fa-map-marker"></i> Ubicación: ${event._embedded.venues[0].name}`;
    eventInfo.appendChild(eventLocation);

    card.appendChild(eventInfo);
    poster.appendChild(card);

    postersContainer.appendChild(poster);

    // Agregar evento de clic para mostrar información del evento
    poster.addEventListener('click', () => {
      showEventInfo(event.id);
    });

    poster.addEventListener('click', () => {
      showEventInfo(event.id);
      showModal(event);
    });
  });
}

// Función para generar la paginación

function generatePagination() {
  paginationContainer.innerHTML = '';

  // Calcular el rango de páginas que se mostrarán
  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 9);

  // Mostrar el enlace a la primera página
  const firstPageLink = createPageLink(1);
  paginationContainer.appendChild(firstPageLink);

  // Mostrar los puntos suspensivos si hay más de 3 páginas
  if (startPage > 2) {
    paginationContainer.appendChild(createEllipsis());
  }

  // Generar los enlaces de las páginas
  for (let i = startPage; i <= endPage; i++) {
    const pageLink = createPageLink(i);
    paginationContainer.appendChild(pageLink);
  }

  // Mostrar los puntos suspensivos si hay más páginas después de la página actual
  if (endPage < totalPages - 1) {
    paginationContainer.appendChild(createEllipsis());
  }

  // Mostrar el enlace a la última página
  const lastPageLink = createPageLink(totalPages);
  paginationContainer.appendChild(lastPageLink);
}

// Función para crear un enlace de página
function createPageLink(pageNumber) {
  const pageLink = document.createElement('a');
  pageLink.href = '#';
  pageLink.textContent = pageNumber;

  if (pageNumber === currentPage) {
    pageLink.classList.add('active');
  }

  pageLink.addEventListener('click', () => {
    currentPage = pageNumber;
    fetchAndRenderEvents();
  });

  return pageLink;
}

// Función para crear los puntos suspensivos
function createEllipsis() {
  const ellipsis = document.createElement('span');
  ellipsis.textContent = '...';
  ellipsis.classList.add('ellipsis');
  return ellipsis;
}

// Función para mostrar información detallada del evento
function showEventInfo(eventId) {
  const url = `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json?apikey=${apiKey}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const event = data;

      const modalOverlay = document.getElementById('modal-overlay');
      const modalImage = document.getElementById('modal-image');
      const modalImageCircular = document.getElementById(
        'modal-image-circular'
      );
      const modalContent = document.getElementById('modal-content');

      modalImage.src = event.images[0].url;
      modalImage.alt = event.name;

      modalOverlay.style.display = 'block';

      const venue = event._embedded.venues[0];
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${venue.location.latitude},${venue.location.longitude}`;

      modalContent.innerHTML = `
        <span id="modal-close">&times;</span>
        <img id="modal-image-circular" src="${event.images[0].url}" alt="${event.name}" />
        <div id= "modal-upper"><img id="modal-image" src="${event.images[0].url}" alt="${event.name}" />
        <div id="modal-info">
          <p class="subtitle-modal">Info:<span>${event.info}</span></p>
          <p class="subtitle-modal"><i class="fas fa-map-marker-alt"></i>Where("Haz click"): <a href="${googleMapsLink}" target="_blank" class="location-link"><span class="location-text">${venue.name}</span></a></p>
          <p class="subtitle-modal">When: <span>${event.dates.start.localDate}</span></p></div></div>
          <div id="info-lower">
          <p class="subtitle-modal">Who: <span>${event._embedded.attractions[0].name}</span></p>
          <p class="subtitle-modal">Price: <span>${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}</span></p>
          <button class="btn btn-blue" onclick="window.open('${event.url}', '_blank')">Buy Tickets</button></div>
        <button class="btn btn-author" onclick="window.open('${event._embedded.attractions[0].url}', '_blank')">More about this author</button>
          
      `;
      eventInfoContainer.innerHTML = '';
    });

  // Agrega el siguiente bloque de código al final de la función showEventInfo
  document.addEventListener('click', event => {
    const modalOverlay = document.getElementById('modal-overlay');

    if (event.target === modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  });
}
// Función para realizar la búsqueda de eventos
function searchEvents() {
  searchText = searchInput.value.trim();
  currentPage = 1;
  fetchAndRenderEvents();
}

// Función para cambiar el país seleccionado
function changeCountry() {
  selectedCountry = countrySelect.value;
  currentPage = 1;
  fetchAndRenderEvents();
}

// Función para realizar la solicitud a la API y mostrar los eventos
function fetchAndRenderEvents() {
  fetchEvents(currentPage).then(events => {
    generatePosters(events);
    generatePagination();
  });
}

// Agregar eventos a los elementos de búsqueda y selector de país
searchButton.addEventListener('click', searchEvents);
searchInput.addEventListener('keydown', event => {
  if (event.keyCode === 13) {
    searchEvents();
  }
});
countrySelect.addEventListener('change', changeCountry);

// Llamar a la función fetchAndRenderEvents para obtener y mostrar los eventos
fetchAndRenderEvents();
// Obtén las tarjetas de eventos
const posters = document.getElementsByClassName('poster');
