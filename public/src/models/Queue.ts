import QueueEntry from './QueueEntry';
import Assistant from './Assistant';
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
    this._id = data.id || -1;
    this._name = data.name || '';
    this._info = data.info || '';
    this._motd = data.motd || '';
    this._locked = data.locked || false;
    this._hiding = data.hiding || false;
    this._assistants = data.assistants || [];
    this._teachers = data.teachers || [];
    this._queueEntries = data.queueEntries || [];
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

  public setInformationText(info: string): void {
    this._info = info;
  }

  public addQueueEntry(entry: QueueEntry): void {
    this._queueEntries.push(entry);
  }

  public removeQueueEntry(entry: QueueEntry): void {
    this._queueEntries = this._queueEntries.filter(e => e.ugkthid !== entry.ugkthid);
  }

  public updateQueueEntry(entry: QueueEntry): void {
    for (let i = 0; i < this._queueEntries.length; i++) {
        if (this._queueEntries[i].ugkthid === entry.ugkthid) {
          this._queueEntries[i] = entry;
        }
    }
  }

  public setQueueEntries(queueEntries: QueueEntry[]): void {
    this._queueEntries = queueEntries;
  }

  public clone(): Queue {
    return new Queue({
      id: this._id,
      name: this._name,
      info: this._info,
      motd: this._motd,
      locked: this._locked,
      hiding: this._hiding,
      queueEntries: this._queueEntries.map(e => e.clone()),
      assistants: this._assistants.map(a => a.clone()),
      teachers: this._teachers.map(t => t.clone())
    });
  }
}
