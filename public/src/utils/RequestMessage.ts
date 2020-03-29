export default class RequestMessage {

  private _operation: string;
  private _data: any;

  public constructor(operation: string, data: any) {
    this._operation = operation;
    this._data = data;
  }

  public stringify(): string {
    return JSON.stringify(
      {
        operation: this._operation,
        data: this._data
      }
    );
  }

}
