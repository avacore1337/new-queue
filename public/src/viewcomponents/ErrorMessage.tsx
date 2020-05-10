import React from 'react';

export default (props: any): JSX.Element | null => {

  const errorMessage = props.message;

  return (
    errorMessage
      ? <div className="row">
          <div className="col-12 alert alert-danger" role="alert">
            {errorMessage}
          </div>
        </div>
      : null
    );
};
