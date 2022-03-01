import "./App.css";
import React, { lazy, Suspense } from "react";

import { Route } from "react-router-dom";
import { ConnectedRouter } from "connected-react-router";
import { history } from "../redux/configureStore";

import Header from "../shared/Header";
import { Grid, Button } from "../elements";
import Permit from "./Permit";

import { useDispatch } from "react-redux";
import { actionCreators as userActions } from "../redux/modules/user";
import { actionCreators as imageActions } from "../redux/modules/image";

import { getCookie } from "./Cookie";

// import PostList from "../pages/PostList";
// import Login from "../pages/Login";
// import Signup from "../pages/Signup";
// import PostWrite from "../pages/PostWrite";
// import PostDetail from "../pages/PostDetail";
// import Notification from "../pages/Notification";
import { LocalDining } from "@material-ui/icons";

const PostList = lazy(() => import("../pages/PostList"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const PostWrite = lazy(() => import("../pages/PostWrite"));
const PostDetail = lazy(() => import("../pages/PostDetail"));
const Notification = lazy(() => import("../pages/Notification"));

function App() {
  const dispatch = useDispatch();

  const is_session = sessionStorage.getItem("jwtToken") ? true : false;
  // const is_session = getCookie("jwtToken") ? true : false;

  React.useEffect(() => {
    if (is_session) {
      dispatch(userActions.loginCheckFB());
    }
  }, []);
  const loading = () => <p>Loading</p>;

  return (
    <React.Fragment>
      <Suspense fallback={loading()}>
        <Grid>
          <Header></Header>
          <ConnectedRouter history={history}>
            <Route path="/" exact component={PostList} />
            <Route path="/login" exact component={Login} />
            <Route path="/signup" exact component={Signup} />
            <Route path="/write" exact component={PostWrite} />
            <Route path="/write/:id" exact component={PostWrite} />
            <Route path="/post/:id" exact component={PostDetail} />
            <Route path="/noti" exact component={Notification} />
          </ConnectedRouter>
        </Grid>
        <Permit>
          <Button
            is_float
            text="+"
            _onClick={() => {
              dispatch(
                imageActions.setPreview("http://via.placeholder.com/400x300")
              );

              history.replace("/write");
            }}
          ></Button>
        </Permit>
      </Suspense>
    </React.Fragment>
  );
}

export default App;
