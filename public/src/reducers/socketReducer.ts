import { FluxStandardAction } from 'redux-promise-middleware';
import { WEB_SOCKET_SERVER_URL } from '../configuration';
import { ActionTypes as AdministratorActionTypes } from '../actions/administratorActions';
import { ActionTypes as QueueActionTypes } from '../actions/queueActions';
import { ActionTypes as LobbyActionTypes } from '../actions/lobbyActions';
import { ActionTypes as SocketActionTypes } from '../actions/socketActions';
import { ActionTypes as UserActionTypes } from '../actions/userActions';
import { ActionTypes as AssistantActionTypes } from '../actions/assistantActions';
import { ActionTypes as DebugActionTypes } from '../actions/debugActions';
import SocketConnection from '../utils/SocketConnection';
import RequestMessage from '../utils/RequestMessage';

const socket: SocketConnection = new SocketConnection(WEB_SOCKET_SERVER_URL);

export default (_ = socket, action: FluxStandardAction) => {
  switch (action.type) {

    case AdministratorActionTypes.AddAdministrator: {
      socket.send(new RequestMessage('addSuperAdmin', { username: action.payload }));
      break;
    }

    case AdministratorActionTypes.RemoveAdministrator: {
      socket.send(new RequestMessage('removeSuperAdmin', { username: action.payload }));
      break;
    }

    case AdministratorActionTypes.AddTeacher: {
      socket.send(new RequestMessage(`addTeacher/${action.payload.queueName}`, { username: action.payload.username }));
      break;
    }

    case AdministratorActionTypes.RemoveTeacher: {
      socket.send(new RequestMessage(`removeTeacher/${action.payload.queueName}`, { username: action.payload.username }));
      break;
    }

    case AdministratorActionTypes.AddAssistant: {
      socket.send(new RequestMessage(`addAssistant/${action.payload.queueName}`, { username: action.payload.username }));
      break;
    }

    case AdministratorActionTypes.RemoveAssistant: {
      socket.send(new RequestMessage(`removeAssistant/${action.payload.queueName}`, { username: action.payload.username }));
      break;
    }

    case AdministratorActionTypes.AddQueue: {
      socket.send(new RequestMessage(`addQueue/${action.payload.queueName}`));
      break;
    }

    case AdministratorActionTypes.RemoveQueue: {
      socket.send(new RequestMessage(`removeQueue/${action.payload.queueName}`));
      break;
    }

    case QueueActionTypes.JoinQueue: {
      socket.send(new RequestMessage(`joinQueue/${action.payload.queueName}`, {
        location: action.payload.location,
        comment: action.payload.comment,
        help: action.payload.typeOfCommunication === 'help'
      }));
      break;
    }

    case QueueActionTypes.LeaveQueue: {
      alert('Not yet implemented');
      break;
    }

    case QueueActionTypes.SubscribeToQueue: {
      socket.enterQueue(action.payload);
      break;
    }

    case QueueActionTypes.UnsubscribeToQueue: {
      socket.leaveQueue(action.payload);
      break;
    }

    case LobbyActionTypes.SubscribeToLobby: {
      socket.enterLobby();
      break;
    }

    case LobbyActionTypes.UnsubscribeToLobby: {
      socket.leaveLobby();
      break;
    }

    case QueueActionTypes.JoinQueue: {
      socket.send(new RequestMessage(action.payload));
      break;
    }

    case SocketActionTypes.Listen: {
      socket.listen(action.payload.path, action.payload.callback);
      break;
    }

    case SocketActionTypes.StopListening: {
      socket.stopListening(action.payload);
      break;
    }

    case SocketActionTypes.CloseSocket: {
      socket.close();
      break;
    }

    case UserActionTypes.Login: {
      socket.setToken(action.payload.data.user.token);
      break;
    }

    case UserActionTypes.Logout: {
      socket.send(new RequestMessage('logout'));
      socket.setToken(null);
      break;
    }

    case UserActionTypes.LoadUser: {
      const userData = localStorage.getItem('User');
      socket.setToken(userData ? JSON.parse(userData).token : null);
      break;
    }

    case AssistantActionTypes.KickUser: {
      socket.send(new RequestMessage(`kickUser/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid,
        message: action.payload.message
      }));
      break;
    }

    case AssistantActionTypes.SendMessage: {
      socket.send(new RequestMessage(`sendMessage/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid,
        message: action.payload.message
      }));
      break;
    }

    case AssistantActionTypes.Help: {
      socket.send(new RequestMessage(`help/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid
      }));
      break;
    }

    case AssistantActionTypes.BadLocation: {
      socket.send(new RequestMessage(`badLocation/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid
      }));
      break;
    }

    case AssistantActionTypes.Completion: {
      socket.send(new RequestMessage(`completion/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid
      }));
      break;
    }

    case AssistantActionTypes.AddComment: {
      socket.send(new RequestMessage(`addComment/${action.payload.queueName}`, {
        ugkthid: action.payload.ugkthid,
        comment: action.payload.comment
      }));
      break;
    }

    case DebugActionTypes.SendDebugMessage: {
      socket.send(new RequestMessage(action.payload.path, action.payload.json));
      break;
    }

  }

  return socket;
};
