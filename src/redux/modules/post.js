import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { firestore, storage } from "../../shared/firebase";
import { connectAdvanced } from "react-redux";
import { ref, deleteObject } from "firebase/storage";
import moment from "moment";
import { actionCreators as imageActions } from "./image";
import { isLength } from "lodash";
import axios from "axios";
import { instance, token } from "../../shared/api";
import { getCookie } from "../../shared/Cookie";

const SET_POST = "SET_POST";
const ADD_POST = "ADD_POST";
const EDIT_POST = "EDIT_POST";
const REMOVE_POST = "REMOVE_POST";
const RESET_POST = "RESET_POST";
const LOADING = "LOADING";
const resetPost = createAction(RESET_POST, (post_list) => ({ post_list }));
const setPost = createAction(SET_POST, (post_list, paging) => ({
  post_list,
  paging,
}));
const addPost = createAction(ADD_POST, (post) => ({ post }));
const editPost = createAction(EDIT_POST, (post_id, post) => ({
  post_id,
  post,
}));
const removepost = createAction(REMOVE_POST, (post_id) => ({
  post_id,
}));
const loading = createAction(LOADING, (is_loading) => ({ is_loading }));

const initialState = {
  list: [],
  paging: { start: null, next: null, size: 3 },
  is_loading: false,
};

// 게시글 하나에는 어떤 정보가 있어야 하는 지 하나 만들어둡시다! :)
const initialPost = {
  // user_info: {
  //   id: 0,
  //   user_name: "mean0",
  //   user_profile: "http://via.placeholder.com/400x300",
  // },
  img_url: "http://via.placeholder.com/400x300",
  // image_url: "http://via.placeholder.com/400x300",
  content: "",
  comment_cnt: 0,
  like: 0,
  // like_cnt: 0,
  board_status: "bottom",
  // layout: "bottom",
  time: moment().format(),
  // insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
  // insert_dt: moment(),
};

const getPostFB = (start = null, size = 3) => {
  return function (dispatch, getState, { history }) {
    // state에서 페이징 정보 가져오기
    let _paging = getState().post.paging;

    // 시작정보가 기록되었는데 다음 가져올 데이터가 없다면? 앗, 리스트가 끝났겠네요!
    // 그럼 아무것도 하지말고 return을 해야죠!
    if (_paging.start && !_paging.next) {
      return;
    }
    // console.log(token);
    // 가져오기 시작~!
    dispatch(loading(true));
    let post_list = [];
    // dispatch(resetPost(post_list));
    let paging = {
      start: 0,
      next: null,
      size: 10,
    };
    instance
      .get("api/board", {
        headers: {
          Authorization: token,
          // "X-AUTH-TOKEN": token,
        },
      })
      .then((res) => {
        if (res.data.msg === "전체 게시글 조회 성공") {
          // console.log(res.data.data);
          let _post = res.data.data;

          dispatch(setPost(res.data.data, paging));
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

const getOnePostFB = (id) => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");
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
            if (cur.board_id === parseInt(id)) {
              dispatch(setPost([cur]));
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

    postDB
      .doc(id)
      .get()
      .then((doc) => {
        // console.log(doc);
        // console.log(doc.data());

        let _post = doc.data();
        let post = Object.keys(_post).reduce(
          (acc, cur) => {
            if (cur.indexOf("user_") !== -1) {
              return {
                ...acc,
                user_info: { ...acc.user_info, [cur]: _post[cur] },
              };
            }
            return { ...acc, [cur]: _post[cur] };
          },
          { id: doc.id, user_info: {} }
        );

        dispatch(setPost([post]));
      });
  };
};

const editPostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }
    console.log("token", token);
    const _image = getState().image.preview;
    const _post_idx = getState().post.list.findIndex(
      (p) => p.board_id === parseInt(post_id)
    );
    const _post = getState().post.list[_post_idx];
    const postDB = firestore.collection("post");
    if (_image === _post.img_url) {
      instance
        .put(
          `api/board/${post_id}`,
          {
            board_status: _post.board_status,
            content: post.contents,
            img_url: _post.img_url,
          },
          {
            headers: {
              Authorization: token,
            },
          }
        )
        .then((res) => {
          if (res.data.msg === "게시글 수정 성공") {
            dispatch(editPost(parseInt(post_id), { ...post }));
            history.replace("/");
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
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(parseInt(post_id), { ...post }));
          history.replace("/");
        });
      return;
    } else {
      const user_id = getState().user.user.uid;
      const _upload = storage
        .ref(`images/${user_id}_${new Date().getTime()}`)
        .putString(_image, "data_url");
      _upload.then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            console.log(url);
            return url;
          })
          .then((url) => {
            instance
              .put(
                `api/board/${post_id}`,
                {
                  board_status: _post.board_status,
                  content: post.contents,
                  img_url: url,
                },
                {
                  headers: {
                    Authorization: token,
                  },
                }
              )
              .then((res) => {
                if (res.data.msg === "게시글 수정 성공") {
                  dispatch(
                    editPost(parseInt(post_id), { ...post, img_url: url })
                  );
                  history.replace("/");
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
            postDB
              .doc(post_id)
              .update({ ...post, image_url: url })
              .then((doc) => {
                dispatch(editPost(post_id, { ...post, image_url: url }));
                history.replace("/");
              });
          })
          .catch((err) => {
            window.alert("앗! 이미지 업로드에 문제가 있어요!");
            console.log("앗! 이미지 업로드에 문제가 있어요!", err);
          });
      });
    }
  };
};

