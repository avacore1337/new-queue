import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: string[];

  public constructor(serverUrl: string) {
    this._callbacks = {};
    this._pendingRequests = [];

    this._connectionEstablished = false;
    this._socket = new WebSocket(serverUrl);
    this._socket.onopen = () => {
      this._connectionEstablished = true;
      for (const request of this._pendingRequests) {
        this._socket.send(request);
      }
    };

    this._socket.onmessage = (event: MessageEvent) => {
      let callback = this._callbacks[JSON.parse(event.data).operation]
      if (callback !== undefined) {
        callback(JSON.parse(event.data).data);
      }
    };
  }

  public stopDebug(): void {
    delete this._callbacks.debug;

    const message = new RequestMessage('stopDebug', null);
    this.send(message.stringify());
  }

  public startDebug(callback: (data: any) => void): void {
    this._callbacks.debug = callback;

    const message = new RequestMessage('startDebug', null);
    this.send(message.stringify());
  }

  public joinRoom(room: string, callback: (data: any) => void): void {
    this._callbacks[room] = callback;

    const message = new RequestMessage('joinRoom', { room: room });
    this.send(message.stringify());
  }

  public leaveRoom(room: string): void {
    delete this._callbacks[room];

    const message = new RequestMessage('leaveRoom', { room: room });
    this.send(message.stringify());
  }

  private send(message: any): void {
    if (this._connectionEstablished) {
      this._socket.send(message);
    }
    else {
      this._pendingRequests.push(message);
    }
  }
}
