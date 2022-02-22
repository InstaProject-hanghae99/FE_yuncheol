import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import moment from "moment";
import firebase from "firebase/compat/app";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../shared/firebase";

import post, { actionCreators as postActions } from "./post";

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
  return function (dispatch, getState, { history }) {
    if (!post_id) return;

    const likeDB = firestore.collection("like");

    likeDB
      .where("post_id", "==", post_id)
      .get()
      .then((docs) => {
        let list = [];
        docs.forEach((doc) => {
          list.push(doc.data().user_id);
        });
        // console.log(list);

        dispatch(setLike(post_id, list));
      })
      .catch((error) => {
        console.log("좋아요 불러오기 실패", error);
      });
  };
};
const addLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {
    const likeDB = firestore.collection("like");
    const user = getState().user.user;

    let like = {
      post_id: post_id,
      user_id: user.uid,
    };

    likeDB
      .add(like)
      .then((doc) => {
        const postDB = firestore.collection("post");

        like = { ...like, id: doc.id };
        const _post_idx = getState().post.list.findIndex(
          (p) => p.id === post_id
        );
        const _post = getState().post.list[_post_idx];

        postDB
          .doc(post_id)
          .update({ like_cnt: _post.like_cnt + 1 })
          .then((doc) => {
            dispatch(addLike(post_id, user.uid));
            if (_post) {
              dispatch(
                postActions.editPost(post_id, {
                  like_cnt: parseInt(_post.like_cnt) + 1,
                })
              );
            }
          });
      })
      .catch((err) => {
        console.log("error", err);
      });
  };
};
const cancelLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {
    const likeDB = firestore.collection("like");
    const user = getState().user.user;

    likeDB
      .where("post_id", "==", post_id)
      .where("user_id", "==", user.uid)
      .get()
      .then((docs) => {
        let id = "";
        docs.forEach((doc) => (id = doc.id));
        likeDB
          .doc(id)
          .delete()
          .then(() => {
            const postDB = firestore.collection("post");
            const _post_idx = getState().post.list.findIndex(
              (p) => p.id === post_id
            );
            const _post = getState().post.list[_post_idx];
            postDB
              .doc(post_id)
              .update({ like_cnt: _post.like_cnt - 1 })
              .then((thenpost) => {
                dispatch(cancelLike(post_id, user.uid));
                if (_post) {
                  if (parseInt(_post.like_cnt) === 0) {
                    return;
                  }
                  dispatch(
                    postActions.editPost(post_id, {
                      like_cnt: parseInt(_post.like_cnt) - 1,
                    })
                  );
                }
              })
              .catch((err) => {
                console.log("좋아요 실패");
              });
          });
      });
  };
};

export default handleActions(
  {
    [SET_LIKE]: (state, action) =>
      produce(state, (draft) => {
        draft.list[action.payload.post_id] = action.payload.user_list;
      }),
    [ADD_LIKE]: (state, action) =>
      produce(state, (draft) => {
        draft.list[action.payload.post_id].push(action.payload.user_id);
      }),
    [CANCEL_LIKE]: (state, action) => produce(state, (draft) => {}),
  },
  initialState
);

const actionCreators = {
  getLikeFB,
  addLikeFB,
  cancelLikeFB,
};
export { actionCreators };
