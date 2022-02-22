import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";
import moment from "moment";

import firebase from "firebase/compat/app";
import { actionCreators as postActions } from "./post";

const SET_LIKE = "SET_LIKE";
const ADD_LIKE = "ADD_LIKE";
const CANCEL_LIKE = "CANCEL_LIKE";

const setLike = createAction(SET_LIKE, (post_id, user_list) => ({
  post_id,
  user_list,
}));
const addLike = createAction(ADD_LIKE, (post_id, user_id) => ({
  post_id,
  user_id,
}));

const cancelLike = createAction(CANCEL_LIKE, (post_id, user_id) => ({
  post_id,
  user_id,
}));

const initialState = {
  list: {},
};

const getLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {};
};
const addLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {};
};
const cancelLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {};
};

export default handleActions({
  [SET_LIKE]: (state, action) => produce(state, (draft) => {}),
  [ADD_LIKE]: (state, action) => produce(state, (draft) => {}),
  [CANCEL_LIKE]: (state, action) => produce(state, (draft) => {}),
});

const actionCreators = {
  getLikeFB,
  addLikeFB,
  cancelLikeFB,
};
export { actionCreators };
