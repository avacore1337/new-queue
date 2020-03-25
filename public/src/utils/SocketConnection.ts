import socketIo from 'socket.io-client';

export default class SocketConnection {

  private socket: SocketIOClient.Socket;

  public constructor(serverUrl: string) {
    this.socket = socketIo(serverUrl);
  }

  public joinRoom(room: string, callback: (data: any) => void): void {
    this.socket.emit('joinQueue', {queueName: room});
    this.socket.on(room, (data: any) => callback(data));
  }

  public leaveRoom(room: string): void {
    this.socket.emit('leaveQueue', {queueName: room});
    this.socket.off(room);
  }

  public send(room: string, data: any): void {
    this.socket.emit(room, data);
  }
}
