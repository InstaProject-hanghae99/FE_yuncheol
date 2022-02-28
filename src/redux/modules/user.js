import { createAction, handleActions } from "redux-actions";
import { produce } from "immer";
import { setCookie, getCookie, deleteCookie } from "../../shared/Cookie";
import { auth } from "../../shared/firebase";
import firebase from "firebase/compat/app";
import { userApi, instance, token } from "../../shared/api";
import axios from "axios";

//actions
const LOG_IN = "LOG_IN";
const LOG_OUT = "LOG_OUT";
const GET_USER = "GET_USER";
const SET_USER = "SET_USER";

//action creators
// const logIn = createAction(LOG_IN, (user) => ({ user }));
// const logIn = (user) => {
//   return { type: LOG_IN, user };
// };

const logOut = createAction(LOG_OUT, (user) => ({ user }));
const getUser = createAction(GET_USER, (user) => ({ user }));
const setUser = createAction(SET_USER, (user) => ({ user }));
//initialState
const initialState = {
  user: null,
  is_login: false,
};

const user_initial = {
  user_name: "mean0",
};

//middleware actions
const loginAction = (user) => {
  return function (dispatch, getState, { history }) {
    console.log(history);
    dispatch(setUser(user));
    // dispatch(push("/"));
    history.push("/");
  };
};

const loginFB = (id, pwd) => {
  return function (dispatch, getState, { history }) {
    // const is_cookie = getCookie("jwtToken") ? true : false;
    // if (is_cookie) {
    //   //버그수정해야함
    //   console.log(is_cookie);
    //   dispatch(loginCheckFB());
    //   return;
    // }
    instance
      .post(
        "api/login",
        { account_email: id, password: pwd }
        // { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        // if (res.data.result === "success") {
        if (res.data.msg === "로그인 성공") {
          const tokens = res.data.data.token;
          //세션저장소 말고 쿠키로 사용
          // setCookie("jwtToken", tokens);
          console.log("tokens", tokens);
          sessionStorage.setItem("jwtToken", tokens);

          // axios.defaults.headers.common["Authorization"] = `Bearer ${tokens}`;

          dispatch(
            setUser({
              user_name: res.data.data.account_name,
              id: id,
              user_profile: "",
              uid: res.data.data.account_id,
            })
          );

          history.replace("/");
        } else window.alert(`${res.data.msg}`);
      })
      .catch((error) => {
        console.log(error.respons);

        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });
    return;

    auth.setPersistence(firebase.auth.Auth.Persistence.SESSION).then((res) => {
      auth
        .signInWithEmailAndPassword(id, pwd)
        .then((user) => {
          console.log(user);

          dispatch(
            setUser({
              user_name: user.user.displayName,
              id: id,
              user_profile: "",
              uid: user.user.uid,
            })
          );

          history.push("/");
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;

          console.log(errorCode, errorMessage);
        });
    });
  };
};

const signupFB = (id, pwd, pwd_check, user_name) => {
  return function (dispatch, getState, { history }) {
    instance
      .post(
        "api/register",
        {
          account_email: id,
          password: pwd,
          password_check: pwd_check,
          account_name: user_name,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      )
      .then((res) => {
        console.log(res);
        if (res.data.msg === "회원 가입 완료") {
          console.log(res);

          // dispatch(
          //   setUser({
          //     user_name: user_name,
          //     id: id,
          //     user_profile: "",
          //     uid: res.userData.userId,
          //   })
          // );
          history.replace("/login");
        } else {
          window.alert(`${res.data.msg}`);
        }
      })
      .catch((error) => {
        //예외처리
        var errorCode = error.code;
        var errorMessage = error.message;
        var errorType = error.errorType;
        console.log(errorCode, errorMessage, errorType);
        // ..
      });

    return;
    fetch("http://localhost:3000/auth/login.json", {
      method: "GET", // 실제 서버 요청은 POST 요청이겠죠?
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data.result.ok) {
          /**
           * 선택 가능한 작업
           * 1. localStorage.setItem("token", data.result.user.token)
           * 2. dispatch(setPostList(data))
           *  etc...
           */
        }
        console.log(data.result);
      });

    auth
      .createUserWithEmailAndPassword(id, pwd)
      .then((user) => {
        console.log(user);

        auth.currentUser
          .updateProfile({
            displayName: user_name,
          })
          .then(() => {
            dispatch(
              setUser({
                user_name: user_name,
                id: id,
                user_profile: "",
                uid: user.user.uid,
              })
            );
            history.push("/");
          })
          .catch((error) => {
            console.log(error);
          });

        // Signed in
        // ...
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log(errorCode, errorMessage);
        // ..
      });
  };
};

const loginCheckFB = () => {
  return function (dispatch, getState, { history }) {
    instance
      .get("api/token", {
        headers: {
          Authorization: token,
        },
      })
      .then((res) => {
        console.log(res);

        dispatch(
          setUser({
            user_name: res.data.data.account_name,
            id: res.data.data.account_email,
            user_profile: "",
            uid: res.data.data.account_id,
          })
        );
      })
      .catch((error) => {
        //예외처리
        var errorCode = error.code;
        var errorMessage = error.message;
        var errorType = error.errorType;
        console.log(errorCode, errorMessage, errorType);
        // ..
      });

    return;
    auth.onAuthStateChanged((user) => {
      if (user) {
        dispatch(
          setUser({
            user_name: user.displayName,
            user_profile: "",
            id: user.email,
            uid: user.uid,
          })
        );
      } else {
        dispatch(logOut());
      }
    });
  };
};

const logoutFB = () => {
  return function (dispatch, getState, { history }) {
    // deleteCookie("jwtToken");
    sessionStorage.clear();
    window.alert("로그아웃 되었습니다");
    //auth.signOut()로그아웃 함수
    dispatch(logOut());
    history.replace("/");
  };
};

// reducer
export default handleActions(
  {
    [SET_USER]: (state, action) =>
      produce(state, (draft) => {
        draft.user = action.payload.user;
        draft.is_login = true;
      }),
    [LOG_OUT]: (state, action) =>
      produce(state, (draft) => {
        draft.user = null;
        draft.is_login = false;
      }),
    [GET_USER]: (state, action) => produce(state, (draft) => {}),
  },
  initialState
);

// action creator export
const actionCreators = {
  logOut,
  getUser,
  signupFB,
  loginFB,
  loginCheckFB,
  logoutFB,
};

export { actionCreators };
