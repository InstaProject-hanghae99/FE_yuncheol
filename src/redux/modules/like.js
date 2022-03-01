import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { instance, token } from "../../shared/api";

import { firestore } from "../../shared/firebase";

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
  return function (dispatch, getState, { history }) {
    if (!post_id) return;

    instance
      .get("api/board", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        if (res.data.msg === "전체 게시글 조회 성공") {
          // console.log(res.data.data);
          const docs = res.data.data;
          docs.forEach((cur, idx) => {
            let list = [];

            if (cur.board_id === parseInt(post_id)) {
              cur.like_account.forEach((likecur, likeidx) => {
                list.push(likecur.account_id);
              });
              dispatch(setLike(post_id, list));

              // history.replace(`/post/${cur.board_id}`);
              return;
            }
          });
        }
      })
      .catch((error) => {
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });

    return;
  };
};
const addLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {
    const user = getState().user.user;
    let like = {
      post_id: post_id,
      user_id: user.uid,
    };
    const _post_idx = getState().post.list.findIndex(
      (p) => p.board_id === parseInt(post_id)
    );
    const _post = getState().post.list[_post_idx];
    instance
      .post(
        `api/board/${post_id}/like`,
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        if (res.data.msg === "좋아요 등록 성공") {
          dispatch(addLike(post_id, user.uid));
          if (_post) {
            dispatch(
              postActions.editPost(post_id, {
                like: parseInt(_post.like) + 1,
              })
            );
          }
        }
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });
  };
};
const cancelLikeFB = (post_id) => {
  return function (dispatch, getState, { history }) {
    const likeDB = firestore.collection("like");
    const user = getState().user.user;
    const _post_idx = getState().post.list.findIndex(
      (p) => p.board_id === parseInt(post_id)
    );
    const _post = getState().post.list[_post_idx];
    instance
      .delete(
        `api/board/${post_id}/like`,

        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        if (res.data.msg === "좋아요 삭제 성공") {
          dispatch(cancelLike(post_id, user.uid));
          if (_post) {
            if (parseInt(_post.like) === 0) {
              return;
            }
            dispatch(
              postActions.editPost(post_id, {
                like: parseInt(_post.like) - 1,
              })
            );
          }
        }
      })
      .catch((error) => {
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });
    return;
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
