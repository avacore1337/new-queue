export default class User {

  private _ugkthid: string;
  public get ugkthid() { return this._ugkthid; }

  private _name: string;
  public get name() { return this._name; }

  private _isAdministrator: boolean;
  public get isAdministrator() { return this._isAdministrator; }

  private _teacherIn: string[];
  private _teachingAssistantIn: string[];

  public constructor(data: any) {
    this._ugkthid = data.ugkthid;
    this._name = data.name;
    this._isAdministrator = data.isAdministrator;
    this._teacherIn = data.teacherIn;
    this._teachingAssistantIn = data.teachingAssistantIn;
  }

  public isTeacher(): boolean {
    return this._teacherIn.length > 0;
  }

  public isTeacherIn(queue: string): boolean {
    return this._teacherIn.includes(queue);
  }

  public isTeachingAssistant(): boolean {
    return this._teachingAssistantIn.length > 0;
  }

  public isTeachingAssistantIn(queue: string): boolean {
    return this._teachingAssistantIn.includes(queue);
  }

  // public static InitialValue: User | null = null;

  public static InitialValue: User | null = new User({
    ugkthid: 'u_123456789',
    name: 'Anton Bäckström',
    isAdministrator: true,
    teacherIn: ['TestQueue 1'],
    teachingAssistantIn: ['TestQueue 2']
  });

  // public static InitialValue: User | null = new User({
  //   ugkthid: 'u_123456789',
  //   name: 'Anton Bäckström',
  //   isAdministrator: false,
  //   teacherIn: ['TestQueue 3'],
  //   teachingAssistantIn: []
  // });
}
