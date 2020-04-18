import { ActionType as ActionTypeSuffix } from 'redux-promise-middleware';

export default class ActionType {

  private _type: string;

  public toString = () : string => this._type;

  public get Pending() { return `${this._type}_${ActionTypeSuffix.Pending}`; }
  public get Fulfilled() { return `${this._type}_${ActionTypeSuffix.Fulfilled}`; }
  public get Rejected() { return `${this._type}_${ActionTypeSuffix.Rejected}`; }

  constructor(type: string){
    this._type = type;
  }
}

export const SetUser = new ActionType('SET_USER');