const addPostFB = (contents = "", layout = "bottom") => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");
    const _user = getState().user.user;
    const user_info = {
      account_name: _user.user_name,
      account_id: _user.uid,
      user_profile: _user.user_profile,
    };

    const _post = {
      ...initialPost,
      content: contents,
      board_status: layout,
      // insert_dt: moment(),
      time: moment().format(),
      // insert_dt: new Date(),
    };

    // getState()로 store의 상태값에 접근할 수 있어요!
    const _image = getState().image.preview;

    // 파일 이름은 유저의 id와 현재 시간을 밀리초로 넣어줍시다! (혹시라도 중복이 생기지 않도록요!)
    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url");

    _upload
      .then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            // url을 확인해봐요!
            dispatch(imageActions.uploadImage(url));
            return url;
          })
          .then((url) => {
            // return으로 넘겨준 값이 잘 넘어왔나요? :)
            // 다시 콘솔로 확인해주기!
            // console.log(url);
            console.log(token);
            instance
              .post(
                "api/board",
                {
                  content: contents,
                  img_url: url,
                  board_status: layout,
                },
                {
                  headers: {
                    Authorization: token,
                    // "X-AUTH-TOKEN": token,
                  },
                }
              )
              .then((res) => {
                console.log(res);
                if (res.data.msg === "게시글 등록 성공") {
                  let post = {
                    ..._post,
                    account_name: _user.user_name,
                    account_id: _user.uid,
                    user_profile: _user.user_profile,
                    board_id: res.data.board_id,
                    img_url: url,
                  };
                  dispatch(addPost(post));
                  history.replace("/");
                }
              })
              .catch((err) => {
                console.log(err.name);
                console.log(err.response);

                var errorCode = err.code;
                var errorMessage = err.message;

                console.log(errorCode, errorMessage);
              });
            return;
            postDB
              .add({ ...user_info, ..._post, image_url: url })
              .then((doc) => {
                // 아이디를 추가해요!
                let post = { user_info, ..._post, id: doc.id, image_url: url };
                // 이제 리덕스에 넣어봅시다.
                dispatch(addPost(post));
                history.replace("/");
              })
              .catch((err) => {
                window.alert("앗! 포스트 작성에 문제가 있어요!");
                console.log("post 작성 실패!", err);
              });
          });
      })
      .catch((err) => {
        window.alert("앗! 이미지 업로드에 문제가 있어요!");
        console.log(err);
      });
  };
};
const removePostFB = (post_id = null, post = {}) => {
  return function (dispatch, getState, { history }) {
    if (!post_id) {
      console.log("게시물 정보가 없어요!");
      return;
    }
    const postDB = firestore.collection("post");

    //이미지 삭제
    const _post_idx = getState().post.list.findIndex(
      (p) => p.board_id === parseInt(post_id)
    );
    console.log(_post_idx);

    const _post = getState().post.list[_post_idx];
    console.log(_post);
    console.log(_post.img_url);
    let str = _post.img_url.split("/images%2F");
    str = str[1].split("?alt");
    const desertRef = ref(storage, "images/" + str[0]);
    deleteObject(desertRef).then(() => {
      console.log("image del");
    });
    instance
      .delete(`api/board/${post_id}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        dispatch(removepost(parseInt(post_id)));
        dispatch(getPostFB());

        console.log(res);
      })
      .catch((err) => {
        console.log(err.name);
        console.log(err.response);

        var errorCode = err.code;
        var errorMessage = err.message;

        console.log(errorCode, errorMessage);
      });
    return;
    postDB
      .doc(post_id)
      .delete()
      .then(() => {
        dispatch(removepost(post_id));
        history.replace("/");
      })
      .catch((err) => {
        window.alert("앗! 이미지 업로드에 문제가 있어요!");
        console.log("앗! 이미지 업로드에 문제가 있어요!", err);
      });

    return;
    // } else {
    //   const user_id = getState().user.user.uid;
    //   const _upload = storage
    //     .ref(`images/${user_id}_${new Date().getTime()}`)
    //     .putString(_image, "data_url");
    //   _upload.then((snapshot) => {
    //     snapshot.ref
    //       .getDownloadURL()
    //       .then((url) => {
    //         console.log(url);
    //         return url;
    //       })
    //       .then((url) => {
    //         postDB
    //           .doc(post_id)
    //           .update({ ...post, image_url: url })
    //           .then((doc) => {
    //             dispatch(editPost(post_id, { ...post, image_url: url }));
    //             history.replace("/");
    //           });
    //       })
    //       .catch((err) => {
    //         window.alert("앗! 이미지 업로드에 문제가 있어요!");
    //         console.log("앗! 이미지 업로드에 문제가 있어요!", err);
    //       });
    //   });
  };
};
// reducer
export default handleActions(
  {
    [SET_POST]: (state, action) =>
      produce(state, (draft) => {
        // draft.list.push(...action.payload.post_list);
        // draft.paging = action.payload.paging;
        // draft.is_loading = false;
        draft.list.push(...action.payload.post_list);

        draft.list = draft.list.reduce((acc, cur) => {
          if (acc.findIndex((a) => a.board_id === cur.board_id) === -1) {
            return [...acc, cur];
          } else {
            acc[acc.findIndex((a) => a.board_id === cur.board_id)] = cur;
            return acc;
          }
        }, []);
        if (action.payload.paging) {
          draft.paging = action.payload.paging;
        }

        draft.is_loading = false;
      }),

    [ADD_POST]: (state, action) =>
      produce(state, (draft) => {
        draft.list.unshift(action.payload.post);
      }),
    [EDIT_POST]: (state, action) =>
      produce(state, (draft) => {
        let idx = draft.list.findIndex(
          (p) => p.board_id === action.payload.post_id
        );
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),
    [REMOVE_POST]: (state, action) =>
      produce(state, (draft) => {
        // let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
        // draft.list.pop(draft.list[idx]);
        let idx = draft.list.filter(
          (l) => l.board_id === action.payload.post_id
        );
        draft.list.pop(draft.list[idx]);
      }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
      }),
    [RESET_POST]: (state, action) =>
      produce(state, (draft) => {
        console.log(draft.list);
        console.log(action);
        draft.list = null;
      }),
  },
  initialState
);

// action creator export
const actionCreators = {
  setPost,
  addPost,
  editPost,
  getPostFB,
  getOnePostFB,
  addPostFB,
  editPostFB,
  removePostFB,
};

export { actionCreators };
