import { combineReducers } from 'redux';
import filterReducer from './filterReducer';
import addInputReducer from './addInputReducer';
import AddInput from '../../models/AddInput';

export interface UtilsStore {
  filter: string,
  addInputs: {
    [name: string]: AddInput
  }
}

export default combineReducers({
  filter: filterReducer,
  addInputs: addInputReducer
});
