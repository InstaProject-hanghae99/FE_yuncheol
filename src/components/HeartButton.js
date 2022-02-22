import React, { useEffect, useState } from "react";
import { Grid, Text } from "../elements";
import FavoriteIcon from "@material-ui/icons/Favorite";

import { useDispatch, useSelector } from "react-redux";
import { actionCreators as likeActions } from "../redux/modules/like";
import { apiKey } from "../shared/firebase";

const HeartButton = (props) => {
  const _sessioin_key = `firebase:authUser:${apiKey}:[DEFAULT]`;
  const is_session = sessionStorage.getItem(_sessioin_key) ? true : false;

  const dispatch = useDispatch();
  const like_list = useSelector((state) => state.like.list);
  const user_info = useSelector((state) => state.user.user);

  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    if (like_list[props.post_id]?.includes(user_info.uid)) {
      setToggle(true);
    } else {
      setToggle(false);
    }
  });
  const clickHeart = () => {
    console.log(props.post_id);
    if (!like_list[props.post_id]?.includes(user_info.uid)) {
      dispatch(likeActions.addLikeFB(props.post_id));
    } else if (like_list[props.post_id]?.includes(user_info.uid)) {
      dispatch(likeActions.cancelLikeFB(props.post_id));
    }
    console.log("clickHeart");
  };
  return (
    <>
      <Grid _onClick={clickHeart}>
        <FavoriteIcon style={toggle ? { color: "pink" } : { color: "gray" }} />
      </Grid>
    </>
  );
};

export default HeartButton;
