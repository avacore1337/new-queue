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
  OnQueueEntryAdded: 'ON_QUEUE_ENTRY_ADDED',
  OnQueueEntryRemoved: 'ON_QUEUE_ENTRY_REMOVED',
  OnQueueEntryUpdated: 'ON_QUEUE_ENTRY_UPDATED',
  OnMessageRecieved: 'ON_MESSAGE_RECEIVED'
});

export const onAdministratorAdded = (administrator: any): FluxStandardAction => ({
  type: Listeners.OnAdministratorAdded,
  payload: administrator
});

export const onAdministratorRemoved = (username: string): FluxStandardAction => ({
  type: Listeners.OnAdministratorRemoved,
  payload: username
});

export const onTeacherAdded = (teacher: any): FluxStandardAction => ({
  type: Listeners.OnTeacherAdded,
  payload: teacher
});

export const onTeacherRemoved = (username: string): FluxStandardAction => ({
  type: Listeners.OnTeacherAdded,
  payload: username
});

export const onAssistantAdded = (assistant: any): FluxStandardAction => ({
  type: Listeners.OnAssistantAdded,
  payload: assistant
});

export const onAssistantRemoved = (username: string): FluxStandardAction => ({
  type: Listeners.OnAssistantAdded,
  payload: username
});

export const onQueueAdded = (queue: any): FluxStandardAction => ({
  type: Listeners.OnQueueAdded,
  payload: queue
});

export const onQueueRemoved = (queueName: string): FluxStandardAction => ({
  type: Listeners.OnQueueAdded,
  payload: queueName
});

export const onQueueEntryAdded = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryAdded,
  payload: data
});

export const onQueueEntryRemoved = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryRemoved,
  payload: data
});

export const onQueueEntryUpdated = (data: any): FluxStandardAction => ({
  type: Listeners.OnQueueEntryUpdated,
  payload: data
});

export const onMessageRecieved = (data: any): FluxStandardAction => ({
  type: Listeners.OnMessageRecieved,
  payload: data
});
