export default class Contributor {

  private _name: string;
  public get name() { return this._name; }

  private _gravatar: string;
  public get gravatar() { return this._gravatar; }

  private _github: string;
  public get github() { return this._github; }

  private _linkedIn: string;
  public get linkedIn() { return this._linkedIn; }

  public constructor(data: any) {
    this._name = data.name;
    this._gravatar = data.gravatar;
    this._github = data.github;
    this._linkedIn = data.linkedIn;
  }

  public static InitialValue: Contributor[] = [
    new Contributor({
      "name": "Anton Bäckström",
      "gravatar": "7eaf43cc9a0edf01b4994318e03fe368",
      "github": "antbac",
      "linkedIn": "428598244"
    }),
    new Contributor({
      "name": "Robert Welin-Berger",
      "gravatar": "5577c2569cfb1fe29388d1e2c1a794d7",
      "github": "avacore1337",
      "linkedIn": "332859123"
    })
  ];
}
