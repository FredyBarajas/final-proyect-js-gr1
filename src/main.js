const API_KEY = 'DCtz5bLd3cx4DdWQdcctzejbLGWIabei';
const cardsContainer = document.querySelector('.cards');
const modal = document.getElementById('modal');
const modalPoster = document.querySelector('.modal-poster');
const modalInfo = document.querySelector('.modal-info');
const modalBuyTickets = document.querySelector('.modal-buy-tickets');
const paginationContainer = document.querySelector('.pagination');

// Configuración de la paginación
const eventosPorPagina = 16;
let paginaActual = 1;

// Función para obtener eventos de la API de Ticketmaster
async function obtenerEventos() {
  const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&size=${eventosPorPagina}&page=${paginaActual}`;

  try {
    const respuesta = await fetch(url);
    const datos = await respuesta.json();

    const eventos = datos._embedded.events;
    generarTarjetas(eventos);
    generarPaginacion(eventos);
  } catch (error) {
    console.log('Error al obtener eventos:', error);
  }
}

// Función para generar las tarjetas de eventos
function generarTarjetas(eventos) {
  cardsContainer.innerHTML = '';

  //animar tarjetas al dar enter

  eventos.forEach(evento => {
    const card = document.createElement('div');
    card.classList.add('card', 'animate-enter');

    const poster = document.createElement('img');
    poster.src = evento.images[0].url;
    card.appendChild(poster);

    const nombre = document.createElement('div');
    nombre.textContent = evento.name;
    card.appendChild(nombre);
    nombre.style.color = '#DC56C5';
    nombre.style.fontFamily = 'Montserrat';
    nombre.style.fontWeight = '700';
    nombre.style.lineHeight = '19.5px';
    nombre.style.textAlign = 'center';
    if (window.innerWidth <= 768) {
      nombre.style.fontSize = '14px';
    } else {
      nombre.style.fontSize = '16px';
    }
    const fecha = document.createElement('div');
    fecha.textContent = evento.dates.start.localDate;
    card.appendChild(fecha);
    fecha.style.color = '#FFFFFF';
    fecha.style.fontFamily = 'Montserrat';
    fecha.style.fontWeight = '400';
    fecha.style.fontSize = '16px';
    fecha.style.lineHeight = '19.5px';
    fecha.style.textAlign = 'center';

    const lugar = document.createElement('div');
    lugar.textContent = evento._embedded.venues[0].name;
    card.appendChild(lugar);
    lugar.style.fontFamily = 'Montserrat';
    lugar.style.fontWeight = '600';
    lugar.style.color = '#FFFFFF';
    lugar.style.fontSize = '16px';
    lugar.style.lineHeight = '17.07px';
    lugar.style.textAlign = 'center';

    card.addEventListener('click', () => {
      mostrarModal(evento);
    });

    cardsContainer.appendChild(card);
  });
}

// Función para generar los enlaces de paginación
function generarPaginacion(eventos) {
  paginationContainer.innerHTML = '';

  const totalPaginas = Math.ceil(eventos.length / eventosPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const enlace = document.createElement('a');
    enlace.href = '#';
    enlace.textContent = i;

    if (i === paginaActual) {
      enlace.classList.add('active');
    }

    enlace.addEventListener('click', () => {
      paginaActual = i;
      obtenerEventos();
      window.scrollTo(0, 0);

      // Reiniciar la animación y la transición después de un pequeño retraso
      setTimeout(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
          card.classList.remove('animate-enter');
          void card.offsetWidth; // Reiniciar la animación
          card.classList.add('animate-enter');
        });
      }, 500);
    });

    paginationContainer.appendChild(enlace);
  }
}

// Función para mostrar el modal con más detalles del evento
function mostrarModal(evento) {
  modalPoster.src = evento.images[0].url;

  modalInfo.innerHTML = `
    <div><strong style="font-family: Montserrat; font-weight: 600; font-size: 24px; line-height: 29.26px; color: #DC56C5;">Info</strong> <span style="display: block; font-family: Montserrat; font-weight: 400; font-size: 18px; line-height: 21.94px;color: #0E0E0E;">${evento.info}</span></div>
    <div><strong style="font-family: Montserrat; font-weight: 600; font-size: 24px; line-height: 29.26px; color: #DC56C5;">When</strong> <span style="display: block; font-family: Montserrat; font-weight: 400; font-size: 18px; line-height: 21.94px;color: #0E0E0E;"> ${evento.dates.start.localDate}</span></div>
    <div><strong style="font-family: Montserrat; font-weight: 600; font-size: 24px; line-height: 29.26px; color: #DC56C5;">Where</strong> <span style="display: block; font-family: Montserrat; font-weight: 400; font-size: 18px; line-height: 21.94px;color: #0E0E0E;"> ${evento._embedded.venues[0].name}</span></div>
    <div><strong style="font-family: Montserrat; font-weight: 600; font-size: 24px; line-height: 29.26px; color: #DC56C5;">Who</strong> <span style="display: block; font-family: Montserrat; font-weight: 400; font-size: 18px; line-height: 21.94px;color: #0E0E0E;"> ${evento._embedded.attractions[0].name}</span></div>
    <div><strong style="font-family: Montserrat; font-weight: 600; font-size: 24px; line-height: 29.26px; color: #DC56C5;">Price</strong> <span style="display: block; font-family: Montserrat; font-weight: 400; font-size: 18px; line-height: 21.94px;color: #0E0E0E;"> ${evento.priceRanges[0].min} - ${evento.priceRanges[0].max} ${evento.priceRanges[0].currency}</span></div>
  `;

  modalBuyTickets.innerHTML = `<a href="${evento.url}" target="_blank" style="font-family: Montserrat; font-weight: 500; font-size: 16px; line-height: 19.5px; color: #FFFFFF; text-decoration: none; width: 145px; height: 40px;  border-radius: 5px; background-color: #4C00FE; ">Buy Tickets</a>`;

  modal.style.display = 'block';

  const closeButton = document.querySelector('.close');
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  //funcion para cerrar el modal al dar click en la parte oscura de la pagina

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  //codigo para solicitar mas informacion del artista

  const moreInfoButton = document.querySelector('.more_info');
  moreInfoButton.addEventListener('click', () => {
    const authorUrl = evento._embedded.attractions[0].url;
    window.location.href = authorUrl;
  });
}

// Iniciar la obtención de eventos al cargar la página
obtenerEventos();

const lugar = document.createElement('div');
lugar.classList.add('location');

const icono = document.createElement('i');
icono.classList.add('fas', 'fa-map-marker');
lugar.appendChild(icono);

const lugarTexto = document.createElement('div');
lugarTexto.classList.add('location-text');
lugarTexto.textContent = evento._embedded.venues[0].name;
lugar.appendChild(lugarTexto);

card.appendChild(lugar);

// Dentro de la función mostrarModal(evento) donde se encuentra el botón "More from this author"
const moreInfoButton = document.querySelector('.more_info');

moreInfoButton.addEventListener('click', () => {
  const authorUrl = evento._embedded.attractions[0].url;
  window.location.href = authorUrl;
});
