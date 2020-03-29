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
    this._comment = data.comment;
    this._location = data.location;
    this._starttime = data.starttime;
    this._gettinghelp = data.gettinghelp;
    this._helper = data.helper;
    this._help = data.help;
    this._badlocation = data.badlocation;
    this._username = data.username;
    this._ugkthid = data.ugkthid;
    this._realname = data.realname;
  }

  public static InitialValue: QueueEntry =
    new QueueEntry(
      {
        comment: 'I need assistance',
        location: 'Red 01',
        starttime: Date.now(),
        gettinghelp: false,
        helper: null,
        help: true,
        badlocation: false,
        username: 'antbac',
        ugkthid: 'u_123456789',
        realname: 'Anton Bäckström'
      }
    );
}
