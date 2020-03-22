import User from './User';

export default class Queue {

  private _name: string;
  public get name() { return this._name; }

  private _description: string;
  public get description() { return this._description; }

  private _users: User[];
  public get users() { return this._users; }

  private _motd: string;
  public get motd() { return this._motd; }

  private _isLocked: boolean;
  public get isLocked() { return this._isLocked; }

  private _isHidden: boolean;
  public get isHidden() { return this._isHidden; }

  public constructor(data: any) {
    this._name = data.name;
    this._description = data.description;
    this._users = data.users;
    this._motd = data.motd;
    this._isLocked = data.isLocked;
    this._isHidden = data.isHidden;
  }

  public add(user: User) {
    this.users.push(user);
  }

  public remove(user: User) {
    let index = 0;
    while (index < this.users.length) {
      if (this.users[index].kthuid === user.kthuid) {
        this.users.splice(index, 1);
      }
      else {
        index++;
      }
    }
  }

  public static InitialValue: Queue[] = [
    new Queue({name: 'TestQueue 1', description: 'Description 1', users: [], motd: 'Motd 1', isLocked: false, isHidden: false}),
    new Queue({name: 'TestQueue 2', description: 'Description 2', users: [], motd: 'Motd 2', isLocked: true, isHidden: false}),
    new Queue({name: 'TestQueue 3', description: 'Description 3', users: [], motd: 'Motd 3', isLocked: false, isHidden: true}),
    new Queue({name: 'TestQueue 4', description: 'Description 4', users: [], motd: 'Motd 4', isLocked: true, isHidden: true})
  ];
}
