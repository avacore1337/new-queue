export default class Banner {

  private _id: number;
  public get id() { return this._id; }

  private _message: string;
  public get message() { return this._message; }

  private _startTime: number;
  public get startTime() { return this._startTime; }

  private _endTime: number;
  public get endTime() { return this._endTime; }

  public constructor(data: any) {
    this._id = data.id;
    this._message = data.message;
    this._startTime = new Date(data.startTime).getTime();
    this._endTime = new Date(data.endTime).getTime();
  }

  public clone(): Banner {
    return new Banner({
      id: this._id,
      message: this._message,
      startTime: this._startTime,
      endTime: this._endTime
    });
  }
}
