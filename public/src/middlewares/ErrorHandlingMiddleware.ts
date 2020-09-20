const isPromise = (value: any): boolean => value !== null && typeof value === 'object' && typeof value.then === 'function';

export default () => (next: any) => (action: any) => {

  // If not a promise, continue on
  if (!isPromise(action.payload)) {
    return next(action);
  }

  /**
  * include a property in `meta and evaluate that property to check if this error will be handled locally
  *
  * if (!action.meta.localError) {
  *   // handle error
  * }
  *
  * The error middleware serves to dispatch the initial pending promise to
  * the promise middleware, but adds a `catch`.
  */
  if (!action.meta || !action.meta.localError) {
    // Dispatch initial pending promise, but catch any errors
    return next(action).catch((error: any) => error);
  }

  return next(action);
};
