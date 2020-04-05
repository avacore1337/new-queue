import RequestMessage from './RequestMessage';

export default class SocketConnection {

  private _socket: WebSocket;
  private _callbacks: any;
  private _errorCallbacks: any;
  private _connectionEstablished: boolean;
  private _pendingRequests: RequestMessage[];

  public constructor(serverUrl: string) {
    this._callbacks = {};
    this._errorCallbacks = {};
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
      const data = JSON.parse(event.data);
      const path: string = data.path;

      if (path === '/error') {
        const callingPath = data.content.substring(21).substring(0, data.content.substring(21).indexOf('\\"'));
        let errorCallback = this._errorCallbacks[callingPath];
        if (errorCallback !== undefined) {
          errorCallback(data.content);
        }
      }
      else {
        let callback = this._callbacks[path];
        if (callback !== undefined) {
          callback(data.content);
        }
      }
    };
  }

  public joinRoom(room: string, onSuccess: (data: any) => void, onError?: (data: any) => void): void {
    this._callbacks['/join'] = onSuccess;
    this._errorCallbacks['/join'] = onError;

    const message = new RequestMessage('/join', { room: room });
    this.send(message);
  }

  public leaveRoom(room: string): void {
    delete this._callbacks['/join'];
    delete this._errorCallbacks['/join'];

    const message = new RequestMessage('/leave', { room: room });
    this.send(message);
  }

  public close(): void {
    this._socket.close();
  }

  public send(message: RequestMessage, onSuccess?: (data: any) => void, onError?: (data: any) => void): void {
    if (onSuccess !== undefined) {
      this._callbacks[message.path] = onSuccess;
    }

    if (onError !== undefined) {
      this._errorCallbacks[message.path] = onError;
    }

    if (this._connectionEstablished) {
      this._socket.send(message.stringify());
    }
    else {
      this._pendingRequests.push(message);
    }
  }
}
