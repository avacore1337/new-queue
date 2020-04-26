export default class Modal {

  private _modalType: string;
  public get modalType() { return this._modalType; }

  private _modalData: any;
  public get modalData() { return this._modalData; }

  private _isVisible: any;
  public get isVisible() { return this._isVisible; }

  public constructor(modalType: string, data: any, isVisible?: boolean) {
    this._modalType = modalType;
    this._modalData = data || {};
    this._isVisible = isVisible !== undefined ? isVisible : true;
  }

  public hide(): void {
    this._isVisible = false;
  }

  public clone(): Modal {
    return new Modal(this._modalType, this._modalData, this._isVisible);
  }
}
