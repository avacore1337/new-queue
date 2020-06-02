import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  Initialize: 'INITIALIZE'
});

export const initialize = (): FluxStandardAction => ({
  type: ActionTypes.Initialize
});
