export default class RequestMessage {

  private _path: string;
  public get path() { return this._path; }

  private _token: string;
  public get token() { return this._token; }
  public set token(value: string) { this._token = value; }

  private _content: any;
  public get content() { return this._content; }

  public constructor(path: string, content?: any) {
    this._path = path;
    this._content = content || {};

    this._token = "";
  }

  public stringify(): string {
    return JSON.stringify(
      {
        path: this._path,
        token: this._token,
        content: this._content
      }
    );
  }

}
