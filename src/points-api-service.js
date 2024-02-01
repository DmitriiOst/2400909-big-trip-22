import ApiService from './framework/api-service.js';

const Method = {
  GET: 'GET',
  PUT: 'PUT',
};

export default class PointsApiService extends ApiService {
  get points() {
    return this._load({url: 'points'})
      .then(ApiService.parseResponse);
  }

  get destinations() {
    return this._load({url: 'destinations'})
      .then(ApiService.parseResponse);
  }

  get offers() {
    return this._load({url: 'offers'})
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    const response = await this._load({
      url: `points/:${point.id}`,
      method: Method.PUT,
      body: JSON.stringify(this.#adaptToServer(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    });

    const parsedResponse = await ApiService.parseResponse(response);

    return parsedResponse;
  }

  // async addPoint(point) {
  //   const response = await this._load({
  //     url: 'points',
  //     method: Method.POST,
  //     body: JSON.stringify(this.#adaptToServer(point)),
  //     headers: new Headers({'Content-Type': 'application/json'})
  //   });
  //   const parsedResponse = await ApiService.parseResponse(response);
  //   const adaptedPoint = this.#adaptToClient(parsedResponse);
  //   return adaptedPoint;
  // }

  // async deletePoint(point) {
  //   const response = await this._load({
  //     url: `points/${point.id}`,
  //     method: Method.DELETE
  //   });
  //   return response;
  // }

  #adaptToServer(point) {
    const adaptedPoint = {
      ...point,
      'base_prise': point.basePrice,
      'date_from': point.dateFrom instanceof Date ? point.dateFrom.toISOString() : null, // на сервере дата хранится в ISO формате
      'date_to': point.dateTo instanceof Date ? point.dateTo.toISOString() : null,
      'is_favorite': point.isFavorite,
    };

    if (point.id === 0) {
      delete adaptedPoint.id;
    }

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;

    return adaptedPoint;
  }
}
