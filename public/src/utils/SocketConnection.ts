import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: RequestMessage[];

  public constructor(serverUrl: string) {
    console.log('Calling constructor');

    this._callbacks = {};
    this._pendingRequests = [];

    this._connectionEstablished = false;
    this._socket = new WebSocket(serverUrl);
    this._socket.onopen = () => {
      this._connectionEstablished = true;
      for (const request of this._pendingRequests) {
        this.send(request);
      }
    };

    this._socket.onmessage = (event: MessageEvent) => {
      console.log(event);
      let callback = this._callbacks[JSON.parse(event.data).path]
      console.log(callback);
      if (callback !== undefined) {
        console.log(JSON.parse(event.data).content);
        callback(JSON.parse(event.data).content);
      }
    };
  }

  public joinRoom(room: string, callback: (data: any) => void): void {
    this._callbacks[room] = callback;

    const message = new RequestMessage('joinRoom', { room: room });
    this.send(message);
  }

  public leaveRoom(room: string): void {
    delete this._callbacks[room];

    const message = new RequestMessage('leaveRoom', { room: room });
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
