"use client";

import { useEffect } from "react";
import { useAppDispatch } from "../../src/redux/store";
import { setFeedType } from "../../src/redux/slices/uiSlice";
import FeedContainer from "../../src/components/feed/FeedContainer";

export default function FollowingPage() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setFeedType("following"));
  }, [dispatch]);

  return <FeedContainer />;
}
