import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: RequestMessage[];
  private _lastJoinRequest: RequestMessage | null;

  public constructor(serverUrl: string) {
    this._callbacks = {};
    this._pendingRequests = [];
    this._lastJoinRequest = null;
    this._connectionEstablished = false;
    this._socket = new WebSocket(serverUrl);

    this.connect(serverUrl);
  }

  private connect(serverUrl: string): void {
    this._socket = new WebSocket(serverUrl);
    this._socket.onopen = () => {
      this._connectionEstablished = true;

      if (this._lastJoinRequest !== null) {
        this.send(this._lastJoinRequest);
      }

      for (const request of this._pendingRequests) {
        this.send(request);
      }
    };

    this._socket.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      const path: string = data.path;

      let callback = this._callbacks[path];
      if (callback !== undefined) {
        callback(data.content);
      }
    };

    this._socket.onclose = (event: CloseEvent): any | undefined => {
      this._connectionEstablished = false;
      this.connect(serverUrl);
    };
  }

  public joinRoom(room: string, callback?: (data: any) => void): void {
    this._callbacks[`/join/${room}`] = callback;

    const message = new RequestMessage('/join', { room: room });
    this._lastJoinRequest = message;

    this.send(message);
  }

  public leaveRoom(room: string): void {
    delete this._callbacks[`/join/${room}`];

    const message = new RequestMessage('/leave', { room: room });
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
      this._socket.send(message.stringify());
    }
    else {
      this._pendingRequests.push(message);
    }
  }
}
