import { TYPES } from '../const.js';
import dayjs from 'dayjs';
import AbstractView from '../framework/view/abstract-view.js';

//функция для верхнего регистра первой буквы в названии типа
const upTitle = (title) => title[0].toUpperCase() + title.slice(1);

function createTypeTemplate(point, destination) {
  const {id, type} = point;
  const {name} = destination;

  return (
    `<div class="event__type-wrapper">
      <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
        <span class="visually-hidden">Choose event type</span>
        <img class="event__type-icon" width="${id}7" height="${id}7" src="img/icons/${type}.png" alt="Event type icon">
      </label>
      <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

      <div class="event__type-list">
        <fieldset class="event__type-group">
          <legend class="visually-hidden">Event type</legend>

       ${TYPES.map((eventType) => (
          `<div class="event__type-item">
          <input id="event-type-${eventType}-${id}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${eventType}">
          <label class="event__type-label  event__type-label--${eventType}" for="event-type-${eventType}-${id}">${eventType[0].toUpperCase()}</label>
          </div>`
        )).join('')}

        </fieldset>
      </div>
    </div>

    <div class="event__field-group  event__field-group--destination">
      <label class="event__label  event__type-output" for="event-destination-${id}">
        ${upTitle(type)}
      </label>
      <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${name}" list="destination-list-${id}">
      <datalist id="destination-list-${id}">
        <option value="Amsterdam"></option>
        <option value="Geneva"></option>
        <option value="Chamonix"></option>
      </datalist>
    </div>`
  );
}

function createDateTemplate(point) {
  const {dateFrom, dateTo, id} = point;

  return (
    `
      <label class="visually-hidden" for="event-start-time-${id}">From</label>
      <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${dayjs(dateFrom).format('DD/MM/YY h:mm A')}">
      &mdash;
      <label class="visually-hidden" for="event-end-time-${id}">To</label>
      <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${dayjs(dateTo).format('DD/MM/YY h:mm A')}">
    `
  );
}

function createPriceTemplate(point) {
  const {basePrice, id} = point;

  return (
    `
      <label class="event__label" for="event-price-${id}">
        <span class="visually-hidden">Price</span>
        &euro;
      </label>
      <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${basePrice}">
    `
  );
}

function createSaveButton() {
  return (
    '<button class="event__save-btn  btn  btn--blue" type="submit">Save</button>'
  );
}

function createResetButton() {
  return (
    '<button class="event__reset-btn" type="reset">Delete</button>'
  );
}

function createRollupButton() {
  return (
    `<button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>`
  );
}

function createOfferTemplate(point, offersByType) {
  const {offers} = point;
  const pointTypeOffer = offersByType.find((offer) => offer.type === point.type);

  if (offers.length !== 0) {
    return (
      `<div class="event__available-offers">
        ${pointTypeOffer.offers.map((offer) => {
          const checked = point.offers.includes(offer.id) ? 'checked' : '';

          return (
            `<div class="event__offer-selector">
            <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.title}-${offer.id}" type="checkbox" name="event-offer-${offer.title}" ${checked}>
            <label class="event__offer-label" for="event-offer-${offer.title}-${offer.id}">
              <span class="event__offer-title">${upTitle(offer.title)}</span>
              &plus;&euro;&nbsp;
              <span class="event__offer-price">${offer.price}</span>
            </label>
          </div>`
          );
        }).join('')
        }
      </div>`
    );
  }

  return '';
}

function createDestinationTemplate(destination) {
  const {description, pictures} = destination;

  if (pictures.length === 0) {
    return '';
  }

  return (
    `<p class="event__destination-description">${description}</p>

    <div class="event__photos-container">
      <div class="event__photos-tape">
      ${pictures.map((image) => `<img class="event__photo" src="${image.src}" alt="${image.description}">`).join('')}
      </div>
    </div>`
  );
}

function createEditPointTemplate({point, offersByType, destination}) {
  return (
    `<li class="trip-events__item">
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        ${createTypeTemplate(point)}

        <div class="event__field-group  event__field-group--time">
          ${createDateTemplate(point)}
        </div>

        <div class="event__field-group  event__field-group--price">
         ${createPriceTemplate(point)}
        </div>

        ${createSaveButton()}
        ${createResetButton()}
        ${createRollupButton()}
      </header>
      <section class="event__details">
        <section class="event__section  event__section--offers">
          <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            ${createOfferTemplate(point, offersByType)}
        </section>

        <section class="event__section  event__section--destination">
          <h3 class="event__section-title  event__section-title--destination">Destination</h3>
            ${createDestinationTemplate(destination)}

        </section>
      </section>
    </form>
    </li>`
  );
}

export default class EditPointView extends AbstractView {
  #stat = null;
  #handleFormSubmit = null;

  constructor ({point, offersByType, destination, onFormSubmit}) {
    super();
    this.#stat = {
      point,
      offersByType,
      destination,
    };
    this.#handleFormSubmit = onFormSubmit;

    this.element.querySelector('form')
    .addEventListener('submit', this.#formSubmitHadler);
  }

  get template() {
    return createEditPointTemplate(this.#stat);
  }

  #formSubmitHadler = (evt) => {
    evt.preventDefault();
    this.#handleFormSubmit();
  };
}
