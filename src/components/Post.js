import React from "react";
import { useDispatch } from "react-redux";
// import Grid from "../elements/Grid";
// import Image from "../elements/Image";
// import Text from "../elements/Text";

import { Grid, Image, Text, Button } from "../elements";
import { history } from "../redux/configureStore";
import { actionCreators as postActions } from "../redux/modules/post";

const Post = (props) => {
  const dispatch = useDispatch();
  console.log(props.layout);
  if (props.layout === "") console.log(null);
  return (
    <React.Fragment>
      <Grid>
        <Grid is_flex padding="16px">
          <Grid is_flex width="auto">
            <Image shape="circle" src={props.src} />
            <Text bold>{props.user_info.user_name}</Text>
          </Grid>
          <Grid is_flex width="auto">
            {props.is_me && (
              <>
                <Button
                  width="auto"
                  padding="4px"
                  margin="4px"
                  _onClick={() => {
                    dispatch(postActions.removePostFB(props.id));
                    history.replace("/");
                  }}
                >
                  삭제
                </Button>
                <Button
                  width="auto"
                  padding="4px"
                  margin="4px"
                  _onClick={() => {
                    history.push(`/write/${props.id}`);
                  }}
                >
                  수정
                </Button>
              </>
            )}
            <Text>{props.insert_dt}</Text>
          </Grid>
        </Grid>
        <>
          {props.layout === "bottom" && (
            <>
              <Button text={props.layout}></Button>

              <Grid padding="16px">
                <Text>{props.contents}</Text>
              </Grid>
              <Grid>
                <Image shape="rectangle" src={props.image_url} />
              </Grid>
            </>
          )}
          {props.layout === "left" && (
            <>
              <Button text={props.layout}></Button>

              <Grid is_flex padding="16px">
                <Image shape="rectangle" src={props.image_url} />
                <Text width="95vw">{props.contents}</Text>
              </Grid>
            </>
          )}
          {props.layout === "right" && (
            <>
              <Button text={props.layout}></Button>

              <Grid is_flex padding="16px">
                <Text width="95vw">{props.contents}</Text>
                <Image shape="rectangle" src={props.image_url} />
              </Grid>
            </>
          )}
          {/* <Grid padding="16px">
            <Text>{props.contents}</Text>
          </Grid>
          <Grid>
            <Image shape="rectangle" src={props.image_url} />
          </Grid> */}
        </>
        <Grid padding="16px">
          <Text margin="0px" bold>
            댓글 {props.comment_cnt}개
          </Text>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

Post.defaultProps = {
  user_info: {
    user_name: "mean0",
    user_profile: "http://via.placeholder.com/400x300",
  },
  image_url: "http://via.placeholder.com/400x300",
  contents: "고양이네요!",
  comment_cnt: 10,
  insert_dt: "2021-02-27 10:00:00",
  is_me: false,
};

export default Post;
