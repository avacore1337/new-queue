export default class Teacher {

  private _realname: string;
  public get realname() { return this._realname; }

  private _username: string;
  public get username() { return this._username; }

  private _addedBy: string;
  public get addedBy() { return this._addedBy; }

  public constructor(data: any) {
    this._realname = data.realname;
    this._username = data.username;
    this._addedBy = data.addedBy;
  }
}
