import { FluxStandardAction } from 'redux-promise-middleware';
import { ActionTypes } from '../actions/queueActions';
import { ActionTypes as AdministratorActionTypes } from '../actions/administratorActions';
import { ActionTypes as AssistantActionTypes } from '../actions/assistantActions';
import { Listeners } from '../actions/listenerActions';
import Queue from '../models/Queue';
import QueueEntry from '../models/QueueEntry';
import Teacher from '../models/Teacher';
import Assistant from '../models/Assistant';

const initialState = [] as Queue[];

export default (state = initialState, action: FluxStandardAction) => {
  switch (action.type) {

    case ActionTypes.GetQueues.Fulfilled: {
      action.payload.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });
      return action.payload;
    }

    case ActionTypes.LoadQueueData.Fulfilled: {
      const queueEntries: QueueEntry[] = action.payload[0].map((entryInformation: any) => new QueueEntry(entryInformation));
      const metadata: any = action.payload[1];

      const queueToUpdate = state.filter(queue => queue.name === action.meta.queueName)[0].clone();
      queueToUpdate.setInformationText(metadata.info);
      queueToUpdate.setQueueEntries(queueEntries);

      const queues = [...state.filter(queue => queue.name !== action.meta.queueName), queueToUpdate];

      queues.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });

      if (metadata.motd) {
        alert(metadata.motd);
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

      queues.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });

      return queues;
    }

    case AssistantActionTypes.ClickRow: {
      const queueToUpdate = state.filter(queue => queue.name === action.payload.queueName)[0].clone();
      const queueEntryToUpdate = queueToUpdate.queueEntries.filter(e => e.ugkthid === action.payload.ugkthid)[0];

      if (queueEntryToUpdate.lastClicked === null) {
        queueEntryToUpdate.setLastClicked(Date.now());
      }
      else {
        const intervallMilliseconds: number = 500;
        if (Date.now() - queueEntryToUpdate.lastClicked <= intervallMilliseconds) {
          queueEntryToUpdate.toggleTAOptions();
        }

        queueEntryToUpdate.setLastClicked(Date.now());
      }

      const queues = [...state.filter(queue => queue.name !== action.payload.queueName), queueToUpdate];

      queues.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });

      return queues;
    }

    case AssistantActionTypes.TouchRow: {
      const queueToUpdate = state.filter(queue => queue.name === action.payload.queueName)[0].clone();
      const queueEntryToUpdate = queueToUpdate.queueEntries.filter(e => e.ugkthid === action.payload.ugkthid)[0];
      queueEntryToUpdate.toggleTAOptions();

      const queues = [...state.filter(queue => queue.name !== action.payload.queueName), queueToUpdate];

      queues.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });

      return queues;
    }

    case Listeners.OnQueueAdded: {
      const queues = [...state, new Queue({ name: action.payload.queueName })];
      queues.sort((queue1: Queue, queue2: Queue) => {
        if (queue1.hiding && !queue2.hiding) { return 1; }
        if (!queue1.hiding && queue2.hiding) { return -1; }
        return queue1.name < queue2.name ? -1 : 1;
      });
      return queues;
    }

    case Listeners.OnQueueRemoved: {
      return state.filter(queue => queue.name !== action.payload);
    }

    case Listeners.OnQueueEntryAdded: {
      const queues = state.map(q => q.clone());
      queues.filter(q => q.name === action.payload.queueName)[0].addQueueEntry(new QueueEntry(action.payload));
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
