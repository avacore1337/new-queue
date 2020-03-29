import React from 'react';
import { Redirect } from "react-router-dom";
import User from "../../models/User";

export default function LogoutViewComponent(props: any) {

  let setUser: React.Dispatch<React.SetStateAction<User | null>> = props.setUser;
  setUser(null);

  localStorage.removeItem('User');

  return (
    <Redirect to="/" />
  );
}
