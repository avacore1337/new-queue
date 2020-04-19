import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  SetFilter: 'SET_FILTER',
  ClearFilter: 'CLEAR_FILTER'
});

export const setFilter = (filter: string): FluxStandardAction => ({
  type: ActionTypes.SetFilter,
  payload: filter
});

export const clearFilter = (): FluxStandardAction => ({
  type: ActionTypes.ClearFilter
});
