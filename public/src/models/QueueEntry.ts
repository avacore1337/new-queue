export default class QueueEntry {

  private _comment: string;
  public get comment() { return this._comment; }

  private _location: string;
  public get location() { return this._location; }

  private _starttime: number;
  public get starttime() { return this._starttime; }

  private _gettinghelp: boolean;
  public get gettinghelp() { return this._gettinghelp; }

  private _helper: string;
  public get helper() { return this._helper; }

  private _help: boolean;
  public get help() { return this._help; }

  private _badlocation: boolean;
  public get badlocation() { return this._badlocation; }

  private _username: string;
  public get username() { return this._username; }

  private _ugkthid: string;
  public get ugkthid() { return this._ugkthid; }

  private _realname: string;
  public get realname() { return this._realname; }

  public constructor(data: any) {
    this._comment = data.comment || '';
    this._location = data.location || '';
    this._starttime = data.starttime || 0;
    this._gettinghelp = data.gettinghelp || false;
    this._helper = data.helper || '';
    this._help = data.help || false;
    this._badlocation = data.badlocation || false;
    this._username = data.username || '';
    this._ugkthid = data.ugkthid || '';
    this._realname = data.realname || '';
  }

  public clone(): QueueEntry {
    return new QueueEntry({
      comment: this._comment,
      location: this._location,
      starttime: this._starttime,
      gettinghelp: this._gettinghelp,
      helper: this._helper,
      help: this._help,
      badlocation: this._badlocation,
      username: this._username,
      ugkthid: this._ugkthid,
      realname: this._realname,
    });
  }
}
