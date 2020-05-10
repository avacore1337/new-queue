import React from 'react';

export const Bookmark = (props: any): JSX.Element => Markup(props, 'bookmark');
export const CheckMark = (props: any): JSX.Element => Markup(props, 'check');
export const Cross = (props: any): JSX.Element => Markup(props, 'times');
export const Envelope = (props: any): JSX.Element => Markup(props, 'envelope');
export const Invisible = (props: any): JSX.Element => Markup(props, 'eye-slash');
export const Locked = (props: any): JSX.Element => Markup(props, 'lock');
export const Plus = (props: any): JSX.Element => Markup(props, 'plus');
export const QuestionMark = (props: any): JSX.Element => Markup(props, 'question');
export const Star = (props: any): JSX.Element => Markup(props, 'star');
export const Tag = (props: any): JSX.Element => Markup(props, 'tag');
export const Users = (props: any): JSX.Element => Markup(props, 'users');

const colorMapping: Record<string, string | null> = {
  'red': 'text-danger',
  'blue': 'text-primary',
  'gray': 'text-secondary',
  'grey': 'text-secondary',
  'green': 'text-success',
  'yellow': 'text-warning',
  'cyan': 'text-info',
  'white': 'text-white',
  undefined: null
}

function parseProps(props: any): [string | undefined, string | undefined, ((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void) | undefined] {

  const title: string | undefined = props.title;
  const color: string | undefined = props.color;
  const onClick: ((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void) | undefined = props.onClick;

  const cssClasses = [
    onClick !== undefined ? 'clickable' : null,
    color !== undefined ? colorMapping[color] as string | null : null
  ];

  return [
    title,
    cssClasses.filter(x => x !== null).join(' ') || undefined,
    onClick
  ];
}

function Markup(props: any, fontAwesomeCssClass: string): JSX.Element {

  const [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className={`fas fa-${fontAwesomeCssClass}`}></i>
        </span>
      : <i className={`fas fa-${fontAwesomeCssClass}`}></i>
  );
}
