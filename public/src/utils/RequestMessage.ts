export default class RequestMessage {

  private _path: string;
  public get path() { return this._path; }

  private _content: any;
  public get content() { return this._content; }

  public constructor(path: string, content: any) {
    this._path = path;
    this._content = content;
  }

  public stringify(): string {
    return JSON.stringify(
      {
        path: this._path,
        content: this._content
      }
    );
  }

}
