export default class PersonalQueueEntry {

  private _location: string;
  public get location() { return this._location; }

  private _comment: string;
  public get comment() { return this._comment; }

  private _typeOfCommunication: string;
  public get typeOfCommunication() { return this._typeOfCommunication; }

  public constructor(data: any) {
    this._location = data.location || '';
    this._comment = data.comment || '';
    this._typeOfCommunication = data.typeOfCommunication || '';
  }

  public resetComment(): void {
    this._comment = '';
  }

  public resetTypeOfCommunication(): void {
    this._typeOfCommunication = '';
  }

  public clone(): PersonalQueueEntry {
    return new PersonalQueueEntry({
      location: this._location,
      comment: this._comment,
      typeOfCommunication: this._typeOfCommunication,
    });
  }
}
