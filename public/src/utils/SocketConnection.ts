import store from '../store';
import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: RequestMessage[];
  private _lastJoinRequest: RequestMessage | null;
  private _token: string | null;

  public constructor(serverUrl: string) {
    this._callbacks = {};
    this._pendingRequests = [];
    this._lastJoinRequest = null;
    this._connectionEstablished = false;
    this._socket = new WebSocket(serverUrl);

    this._token = null;

    this.connect(serverUrl);
  }

  private connect(serverUrl: string): void {
    this._socket = new WebSocket(serverUrl);
    this._socket.onopen = (): void => {
      this._connectionEstablished = true;

      if (this._lastJoinRequest !== null) {
        this.send(this._lastJoinRequest);
      }

      while (this._pendingRequests.length > 0) {
        const request = this._pendingRequests[0];
        if (request.path.startsWith('subscribe')) {
          this._pendingRequests.shift();
          continue;
        }
        this.send(request);
        this._pendingRequests.shift();
      }
    };

    this._socket.onmessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data);
      const path: string = data.path;

      let callback = this._callbacks[path];
      if (callback !== undefined) {
        store.dispatch(callback(data.content));
      }
      else {
        let backUp = JSON.stringify(data.content);

        for (let property in this._callbacks) {
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

            store.dispatch(this._callbacks[property](data.content));
          }
        }
      }
    };

    this._socket.onclose = (): any | undefined => {
      this._connectionEstablished = false;
      this.connect(serverUrl);
    };
  }

  public setToken(token: string | null): void {
    this._token = token;
  }

  public listen(path: string, callback: (data: any) => void): void {
    this._callbacks[path] = callback;
  }

  public stopListening(path: string): void {
    delete this._callbacks[path];
  }

  public enterQueue(room: string, onJoin?: (data: any) => void, onLeave?: (data: any) => void, onUpdate?: (data: any) => void): void {
    this._callbacks['joinQueue/:queueName'] = onJoin;
    this._callbacks['leaveQueue/:queueName'] = onLeave;
    this._callbacks['updateQueueEntry/:queueName'] = onUpdate;

    const message = new RequestMessage(`subscribeQueue/${room}`);
    this._lastJoinRequest = message;

    this.send(message);
  }

  public enterLobby(onJoin?: (data: any) => void, onLeave?: (data: any) => void): void {
    this._callbacks['joinQueue/lobby'] = onJoin;
    this._callbacks['leaveQueue/lobby'] = onLeave;

    const message = new RequestMessage('subscribeLobby');
    this._lastJoinRequest = message;

    this.send(message);
  }

  public leaveQueue(room: string): void {
    delete this._callbacks['joinQueue/:queueName'];
    delete this._callbacks['leaveQueue/:queueName'];
    delete this._callbacks['updateQueue/:queueName'];

    if (this._lastJoinRequest?.path === `subscribeQueue/${room}`) {
      this._lastJoinRequest = null;
    }

    const message = new RequestMessage(`unsubscribeQueue/${room}`);
    this.send(message);
  }

  public leaveLobby(): void {
    delete this._callbacks['joinQueue/lobby'];
    delete this._callbacks['leaveQueue/lobby'];

    if (this._lastJoinRequest?.path === 'subscribeLobby') {
      this._lastJoinRequest = null;
    }

    const message = new RequestMessage('unsubscribeLobby');
    this.send(message);
  }

  public send(message: RequestMessage, callback?: (data: any) => void): void {
    if (callback !== undefined) {
      this._callbacks[message.path] = callback;
    }

    if (this._connectionEstablished) {
      message.token = this._token || "";
      this._socket.send(message.stringify());
    }
    else {
      this._pendingRequests.push(message);
    }
  }

  public close(): void {
    this._socket.close();
  }
}
