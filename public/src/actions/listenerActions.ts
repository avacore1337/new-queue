import { FluxStandardAction } from 'redux-promise-middleware';

export const Listeners = Object.freeze({
  OnAdministratorAdded: 'ON_ADMINISTRATOR_ADDED',
  OnAdministratorRemoved: 'ON_ADMINISTRATOR_REMOVED',
  OnTeacherAdded: 'ON_TEACHER_ADDED',
  OnTeacherRemoved: 'ON_TEACHER_REMOVED',
  OnAssistantAdded: 'ON_ASSISTANT_ADDED',
  OnAssistantRemoved: 'ON_ASSISTANT_REMOVED',
  OnQueueAdded: 'ON_QUEUE_ADDED',
  OnQueueRemoved: 'ON_QUEUE_REMOVED',
  OnQueueUpdated: 'ON_QUEUE_UPDATED',
  OnQueueEntryAdded: 'ON_QUEUE_ENTRY_ADDED',
  OnQueueEntryRemoved: 'ON_QUEUE_ENTRY_REMOVED',
  OnQueueEntryUpdated: 'ON_QUEUE_ENTRY_UPDATED',
  OnMessageReceived: 'ON_MESSAGE_RECEIVED',
  OnBannerAdded: 'ON_BANNER_ADDED',
  OnBannerUpdated: 'ON_BANNER_UPDATED'
});

export const onAdministratorAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnAdministratorAdded,
  payload: { ...data }
});

export const onAdministratorRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnAdministratorRemoved,
  payload: { ...data }
});

export const onTeacherAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnTeacherAdded,
  payload: { ...data }
});

export const onTeacherRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnTeacherRemoved,
  payload: { ...data }
});

export const onAssistantAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnAssistantAdded,
  payload: { ...data }
});

export const onAssistantRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnAssistantRemoved,
  payload: { ...data }
});

export const onQueueAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueAdded,
  payload: { ...data }
});

export const onQueueRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueRemoved,
  payload: { ...data }
});

export const onQueueUpdated = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueUpdated,
  payload: { ...data }
});

export const onQueueEntryAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryAdded,
  payload: { ...data }
});

export const onQueueEntryRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryRemoved,
  payload: { ...data }
});

export const onQueueEntryUpdated = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryUpdated,
  payload: { ...data }
});

export const onMessageReceived = (data: any): FluxStandardAction => ({
  type: Listeners.OnMessageReceived,
  payload: { ...data }
});

export const onBannerAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnBannerAdded,
  payload: { ...data }
});

export const onBannerUpdated = (data: any): FluxStandardAction => ({
  type: Listeners.OnBannerUpdated,
  payload: { ...data }
});
