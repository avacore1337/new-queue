import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  EnableSounds: 'ENABLE_SOUNDS',
  DisableSounds: 'DISABLE_SOUNDS'
});

export const enableSounds = (): FluxStandardAction => ({
  type: ActionTypes.EnableSounds
});

export const disableSounds = (): FluxStandardAction => ({
  type: ActionTypes.DisableSounds
});
