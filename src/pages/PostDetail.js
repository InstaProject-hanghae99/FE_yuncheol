import React from "react";
import Post from "../components/Post";

import { useDispatch, useSelector } from "react-redux";

import { actionCreators as postActions } from "../redux/modules/post";

const PostDetail = (props) => {
  const dispatch = useDispatch();
  const { history } = props;

  const id = props.match.params.id;

  const is_login = useSelector((state) => state.user.is_login);

  const user_info = useSelector((state) => state.user.user);

  const post_list = useSelector((store) => store.post.list);
  const post_idx = post_list.findIndex((p) => p.board_id == id);

  post_list.map((cur, idx) => {
    // console.log(cur);
    if (cur.postId == id) {
      post_idx = idx;
      return;
    }
  });
  const post = post_list[post_idx];

  React.useEffect(() => {
    if (post) {
      return;
    }

    dispatch(postActions.getOnePostFB(id));
  }, []);

  // //로그인해야 볼수 있게 수정
  // if (!is_login) {
  //   return (
  //     <Grid margin="100px 0px" padding="16px" center>
  //       <Text size="32px" bold>
  //         앗! 잠깐!
  //       </Text>
  //       <Text size="16px">로그인 후에만 글을 쓸 수 있어요!</Text>
  //       <Button
  //         _onClick={() => {
  //           history.replace("/");
  //         }}
  //       >
  //         로그인 하러가기
  //       </Button>
  //     </Grid>
  //   );
  // }
  console.log("post", post);
  console.log("user_info?.uid", user_info?.uid);
  return (
    <React.Fragment>
      {post && <Post {...post} is_me={post.account_id === user_info?.uid} />}
      {/* <Permit>
        <CommentWrite post_id={id} />
      </Permit>
      <CommentList post_id={id} /> */}
    </React.Fragment>
  );
};

export default PostDetail;
