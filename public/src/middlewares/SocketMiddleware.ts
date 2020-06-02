import RequestMessage from '../utils/RequestMessage';
import { WEB_SOCKET_SERVER_URL } from '../configuration';
import { ActionTypes as GlobalActions } from '../actions/globalActions';
import { ActionTypes as AdministratorActions } from '../actions/administratorActions';
import { ActionTypes as QueueActions } from '../actions/queueActions';
import { ActionTypes as LobbyActions } from '../actions/lobbyActions';
import { ActionTypes as SocketActions } from '../actions/socketActions';
import { ActionTypes as UserActions } from '../actions/userActions';
import { ActionTypes as AssistantActions } from '../actions/assistantActions';
import * as Listeners from '../actions/listenerActions';

const middleware = () => {

  let socket: WebSocket | null = null;
  let connectionEstablished = false;
  let lastJoinRequest: any = null;
  let callbacks: any = {};
  let token: string | null = null;
  let pendingRequests: RequestMessage[] = [];

  const connect = (store: any): void => {
    socket = new WebSocket(WEB_SOCKET_SERVER_URL);
    socket.onopen = onOpen(store);
    socket.onclose = onClose(store);
    socket.onmessage = onMessage(store);
  };

  const sendMessage = (message: RequestMessage, callback?: (data: any) => void): void => {
    if (callback !== undefined) {
      callbacks[message.path] = callback;
    }

    if (connectionEstablished && socket !== null) {
      message.token = token || "";
      socket.send(message.stringify());
    }
    else {
      pendingRequests.push(message);
    }
  };

  const onOpen = (store: any) => (event: any) => {
    connectionEstablished = true;

    if (lastJoinRequest !== null) {
      sendMessage(lastJoinRequest);
    }

    while (pendingRequests.length > 0) {
      const request = pendingRequests[0];
      if (request.path.startsWith('subscribe')) {
        pendingRequests.shift();
        continue;
      } else if (request.path.startsWith('unsubscribe')) {
        pendingRequests.shift();
        continue;
      }
      sendMessage(request);
      pendingRequests.shift();
    }
  };

  const onClose = (store: any) => () => {
    connectionEstablished = false;
    socket = null;
    setTimeout(() => connect(store), 1000);
  };

  const onMessage = (store: any) => (event: any) => {
    const data = JSON.parse(event.data);
    const path: string = data.path;

    let callback = callbacks[path];
    if (callback !== undefined) {
      store.dispatch(callback(data.content));
    }
    else {
      let backUp = JSON.stringify(data.content);

      for (let property in callbacks) {
        let regex = new RegExp(`^${property.split(new RegExp(':[^/]+')).join('[^/]+')}$`);
        if (path.match(regex) !== null) {
          data.content = JSON.parse(backUp);

          const parts = path.split('/');
          const propertyParts = property.split('/');

          for (let i = 0; i < propertyParts.length; i++) {
            if (propertyParts[i].startsWith(':')) {
              data.content[propertyParts[i].substring(1)] = parts[i];
            }
          }

          store.dispatch(callbacks[property](data.content));
        }
      }
    }
  };

  return (store: any) => (next: any) => (action: any) => {
    switch (action.type) {
      case GlobalActions.Initialize: {
        connect(store);
        callbacks['updateQueue/:queueName'] = Listeners.onQueueUpdated;
        break;
      }

      case AdministratorActions.AddAdministrator: {
        sendMessage(new RequestMessage('addSuperAdmin', { username: action.payload.username }));
        break;
      }

      case AdministratorActions.RemoveAdministrator: {
        sendMessage(new RequestMessage('removeSuperAdmin', { username: action.payload.username }));
        break;
      }

      case AdministratorActions.AddTeacher: {
        sendMessage(new RequestMessage(`addTeacher/${action.payload.queueName}`, { username: action.payload.username }));
        break;
      }

      case AdministratorActions.RemoveTeacher: {
        sendMessage(new RequestMessage(`removeTeacher/${action.payload.queueName}`, { username: action.payload.username }));
        break;
      }

      case AdministratorActions.AddAssistant: {
        sendMessage(new RequestMessage(`addAssistant/${action.payload.queueName}`, { username: action.payload.username }));
        break;
      }

      case AdministratorActions.RemoveAssistant: {
        sendMessage(new RequestMessage(`removeAssistant/${action.payload.queueName}`, { username: action.payload.username }));
        break;
      }

      case AdministratorActions.AddQueue: {
        sendMessage(new RequestMessage(`addQueue/${action.payload.queueName}`));
        break;
      }

      case AdministratorActions.RemoveQueue: {
        sendMessage(new RequestMessage(`removeQueue/${action.payload.queueName}`));
        break;
      }

      case AdministratorActions.HideQueue: {
        sendMessage(new RequestMessage(`setQueueHideStatus/${action.payload.queueName}`, {
          status: true
        }));
        break;
      }

      case AdministratorActions.RevealQueue: {
        sendMessage(new RequestMessage(`setQueueHideStatus/${action.payload.queueName}`, {
          status: false
        }));
        break;
      }

      case AdministratorActions.SetServerMessage: {
        sendMessage(new RequestMessage(`broadcastServer`, {
          message: action.payload.message
        }));
        break;
      }

      case QueueActions.JoinQueue: {
        sendMessage(new RequestMessage(`joinQueue/${action.payload.queueName}`, {
          location: action.payload.location,
          comment: action.payload.comment,
          help: action.payload.help
        }));
        break;
      }

      case QueueActions.LeaveQueue: {
        sendMessage(new RequestMessage(`leaveQueue/${action.payload.queueName}`));
        break;
      }

      case QueueActions.RecievingHelp: {
        sendMessage(new RequestMessage(`setHelpStatus/${action.payload.queueName}`, {
          status: action.payload.status
        }));
        break;
      }

      case QueueActions.UpdatePersonalEntry: {
        sendMessage(new RequestMessage(`updateQueueEntry/${action.payload.queueName}`, {
          comment: action.payload.comment,
          location: action.payload.location,
          help: action.payload.help
        }));
        break;
      }

      case QueueActions.SubscribeToQueue: {
        callbacks['joinQueue/:queueName'] = Listeners.onQueueEntryAdded;
        callbacks['leaveQueue/:queueName'] = Listeners.onQueueEntryRemoved;
        callbacks['updateQueueEntry/:queueName'] = Listeners.onQueueEntryUpdated;

        const message = new RequestMessage(`subscribeQueue/${action.payload.queueName}`);
        lastJoinRequest = message;

        sendMessage(message);
        break;
      }

      case QueueActions.UnsubscribeToQueue: {
        delete callbacks['joinQueue/:queueName'];
        delete callbacks['leaveQueue/:queueName'];
        delete callbacks['updateQueue/:queueName'];

        if (lastJoinRequest?.path === `subscribeQueue/${action.payload.queueName}`) {
          lastJoinRequest = null;
        }

        const message = new RequestMessage(`unsubscribeQueue/${action.payload.queueName}`);
        sendMessage(message);
        break;
      }

      case LobbyActions.SubscribeToLobby: {
        const message = new RequestMessage('subscribeLobby');
        lastJoinRequest = message;

        sendMessage(message);
        break;
      }

      case LobbyActions.UnsubscribeToLobby: {
        delete callbacks['joinQueue/lobby'];
        delete callbacks['leaveQueue/lobby'];

        if (lastJoinRequest?.path === 'subscribeLobby') {
          lastJoinRequest = null;
        }

        const message = new RequestMessage('unsubscribeLobby');
        sendMessage(message);
        break;
      }

      // TODO: I don't want to allow the developer to use Listen/StopListening
      // I'd rather move that logic here instead in order to only have one design
      case SocketActions.Listen: {
        callbacks[action.payload.path] = action.payload.callback;
        break;
      }

      case SocketActions.StopListening: {
        delete callbacks[action.payload.path];
        break;
      }

      case UserActions.Login.Fulfilled: {
        token = action.payload.data.token;
        callbacks['message'] = Listeners.onMessageRecieved;
        callbacks['message/:queueName'] = Listeners.onMessageRecieved;
        break;
      }

      case UserActions.Logout: {
        sendMessage(new RequestMessage('logout'));
        token = null;
        delete callbacks['message'];
        delete callbacks['message/:queueName'];
        break;
      }

      case UserActions.LoadUser: {
        const userData = localStorage.getItem('User');
        token = userData ? JSON.parse(userData).token : null;
        callbacks['message'] = Listeners.onMessageRecieved;
        callbacks['message/:queueName'] = Listeners.onMessageRecieved;
        break;
      }

      case AssistantActions.KickUser: {
        sendMessage(new RequestMessage(`kick/${action.payload.queueName}`, {
          ugkthid: action.payload.ugkthid,
          message: action.payload.message
        }));
        break;
      }

      case AssistantActions.SendMessage: {
        sendMessage(new RequestMessage(`sendMessage/${action.payload.queueName}`, {
          ugkthid: action.payload.ugkthid,
          message: action.payload.message
        }));
        break;
      }

      case AssistantActions.Help: {
        sendMessage(new RequestMessage(`setUserHelpStatus/${action.payload.queueName}`, {
          ugkthid: action.payload.ugkthid,
          status: action.payload.newStatus
        }));
        break;
      }

      case AssistantActions.BadLocation: {
        sendMessage(new RequestMessage(`badLocation/${action.payload.queueName}`, {
          ugkthid: action.payload.ugkthid
        }));
        break;
      }

      case AssistantActions.Broadcast: {
        sendMessage(new RequestMessage(`broadcast/${action.payload.queueName}`, {
          message: action.payload.message
        }));
        break;
      }

      case AssistantActions.BroadcastFaculty: {
        sendMessage(new RequestMessage(`broadcastFaculty/${action.payload.queueName}`, {
          message: action.payload.message
        }));
        break;
      }

      case AssistantActions.SetMotd: {
        sendMessage(new RequestMessage(`setMOTD/${action.payload.queueName}`, {
          message: action.payload.message
        }));
        break;
      }

      case AssistantActions.SetQueueInfo: {
        sendMessage(new RequestMessage(`setQueueInfo/${action.payload.queueName}`, {
          message: action.payload.info
        }));
        break;
      }

      case AssistantActions.PurgeQueue: {
        sendMessage(new RequestMessage(`purgeQueue/${action.payload.queueName}`));
        break;
      }

      case AssistantActions.LockQueue: {
        sendMessage(new RequestMessage(`setQueueLockStatus/${action.payload.queueName}`, {
          status: true
        }));
        break;
      }

      case AssistantActions.UnlockQueue: {
        sendMessage(new RequestMessage(`setQueueLockStatus/${action.payload.queueName}`, {
          status: false
        }));
        break;
      }
    }

    return next(action);
  };
};

export default middleware();
