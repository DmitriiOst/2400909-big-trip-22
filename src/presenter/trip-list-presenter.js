import FilterView from '../view/list-filter-view.js';
import SortView from '../view/list-sort-view.js';
import ListView from '../view/list-view.js';
import ButtonNewEvent from '../view/button-new-event.js';
import { render, RenderPosition, remove } from '../framework/render.js';
import NoEventView from '../view/list-empty-view.js';
import PointPresenter from './point-presenter.js';
//import EditPointView from '../view/edit-point-view.js';
import { FilterType, SortType, UserAction, UpdateType } from '../const.js';
import { sortByPrice, sortByTime } from '../utils/filter.js';

export default class TripPresenter {
  #listContainer = null;
  #pointsModel = null;
  #filterModel = null;
  #filterContainer = null;
  #listComponent = new ListView();
  #filterComponent = null;
  #sortComponent = null;
  #buttonNewPoint = new ButtonNewEvent();
  #noEventComponent = null;
  #pointEdit = null;

  //#boardPoints = [];
  #offersList = [];
  #destinationsList = [];
  #pointPresenter = new Map();
  #filterType = FilterType.EVERYTHING;
  #currentSortType = SortType.DAY;
  //#sourcedBoardPoints = [];

  constructor({listContainer, filterContainer, pointsModel, filterModel}) {
    this.#listContainer = listContainer;
    this.#filterContainer = filterContainer;
    this.#pointsModel = pointsModel;
    this.#filterModel = filterModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    this.#filterType = this.#filterModel.filter;
    const points = this.#pointsModel.points;
    const filteredPoints = filter[this.#filterType](points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortByTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortByPrice);
    }

    return filteredPoints;
  }

  init() {
    //this.#boardPoints = [...this.#pointsModel.points];
    this.#offersList = [...this.#pointsModel.offers];
    this.#destinationsList = [...this.#pointsModel.destinations];
    // 1. В отличии от сортировки по любому параметру,
    // исходный порядок можно сохранить только одним способом -
    // сохранив исходный массив:
    //this.#sourcedBoardPoints = [...this.#pointsModel.points];

    this.#renderBoard();
  }

  #handleModeChange = () => {
    this.#pointPresenter.forEach((presenter) => presenter.resetView());
  };

  #handleViewAction = (actionType, updateType, update) => {
    // Здесь будем вызывать обновление модели.
    // actionType - действие пользователя, нужно чтобы понять, какой метод модели вызвать
    // updateType - тип изменений, нужно чтобы понять, что после нужно обновить
    // update - обновленные данные
    switch(actionType) {
      case UserAction.UPDATE_POINT:
        this.#pointsModel.updatePoint(updateType, update);
        break;
      case UserAction.ADD_POINT:
        this.#pointsModel.addPoint(updateType, update);
        break;
      case UserAction.DELETE_POINT:
        this.#pointsModel.deletePoint(updateType, update);
        break;
    }
  };

  #handleModelEvent = (updateType, data) => {
    // В зависимости от типа изменений решаем, что делать:
    switch (updateType) {
      case UpdateType.PATCH:
        // - обновить часть списка (например, когда поменялось описание)
        this.#pointPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        // - обновить список (например, когда задача ушла в архив)
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        // - обновить всю доску (например, при переключении фильтра)
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
    }
  };

  #renderPoint (point, offers, destinations) {
    const pointPresenter = new PointPresenter({
      listContainer: this.#listComponent.element,
      onDataChange: this.#handleViewAction,
      onModeChange: this.#handleModeChange,
    });

    pointPresenter.init(point, offers, destinations);
    this.#pointPresenter.set(point.id, pointPresenter);
  }

  #handleSortTypeChange = (sortType) => {
    // - сортируем задачи
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    // - очищаем список
    this.#clearBoard();
    this.#renderBoard();
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

  #renderPoints(points) {
    points.forEach((point) => this.#renderPoint(point, this.#offersList, this.#destinationsList));
  }

  #renderNoEvents() {
    this.#noEventComponent = new NoEventView({
      filterType: this.#filterType
    });

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

    this.#filterType = filterType;
  }

  #renderFilters() {
    this.#filterComponent = new FilterView({onFilterChange: this.#handleFilterTypeChange});
    render(this.#filterComponent, this.#filterContainer, RenderPosition.AFTERBEGIN);
  }

  #removeFilter() {
    remove(this.#filterComponent);
  }

  #handleFilterTypeChange = (filterType) => {
    // - сортируем задачи
    if (this.#filterType === filterType) {
      return;
    }

    this.#filterPoints(filterType);
    // - очищаем список
    this.#clearBoard();
    // - рендерим список заново
    this.#renderBoard();
    this.#removeFilter();
    this.#renderFilters();
  };
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

  /*  #clearPointList() {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();
  } */

  #clearBoard({resetSortType = false} = {}) {
    this.#pointPresenter.forEach((presenter) => presenter.destroy());
    this.#pointPresenter.clear();

    remove(this.#sortComponent);
    remove(this.#noEventComponent);

    if(this.#noEventComponent) {
      remove(this.#noEventComponent);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #renderBoard() {
    render(this.#listComponent, this.#listContainer);

    //условие отрисовки заглушки при остутствии точек маршрута
    if (this.points.length === 0) {
      this.#renderNoEvents();
      return;
    }

    this.#renderSort();
    this.#renderFilters();
    this.#renderPoints(); // TODO: замена на render(this.#taskListComponent, this.#boardComponent.element);
    //this.#renderEditPoint();
    //this.#renderButtonNewPoint();
  }
}
