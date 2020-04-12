import React from 'react';

export function Bookmark(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-bookmark"></i>
        </span>
      : <i className="fas fa-bookmark"></i>
  );
}

export function CheckMark(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-check"></i>
        </span>
      : <i className="fas fa-check"></i>
  );
}

export function Cross(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-times"></i>
        </span>
      : <i className="fas fa-times"></i>
  );
}

export function Envelope(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-envelope"></i>
        </span>
      : <i className="fas fa-envelope"></i>
  );
}

export function Invisible(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-eye-slash"></i>
        </span>
      : <i className="fas fa-eye-slash"></i>
  );
}

export function Locked(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-lock"></i>
        </span>
      : <i className="fas fa-lock"></i>
  );
}

export function Plus(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-plus"></i>
        </span>
      : <i className="fas fa-plus"></i>
  );
}

export function QuestionMark(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-question"></i>
        </span>
      : <i className="fas fa-question"></i>
  );
}

export function Star(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-star"></i>
        </span>
      : <i className="fas fa-star"></i>
  );
}

export function Tag(props: any) {

  let [title, styling, onClick] = parseProps(props);

  return (
    title || styling || onClick
      ? <span
          className={styling}
          title={title}
          onClick={onClick}>
            <i className="fas fa-tag"></i>
        </span>
      : <i className="fas fa-tag"></i>
  );
}

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

  let cssClasses = [
    onClick !== undefined ? 'clickable' : null,
    color !== undefined ? colorMapping[color] as string | null : null
  ];

  return [
    title,
    cssClasses.filter(x => x !== null).join(' ') || undefined,
    onClick
  ];
}
