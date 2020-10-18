export const WEB_SOCKET_SERVER_URL = `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.hostname}:7777/ws`;
export const HTTP_SERVER_URL = `${window.location.protocol === 'http:' ? 'http' : 'https'}://${window.location.hostname}:${window.location.port === '3000' ? '8000' : window.location.port}`;
export const LOGIN_CALLBACK = `${window.location.protocol === 'http:' ? 'http' : 'https'}://queue.csc.kth.se/auth`;
