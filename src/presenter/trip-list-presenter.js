import FilterView from '../view/list-filter-view.js';
import SortView from '../view/list-sort-view.js';
import ListView from '../view/list-view.js';
import ButtonNewEvent from '../view/button-new-event.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import NoEventView from '../view/list-empty-view.js';
import PointPresenter from './point-presenter.js';
//import EditPointView from '../view/edit-point-view.js';
import { updateItem } from '../utils/common.js';
import { FilterType, SortType } from '../const.js';
import { sortByPrice, sortByTime } from '../utils/filter.js';

export default class TripPresenter {
  #listContainer = null;
  #pointsModel = null;
  #filterContainer = null;
  #listComponent = new ListView();
  #filterComponent = null;
  #sortComponent = null;
  #buttonNewPoint = new ButtonNewEvent();
  #noEventComponent = new NoEventView();
  #pointEdit = null;

  #boardPoints = [];
  #offersList = [];
  #destinationsList = [];
  #pointPresenter = new Map();
  #currentFilterType = FilterType.EVERYTHING;
  #currentSortType = SortType.DAY;
  #sourcedBoardPoints = [];

  constructor({listContainer, filterContainer, pointsModel}) {
    this.#listContainer = listContainer;
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
  }

  get points() {
    return this.#pointsModel.points;
  }

  init() {
    this.#boardPoints = [...this.#pointsModel.points];
    this.#offersList = [...this.#pointsModel.offers];
    this.#destinationsList = [...this.#pointsModel.destinations];
    // 1. В отличии от сортировки по любому параметру,
    // исходный порядок можно сохранить только одним способом -
    // сохранив исходный массив:
    this.#sourcedBoardPoints = [...this.#pointsModel.points];

    this.#renderBoard();
  }

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handlePointChange = (updatedPoint) => {
    this.#boardPoints = updateItem(this.#boardPoints, updatedPoint);
    this.#sourcedBoardPoints = updateItem(this.#sourcedBoardPoints, updatedPoint);
    this.#pointPresenter.get(updatedPoint.id).init(updatedPoint, this.#offersList, this.#destinationsList);
  };

  #renderPoint (point, offers, destinations) {
    const pointPresenter = new PointPresenter({
      listContainer: this.#listComponent.element,
      onDataChange: this.#handlePointChange,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point, offers, destinations);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #sortPoints(sortType) {
    // 2. Этот исходный массив задач необходим,
    // потому что для сортировки мы будем мутировать
    // массив в свойстве _boardTasks
    switch (sortType) {
      case SortType.TIME:
        this.#boardPoints.sort(sortByTime);
        break;
      case SortType.PRICE:
        this.#boardPoints.sort(sortByPrice);
        break;
      default:
      // 3. А когда пользователь захочет "вернуть всё, как было",
      // мы просто запишем в _boardTasks исходный массив
        this.#boardPoints = [...this.#sourcedBoardPoints];
    }

    this.#currentSortType = sortType;
  }

  #handleSortTypeChange = (sortType) => {
    // - сортируем задачи
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#sortPoints(sortType);
    // - очищаем список
    this.#clearPointList();
    // - рендерим список заново
    this.#renderPoints();
    this.#removeSort();
    this.#renderSort();
  };

  #renderSort() {
    this.#sortComponent = new SortView({onSortTypeChange: this.#handleSortTypeChange, currentSortType: this.#currentSortType});
    render(this.#sortComponent, this.#listComponent.element, RenderPosition.AFTERBEGIN);
  }

  #removeSort() {
    remove(this.#sortComponent);
  }

  #renderPoints() {
    this.#boardPoints
      .forEach((point) => this.#renderPoint(point, this.#offersList, this.#destinationsList));
  }

  #renderNoEvents() {
    render(this.#noEventComponent, this.#listComponent.element, RenderPosition.AFTERBEGIN);
  }

  //объект для фильтров
  #filterPoints(filterType) {
    // 2. Этот исходный массив задач необходим,
    // потому что для сортировки мы будем мутировать
    // массив в свойстве _boardTasks

    // 3. А когда пользователь захочет "вернуть всё, как было",
    // мы просто запишем в _boardTasks исходный массив
    //this.#boardPoints = [...this.#sourcedBoardPoints];

    this.#currentFilterType = filterType;
  }

  #handleFilterTypeChange = (filterType) => {
    // - сортируем задачи
    if (this.#currentFilterType === filterType) {
      return;
    }

    this.#filterPoints(filterType);
    // - очищаем список
    this.#clearPointList();
    // - рендерим список заново
    this.#renderBoard();
  };

  #renderFilters() {
    this.#filterComponent = new FilterView({onFilterChange: this.#handleFilterTypeChange});
    render(this.#filterComponent, this.#filterContainer, RenderPosition.AFTERBEGIN);
  }

  /* #renderButtonNewPoint() {
    render(this.#buttonNewPoint, this.#listComponent.element, RenderPosition.AFTERBEGIN);
  }
 */
/*   #renderEditPoint() {
    this.#pointEdit = new EditPointView({point: this.#boardPoints[0], offersByType: this.#offersList, destinations: this.#destinationsList});
    render(this.#pointEdit, this.#listComponent.element);

    for (let i = 1; i < this.#boardPoints.length; i++) {
      const offersForPoint = this.#offersList.find((offer) => offer.type === this.#boardPoints[i].type).offers;
      render(this.#renderPoint({point: this.#boardPoints[i], offers: offersForPoint}));
    }
  } */

  #clearPointList() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  }

  #renderBoard() {
    render(this.#listComponent, this.#listContainer);

    //условие отрисовки заглушки при остутствии точек маршрута
    if (!this.#boardPoints.length) {
      this.#renderNoEvents();

      return;
    }

    this.#renderSort();
    this.#renderFilters();
   //this.#renderEditPoint();
    this.#renderPoints();
    //this.#renderButtonNewPoint();
  }
}
