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
    history.push("/");
  };
};

const loginFB = (id, pwd) => {
  return function (dispatch, getState, { history }) {
    instance
      .post("api/login", { account_email: id, password: pwd })
      .then((res) => {
        if (res.data.msg === "로그인 성공") {
          const tokens = res.data.data.token;
          //세션저장소 말고 쿠키로 사용
          // setCookie("jwtToken", tokens);
          sessionStorage.setItem("jwtToken", tokens);

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
  };
};

const logoutFB = () => {
  return function (dispatch, getState, { history }) {
    // deleteCookie("jwtToken");
    sessionStorage.clear();
    window.alert("로그아웃 되었습니다");
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
