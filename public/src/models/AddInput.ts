export default class AddInput {

  private _content: string;
  public get content() { return this._content; }

  private _placeholder: string;
  public get placeholder() { return this._placeholder; }

  public constructor(data: any) {
    this._content = data.content;
    this._placeholder = data.placeholder;
  }

  public clone(): AddInput {
    return new AddInput({
      content: this._content || '',
      placeholder: this._placeholder || ''
    });
  }

  public clear(): void {
    this._content = '';
  }

  public setContent(content: string): void {
    this._content = content;
  }

  public setPlaceholder(placeholder: string): void {
    this._placeholder = placeholder;
  }
}
