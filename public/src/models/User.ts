export default class User {

  private _ugkthid: string;
  public get ugkthid() { return this._ugkthid; }

  private _token: string;
  public get token() { return this._token; }

  private _name: string;
  public get name() { return this._name; }

  private _username: string;
  public get username() { return this._username; }

  private _isAdministrator: boolean;
  public get isAdministrator() { return this._isAdministrator; }

  private _location: string;
  public get location() { return this._location; }

  private _teacherIn: string[];
  public get teacherIn() { return this._teacherIn; }

  private _assistantIn: string[];

  public constructor(data: any) {
    this._ugkthid = data.ugkthid || '';
    this._name = data.name || '';
    this._username = data.username || '';
    this._isAdministrator = data.isAdministrator || true;
    this._teacherIn = data.teacherIn || [];
    this._assistantIn = data.AssistantIn || [];
    this._token = data.token || '';
    this._location = data.location || '';
    this._teacherIn = data.teacherIn || [];
    this._assistantIn = data.assistantIn || [];
  }

  public isTeacher(): boolean {
    return this._teacherIn.length > 0;
  }

  public isTeacherIn(queue: string): boolean {
    return this._teacherIn.includes(queue);
  }

  public isAssistant(): boolean {
    return this._assistantIn.length > 0;
  }

  public isAssistantIn(queue: string): boolean {
    return this._assistantIn.includes(queue);
  }

  public clone(): User {
    return new User({
      ugkthid: this._ugkthid,
      token: this._token,
      name: this._name,
      username: this._username,
      isAdministrator: this._isAdministrator,
      location: this._location,
      teacherIn: this._teacherIn,
      assistantIn: this._assistantIn
    });
  }
}
