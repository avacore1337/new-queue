import RequestMessage from './RequestMessage';
import User from '../models/User';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: RequestMessage[];
  private _lastJoinRequest: RequestMessage | null;
  private _user: User | null;

  public constructor(serverUrl: string, user: User | null) {
    this._callbacks = {};
    this._pendingRequests = [];
    this._lastJoinRequest = null;
    this._connectionEstablished = false;
    this._socket = new WebSocket(serverUrl);

    this._user = user;

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
        if (request.path.startsWith('/subscribe')) {
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

      console.log(event);

      let callback = this._callbacks[path];
      if (callback !== undefined) {
        callback(data.content);
      }
    };

    this._socket.onclose = (): any | undefined => {
      this._connectionEstablished = false;
      this.connect(serverUrl);
    };
  }

  public joinQueue(room: string, onJoin?: (data: any) => void, onLeave?: (data: any) => void, onUpdate?: (data: any) => void): void {
    this._callbacks[`/joinQueue/${room}`] = onJoin;
    this._callbacks[`/leaveQueue/${room}`] = onLeave;
    this._callbacks[`/updateQueue/${room}`] = onUpdate;

    const message = new RequestMessage('/subscribeQueue', { room: room });
    this._lastJoinRequest = message;

    this.send(message);
  }

  public joinLobby(onJoin?: (data: any) => void, onLeave?: (data: any) => void): void {
    this._callbacks['/joinQueue/lobby'] = onJoin;
    this._callbacks['/leaveQueue/lobby'] = onLeave;

    const message = new RequestMessage('/subscribeLobby', { room: 'lobby' });
    this._lastJoinRequest = message;

    this.send(message);
  }

  public leaveQueue(room: string): void {
    delete this._callbacks[`/joinQueue/${room}`];
    delete this._callbacks[`/leaveQueue/${room}`];
    delete this._callbacks[`/updateQueue/${room}`];

    const message = new RequestMessage('/unsubscribeQueue', { room: room });
    this.send(message);
  }

  public leaveLobby(): void {
    delete this._callbacks['/joinQueue/lobby'];
    delete this._callbacks['/leaveQueue/lobby'];

    const message = new RequestMessage('/unsubscribeLobby', { room: 'lobby' });
    this.send(message);
  }

  public close(): void {
    this._socket.close();
  }

  public send(message: RequestMessage, callback?: (data: any) => void): void {
    if (callback !== undefined) {
      this._callbacks[message.path] = callback;
    }

    if (this._connectionEstablished) {
      message.content.token = this._user?.token || "";
      this._socket.send(message.stringify());
    }
    else {
      this._pendingRequests.push(message);
    }
  }
}
