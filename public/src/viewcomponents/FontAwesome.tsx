import React from 'react';

export const CheckMark = (props: any): JSX.Element => Markup(props, 'check');
export const Cross = (props: any): JSX.Element => Markup(props, 'times');
export const Download = (props: any): JSX.Element => Markup(props, 'download');
export const Envelope = (props: any): JSX.Element => Markup(props, 'envelope');
export const Information = (props: any): JSX.Element => Markup(props, 'info');
export const Invisible = (props: any): JSX.Element => Markup(props, 'eye-slash');
export const Lock = (props: any): JSX.Element => Markup(props, 'lock');
export const Megaphone = (props: any): JSX.Element => Markup(props, 'bullhorn');
export const Muted = (props: any): JSX.Element => Markup(props, 'volume-mute');
export const Plus = (props: any): JSX.Element => Markup(props, 'plus');
export const QuestionMark = (props: any): JSX.Element => Markup(props, 'question');
export const Sign = (props: any): JSX.Element => Markup(props, 'sign');
export const Square = (props: any): JSX.Element => Markup(props, 'stop');
export const Star = (props: any): JSX.Element => Markup(props, 'star');
export const Trashbin = (props: any): JSX.Element => Markup(props, 'trash-alt');
export const Unlock = (props: any): JSX.Element => Markup(props, 'unlock');
export const Users = (props: any): JSX.Element => Markup(props, 'users');
export const VolumeUp = (props: any): JSX.Element => Markup(props, 'volume-up');

function parseProps(props: any): [string | undefined, string | undefined, ((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void) | undefined] {

  const title: string | undefined = props.title;
  const onClick: ((event: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void) | undefined = props.onClick;

  const cssClasses = [
    onClick !== undefined ? 'clickable' : null
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
    title || styling || onClick || props.color
      ? <span
          className={styling}
          title={title}
          onClick={onClick}
          style={{color: props.color || 'inherit'}}>
            <i className={`fas fa-${fontAwesomeCssClass}`}></i>
        </span>
      : <i className={`fas fa-${fontAwesomeCssClass}`}></i>
  );
}
