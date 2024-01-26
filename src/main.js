import TripPresenter from './presenter/trip-list-presenter.js';
import PointsModel from './model/points-model.js';
import FilterModel from './model/filter-model.js';
import FilterPresenter from './presenter/filter-presenter.js';
//import { generateFilter } from './mock/filter.js';
//import { generateSort } from './mock/filter.js';
//import { render } from './framework/render.js';
//import FilterView from './view/list-filter-view.js';
//import SortView from './view/list-sort-view.js';

const listContainer = document.querySelector('.trip-events');
const filterContainer = document.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();
const filterModel = new FilterModel();
const tripListPresenter = new TripPresenter({listContainer, filterContainer, pointsModel, filterModel});

const filterPresenter = new FilterPresenter({
  filterContainer: listContainer,
  filterModel,
  pointsModel,
});

filterPresenter.init();
tripListPresenter.init();
