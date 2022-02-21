// PostList.js
import React from "react";

import Post from "../components/Post";
import { useSelector, useDispatch } from "react-redux";
import { actionCreators as postActions } from "../redux/modules/post";
import InfinityScroll from "../shared/InfinityScroll";
import { Grid } from "../elements";

const PostList = (props) => {
  const dispatch = useDispatch();
  const post_list = useSelector((state) => state.post.list);
  const user_info = useSelector((state) => state.user.user);
  const is_loading = useSelector((state) => state.post.is_loading);
  const paging = useSelector((state) => state.post.paging);

  const { history } = props;

  React.useEffect(() => {
    // if (post_list.length === 0) {
    dispatch(postActions.getPostFB());
    // }
  }, []);
  return (
    <React.Fragment>
      <Grid bg={"#EFF6FF"} padding="20px 0px">
        {/* <Post/> */}
        <InfinityScroll
          callNext={() => {
            dispatch(postActions.getPostFB(paging.next));
          }}
          is_next={paging.next ? true : false}
          loading={is_loading}
        >
          {post_list.map((p, idx) => {
            if (p.user_info.user_id === user_info?.uid) {
              // if (true) {
              return (
                <Grid
                  bg="#ffffff"
                  margin="8px 0px"
                  key={p.id}
                  // key={idx}
                  _onClick={() => {
                    history.push(`/post/${p.id}`);
                  }}
                >
                  <Post
                    key={p.id}
                    // key={idx}
                    {...p}
                    is_me
                  />
                </Grid>
              );
            } else {
              return (
                <Grid
                  key={p.id}
                  bg="#ffffff"
                  _onClick={() => {
                    history.push(`/post/${p.id}`);
                  }}
                >
                  <Post {...p} />
                </Grid>
              );
            }
          })}
        </InfinityScroll>
      </Grid>
    </React.Fragment>
  );
};

export default PostList;
