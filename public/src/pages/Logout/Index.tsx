import React from 'react';
import { Redirect } from "react-router-dom";
import User from "../../models/User";
import SocketConnection from "../../utils/SocketConnection";
import RequestMessage from "../../utils/RequestMessage";

export default function LogoutViewComponent(props: any) {

  let setUser: React.Dispatch<React.SetStateAction<User | null>> = props.setUser;
  let socket: SocketConnection = props.socket;

  setUser(null);

  socket.send(new RequestMessage('/logout'));

  localStorage.removeItem('User');

  return (
    <Redirect to="/" />
  );
}
