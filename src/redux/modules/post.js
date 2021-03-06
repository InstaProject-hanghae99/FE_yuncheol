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
const LOADING = "LOADING";

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
  imageUrl: "http://via.placeholder.com/400x300",
  // image_url: "http://via.placeholder.com/400x300",
  contents: "",
  comment_cnt: 0,
  likeCnt: 0,
  // like_cnt: 0,
  layoutType: "bottom",
  // layout: "bottom",
  insert_dt: moment().format(),
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
    let paging = {
      start: 0,
      next: null,
      size: 10,
    };
    instance
      .get("api/post", {
        withCredentials: true,
        headers: {
          // Authorization: `Bearer ${token}`,
          "X-AUTH-TOKEN": token,
        },
      })
      .then((res) => {
        console.log(res);
        if (res.data.msg === "전체 게시물 보기") {
          console.log(res.data.postResponseDto);
          let _post = res.data.postResponseDto;
          _post.forEach((doc) => {
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

            post_list.push(doc);

            console.log(doc);
          });
        }
        // post_list.pop();

        dispatch(setPost(post_list, paging));

        // docs.forEach((doc) => {
        //   console.log(doc);

        //   let post = Object.keys(docs).reduce((acc, cur) => {
        //     console.log(docs, acc, cur);
        //   });
        // });
        // dispatch(setPost(docs, paging));
      })
      .catch((error) => {
        console.log(error);
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });

    return;
    const postDB = firestore.collection("post");

    let query = postDB.orderBy("insert_dt", "desc");

    // 시작점 정보가 있으면? 시작점부터 가져오도록 쿼리 수정!
    if (start) {
      query = query.startAt(start);
    }

    // 사이즈보다 1개 더 크게 가져옵시다.
    // 3개씩 끊어서 보여준다고 할 때, 4개를 가져올 수 있으면? 앗 다음 페이지가 있겠네하고 알 수 있으니까요.
    // 만약 4개 미만이라면? 다음 페이지는 없겠죠! :)
    query
      .limit(size + 1)
      .get()
      .then((docs) => {
        let post_list = [];

        // 새롭게 페이징 정보를 만들어줘요.
        // 시작점에는 새로 가져온 정보의 시작점을 넣고,
        // next에는 마지막 항목을 넣습니다.
        // (이 next가 다음번 리스트 호출 때 start 파라미터로 넘어올거예요.)
        let paging = {
          start: docs.docs[0],
          next:
            docs.docs.length === size + 1
              ? docs.docs[docs.docs.length - 1]
              : null,
          size: size,
        };

        docs.forEach((doc) => {
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

          post_list.push(post);
        });

        // 마지막 하나는 빼줍니다.
        // 그래야 size대로 리스트가 추가되니까요!
        // 마지막 데이터는 다음 페이지의 유무를 알려주기 위한 친구일 뿐! 리스트에 들어가지 않아요!
        post_list.pop();

        dispatch(setPost(post_list, paging));
      });
  };
};

const getOnePostFB = (id) => {
  return function (dispatch, getState, { history }) {
    const postDB = firestore.collection("post");
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
    const _image = getState().image.preview;
    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];
    console.log(_post);
    const postDB = firestore.collection("post");
    if (_image === _post.image_url) {
      postDB
        .doc(post_id)
        .update(post)
        .then((doc) => {
          dispatch(editPost(post_id, { ...post }));
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
      user_name: _user.user_name,
      user_id: _user.uid,
      user_profile: _user.user_profile,
    };

    const _post = {
      ...initialPost,
      contents: contents,
      layout: layout,
      // insert_dt: moment(),
      insert_dt: moment().format("YYYY-MM-DD hh:mm:ss"),
      // insert_dt: new Date(),
    };

    // getState()로 store의 상태값에 접근할 수 있어요!
    const _image = getState().image.preview;

    // 파일 이름은 유저의 id와 현재 시간을 밀리초로 넣어줍시다! (혹시라도 중복이 생기지 않도록요!)
    const _upload = storage
      .ref(`images/${user_info.user_id}_${new Date().getTime()}`)
      .putString(_image, "data_url");
    // let cookie = getCookie("JSESSIONID");

    _upload
      .then((snapshot) => {
        snapshot.ref
          .getDownloadURL()
          .then((url) => {
            // url을 확인해봐요!
            // console.log(url);
            dispatch(imageActions.uploadImage(url));
            return url;
          })
          .then((url) => {
            // return으로 넘겨준 값이 잘 넘어왔나요? :)
            // 다시 콘솔로 확인해주기!
            // console.log(url);

            instance
              .post(
                "api/post",
                {
                  content: contents,
                  imgUrl: url,
                  layout: layout,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    // "X-AUTH-TOKEN": token,
                  },
                }
              )
              .then((res) => {
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
    const _post_idx = getState().post.list.findIndex((p) => p.id === post_id);
    const _post = getState().post.list[_post_idx];
    console.log(_post.image_url);
    let str = _post.image_url.split("/images%2F");
    str = str[1].split("?alt");
    const desertRef = ref(storage, "images/" + str[0]);
    deleteObject(desertRef).then(() => {
      console.log("image del");
    });

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

        // draft.list = draft.list.reduce((acc, cur) => {
        //   if (acc.findIndex((a) => a.id === cur.id) === -1) {
        //     return [...acc, cur];
        //   } else {
        //     acc[acc.findIndex((a) => a.id === cur.id)] = cur;
        //     return acc;
        //   }
        // }, []);
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
        let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
        draft.list[idx] = { ...draft.list[idx], ...action.payload.post };
      }),
    [REMOVE_POST]: (state, action) =>
      produce(state, (draft) => {
        // let idx = draft.list.findIndex((p) => p.id === action.payload.post_id);
        // draft.list.pop(draft.list[idx]);
        draft.list = draft.list.filter((l) => l.id !== action.payload.post_id);
      }),
    [LOADING]: (state, action) =>
      produce(state, (draft) => {
        draft.is_loading = action.payload.is_loading;
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
