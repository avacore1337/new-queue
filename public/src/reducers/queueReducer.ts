import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/queueActions';
import { ActionTypes as AdministratorActionTypes } from '../actions/administratorActions';
import { Listeners } from '../actions/listenerActions';
import Queue from '../models/Queue';
import QueueEntry from '../models/QueueEntry';
import Teacher from '../models/Teacher';
import Assistant from '../models/Assistant';
import RequestStatus from '../enums/RequestStatus';

const initialState = {
  queueList: [] as Queue[],
  requestStatus: RequestStatus.NotStarted
};

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.GetQueues.Rejected: {
      return { ...state, requestStatus: RequestStatus.Failed };
    }

    case ActionTypes.GetQueues.Pending: {
      return { ...state, requestStatus: RequestStatus.Pending };
    }

    case ActionTypes.GetQueues.Fulfilled: {
      const queueList: Queue[] = action.payload[0];

      for (const queueName in action.payload[1]) {
        if (!action.payload[1].hasOwnProperty(queueName)) {
          continue;
        }

        const queue = queueList.find(q => q.name === queueName);
        if (queue === undefined) {
          continue;
        }
        queue.setQueueEntries(action.payload[1][queueName].map((e: any) => new QueueEntry(e)));
      }

      return { queueList, requestStatus: RequestStatus.Success };
    }

    case AdministratorActionTypes.LoadAdditionalQueueData.Fulfilled: {
      const teachers: Teacher[] = action.payload[0].data.map((t: any) => new Teacher(t));
      const assistants: Assistant[] = action.payload[1].data.map((a: any) => new Assistant(a));

      const queueToUpdate = state.queueList.filter(queue => queue.name === action.meta.queueName)[0].clone();
      queueToUpdate.setTeachers(teachers);
      queueToUpdate.setAssistants(assistants);

      const queues = [...state.queueList.filter(queue => queue.name !== action.meta.queueName), queueToUpdate];

      return { ...state, queueList: queues };
    }

    case Listeners.OnQueueAdded: {
      return { ...state, queueList: [...state.queueList, new Queue({ name: action.payload.queueName })]};
    }

    case Listeners.OnQueueUpdated: {
      const queues = [...state.queueList];
      const index = queues.findIndex(q => q.name === action.payload.queueName);
      queues[index] = new Queue({
        ...action.payload,
        name: action.payload.queueName,
        queueEntries: queues[index].queueEntries
      });

      return { ...state, queueList: queues };
    }

    case Listeners.OnQueueEntryAdded: {
      const queues = state.queueList.map(q => q.clone());
      const queue = queues.filter(q => q.name === action.payload.queueName)[0];

      queue.addQueueEntry(new QueueEntry(action.payload));

      return { ...state, queueList: queues };
    }

    case Listeners.OnQueueEntryRemoved: {
      const queues = state.queueList.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeQueueEntry(new QueueEntry(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnQueueEntryUpdated: {
      const queues = state.queueList.map(q => q.clone());
      const queue = queues.filter(q => q.name === action.payload.queueName)[0];
      queue.updateQueueEntry(new QueueEntry(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnTeacherAdded: {
      const queues = state.queueList.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].addTeacher(new Teacher(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnTeacherRemoved: {
      const queues = state.queueList.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeTeacher(new Teacher(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnAssistantAdded: {
      const queues = state.queueList.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].addAssistant(new Assistant(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnAssistantRemoved: {
      const queues = state.queueList.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeAssistant(new Assistant(action.payload));
      return { ...state, queueList: queues };
    }

    case Listeners.OnQueueRemoved: {
      return { ...state, queueList: state.queueList.filter(q => q.name !== action.payload.queueName) };
    }

  }

  return state;
};
