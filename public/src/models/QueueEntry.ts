export default class QueueEntry {

  private _name: string;
  public get name() { return this._name; }

  private _kthuid: string;
  public get kthuid() { return this._kthuid; }

  private _location: string;
  public get location() { return this._location; }

  private _typeOfCommunication: string;
  public get typeOfCommunication() { return this._typeOfCommunication; }

  private _comment: string;
  public get comment() { return this._comment; }

  private _timeOfEntry: Date;
  public get timeOfEntry() { return this._timeOfEntry; }

  public constructor(data: any) {
    this._name = data.name;
    this._kthuid = data.kthuid;
    this._location = data.location;
    this._typeOfCommunication = data.typeOfCommunication;
    this._comment = data.comment;
    this._timeOfEntry = data.timeOfEntry;
  }

  public static InitialValue: QueueEntry =
    new QueueEntry(
      {
        name: 'Anton Bäckström',
        location: 'Red 01',
        typeOfCommunication: 'help',
        comment: 'I need assistance',
        timeOfEntry: Date.now()
      }
    );
}
