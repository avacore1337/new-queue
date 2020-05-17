import store from '../store';
import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket | null;
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
    this._socket = null;

    this._token = null;

    console.log('Initial socket creation (this should only occur once)');

    this.connect(serverUrl);
  }

  private connect(serverUrl: string): void {
    console.log('Starting connection to server');

    this._socket = new WebSocket(serverUrl);
    this._socket.onopen = (): void => {
      console.log('Connection established');

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

      console.log('Sent all queued requests (if there were any)');
    };

    this._socket.onmessage = (event: MessageEvent): void => {
      const data = JSON.parse(event.data);
      const path: string = data.path;

      console.log(`Recieved a message from the server: <${data.path}> => ${JSON.stringify(event.data)}`);

      console.log(`Active listeners:\n${Object.keys(this._callbacks).join('\n')}`);

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
      console.log('Closed connection to server');
      this._connectionEstablished = false;

      const self = this;
      setTimeout(function() {
        self.connect(serverUrl);
        console.log('Triggered reconnect attempt');
      }, 1000);
    };
  }

  public setToken(token: string | null): void {
    this._token = token;
  }

  public listen(path: string, callback: (data: any) => void): void {
    this._callbacks[path] = callback;
    console.log('Registered ' + path);
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

    if (this._connectionEstablished && this._socket !== null) {
      message.token = this._token || "";
      this._socket.send(message.stringify());
    }
    else {
      this._pendingRequests.push(message);
    }
  }

  // public clone(): SocketConnection {
  //
  // }
}
