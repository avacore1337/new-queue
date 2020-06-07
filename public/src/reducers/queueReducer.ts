import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/queueActions';
import { ActionTypes as AdministratorActionTypes } from '../actions/administratorActions';
import { Listeners } from '../actions/listenerActions';
import Queue from '../models/Queue';
import QueueEntry from '../models/QueueEntry';
import Teacher from '../models/Teacher';
import Assistant from '../models/Assistant';

const initialState = [] as Queue[];

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.GetQueues.Fulfilled: {
      const queues: Queue[] = action.payload[0];

      for (let queueName in action.payload[1]) {
        const queue = queues.find(q => q.name === queueName);
        if (queue === undefined) {
          continue;
        }
        queue.setQueueEntries(action.payload[1][queueName].map((e: any) => new QueueEntry(e)));
      }

      return queues;
    }

    case AdministratorActionTypes.LoadAdditionalQueueData.Fulfilled: {
      const teachers: Teacher[] = action.payload[0].data.map((t: any) => new Teacher(t));
      const assistants: Assistant[] = action.payload[1].data.map((a: any) => new Assistant(a));

      const queueToUpdate = state.filter(queue => queue.name === action.meta.queueName)[0].clone();
      queueToUpdate.setTeachers(teachers);
      queueToUpdate.setAssistants(assistants);

      const queues = [...state.filter(queue => queue.name !== action.meta.queueName), queueToUpdate];

      return queues;
    }

    case Listeners.OnQueueAdded: {
      return [...state, new Queue({ name: action.payload.queueName })];
    }

    case Listeners.OnQueueUpdated: {
      const queues = [...state];
      const index = queues.findIndex(q => q.name === action.payload.queueName);
      queues[index] = new Queue({
        ...action.payload,
        name: action.payload.queueName,
        queueEntries: queues[index].queueEntries
      });

      return queues;
    }

    case Listeners.OnQueueEntryAdded: {
      const queues = state.map(q => q.clone());
      const queue = queues.filter(q => q.name === action.payload.queueName)[0];

      queue.addQueueEntry(new QueueEntry(action.payload));

      return queues;
    }

    case Listeners.OnQueueEntryRemoved: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeQueueEntry(new QueueEntry(action.payload));
      return queues;
    }

    case Listeners.OnQueueEntryUpdated: {
      const queues = state.map(q => q.clone());
      const queue = queues.filter(q => q.name === action.payload.queueName)[0];
      queue.updateQueueEntry(new QueueEntry(action.payload));
      return queues;
    }

    case Listeners.OnTeacherAdded: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].addTeacher(new Teacher(action.payload));
      return queues;
    }

    case Listeners.OnTeacherRemoved: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeTeacher(new Teacher(action.payload));
      return queues;
    }

    case Listeners.OnAssistantAdded: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].addAssistant(new Assistant(action.payload));
      return queues;
    }

    case Listeners.OnAssistantRemoved: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].removeAssistant(new Assistant(action.payload));
      return queues;
    }

    case Listeners.OnQueueRemoved: {
      return state.filter(q => q.name !== action.payload.queueName);
    }

  }

  return state;
};
