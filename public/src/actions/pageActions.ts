import { FluxStandardAction } from 'redux-promise-middleware';

export const ActionTypes = Object.freeze({
  EnterAdminPage: 'ENTER_ADMIN_PAGE',
  LeaveAdminPage: 'LEAVE_ADMIN_PAGE'
});

export const enterAdminPage = (): FluxStandardAction => ({
  type: ActionTypes.EnterAdminPage
});

export const leaveAdminPage = (): FluxStandardAction => ({
  type: ActionTypes.LeaveAdminPage
});
