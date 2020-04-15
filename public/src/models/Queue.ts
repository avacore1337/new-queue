import QueueEntry from './QueueEntry';
import Assistant from './TeachingAssistant';
import Teacher from './Teacher';

export default class Queue {

  private _id: number;
  public get id() { return this._id; }

  private _name: string;
  public get name() { return this._name; }

  private _info: string;
  public get info() { return this._info; }

  private _motd: string;
  public get motd() { return this._motd; }

  private _locked: boolean;
  public get locked() { return this._locked; }

  private _hiding: boolean;
  public get hiding() { return this._hiding; }

  private _queueEntries: QueueEntry[];
  public get queueEntries() { return this._queueEntries; }

  private _assistants: Assistant[];
  public get assistants() { return this._assistants; }

  private _teachers: Teacher[];
  public get teachers() { return this._teachers; }

  public constructor(data: any) {
    this._id = data.id;
    this._name = data.name;
    this._info = data.info;
    this._motd = data.motd;
    this._locked = data.locked;
    this._hiding = data.hiding;
    this._assistants = data.assistants || [];
    this._teachers = data.teachers || [];
    this._queueEntries = [QueueEntry.InitialValue];
  }

  public addAssistant(assistant: Assistant): void {
    this._assistants.push(assistant);
  }

  public setAssistants(assistants: Assistant[]): void {
    this._assistants = assistants;
  }

  public removeAssistant(assistant: Assistant): void {
    this._assistants = this._assistants.filter(a => a.username !== assistant.username);
  }

  public addTeacher(teacher: Teacher): void {
    this._teachers.push(teacher);
  }

  public setTeachers(teachers: Teacher[]): void {
    this._teachers = teachers;
  }

  public removeTeacher(teacher: Teacher): void {
    this._teachers = this._teachers.filter(a => a.username !== teacher.username);
  }

  // public add(user: QueueEntry) {
  //   this.queueEntries.push(user);
  // }
  //
  // public remove(user: QueueEntry) {
  //   let index = 0;
  //   while (index < this.queueEntries.length) {
  //     if (this.queueEntries[index].kthuid === user.kthuid) {
  //       this.queueEntries.splice(index, 1);
  //     }
  //     else {
  //       index++;
  //     }
  //   }
  // }

  // public static InitialValue: Queue[] = [];

  public static InitialValue: Queue[] = [
    new Queue({name: 'TestQueue 1', info: 'Info 1', motd: 'Motd 1', locked: false, hiding: false}),
    new Queue({name: 'TestQueue 2', info: 'Info 2', motd: 'Motd 2', locked: true, hiding: false}),
    new Queue({name: 'TestQueue 3', info: 'Info 3', motd: 'Motd 3', locked: false, hiding: true}),
    new Queue({name: 'TestQueue 4', info: 'Info 4', motd: 'Motd 4', locked: true, hiding: true})
  ];
}
