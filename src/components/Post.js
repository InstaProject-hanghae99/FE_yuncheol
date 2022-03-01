import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import Moment from "react-moment";
import "moment/locale/ko";

import { Grid, Image, Text, Button } from "../elements";
import { history } from "../redux/configureStore";
import { actionCreators as postActions } from "../redux/modules/post";
import { actionCreators as likeActions } from "../redux/modules/like";

import HeartButton from "./HeartButton";
import Permit from "../shared/Permit";

const Post = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(likeActions.getLikeFB(props.board_id));
  });
  const displayCreatedAt = (createdAt) => {
    let startTime = new Date(createdAt);
    let nowTime = Date.now();
    if (parseInt(startTime - nowTime) > -60000) {
      return <Moment format="방금 전">{startTime}</Moment>;
    }
    if (parseInt(startTime - nowTime) < -86400000) {
      return <Moment format="MMM D일">{startTime}</Moment>;
    }
    if (parseInt(startTime - nowTime) > -86400000) {
      return <Moment fromNow>{startTime}</Moment>;
    }
  };
  return (
    <React.Fragment>
      <Grid>
        <Grid>
          <Grid is_flex padding="16px">
            <Grid is_flex width="auto">
              <Image shape="circle" src={props.src} />
              <Text bold>{props.account_name}</Text>
            </Grid>
            <Grid is_flex width="auto">
              <Text>{displayCreatedAt(props.time)}</Text>

              {props.is_me && (
                <>
                  <Button
                    width="auto"
                    padding="4px"
                    margin="4px"
                    _onClick={() => {
                      dispatch(postActions.removePostFB(props.board_id));
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
                      history.replace(`/write/${props.board_id}`);
                    }}
                  >
                    수정
                  </Button>
                </>
              )}
            </Grid>
          </Grid>
          <Grid
            _onClick={() => {
              history.replace(`/post/${props.board_id}`);
            }}
          >
            {props.board_status === "bottom" && (
              <>
                {/* <Button text={props.layout}></Button> */}

                <Grid padding="16px">
                  <Text>{props.content}</Text>
                </Grid>
                <Grid>
                  <Image shape="rectangle" src={props.img_url} />
                </Grid>
              </>
            )}
            {props.board_status === "left" && (
              <>
                {/* <Button text={props.layout}></Button> */}

                <Grid is_flex padding="16px">
                  <Image shape="rectangle" src={props.img_url} />
                  <Text width="95vw">{props.content}</Text>
                </Grid>
              </>
            )}
            {props.board_status === "right" && (
              <>
                {/* <Button text={props.layout}></Button> */}

                <Grid is_flex padding="16px">
                  <Text width="95vw">{props.content}</Text>
                  <Image shape="rectangle" src={props.img_url} />
                </Grid>
              </>
            )}
            {/* <Grid padding="16px">
            <Text>{props.contents}</Text>
          </Grid>
          <Grid>
            <Image shape="rectangle" src={props.image_url} />
          </Grid> */}
          </Grid>
        </Grid>
        <Grid is_flex padding="5px">
          <Grid padding="16px">
            <Permit>
              <HeartButton post_id={props.board_id} />
            </Permit>
            <Text margin="0px" bold>
              좋아요 {props.like}개
            </Text>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

Post.defaultProps = {
  account_name: "mean0",
  user_profile: "http://via.placeholder.com/400x300",

  img_url: "http://via.placeholder.com/400x300",
  content: "고양이네요!",
  comment_cnt: 10,
  time: "2021-02-27 10:00:00",
  is_me: false,
};

export default Post;
