import axios from "axios";
import {
  LOGIN_USER,
  REGISTER_USER,
  USER_PROFILE,
  LOGOUT_USER,
  RESET_VALUE,
  GET_PREVIEW,
  CREATE_POST,
  EDIT_POST,
  DELETE_POST,
  DELETE_SINGLE_POST,
  GET_FEED,
  GET_POST,
  ADD_COMMENT,
  EDIT_COMMENT,
  DELETE_COMMENT,
  LIKE_POST,
  DISLIKE_POST,
  ADD_COMMENT_SINGLE_POST,
  DELETE_COMMENT_SINGLE_POST,
  GET_COMMENT,
  SUBMIT_NEW_POST,
  LIKE_SINGLE_POST,
  DISLIKE_SINGLE_POST,
  FOLLOW_USER,
  UNFOLLOW_USER
} from "../constants/action-types";
import history from "../history";

export const loginUser = data => dispatch => {
  const { username, password } = data;

  axios
    .post("/api/login", {
      username: username,
      password: password
    })
    .then(response => {
      if (response.data.message) {
        dispatch({ type: LOGIN_USER, payload: response.data.message });
      } else if (!response.data.message && response.data.id) {
        localStorage.setItem("Auth", JSON.stringify(response.data));
        dispatch({ type: LOGIN_USER, payload: response.data });
        history.push("/posts");
      }
    })
    .catch(error => {
      console.log(error);
      dispatch({ type: LOGIN_USER, payload: "error" });
    });
};

export const registerUser = data => dispatch => {
  const formData = new FormData();
  if (data.image) {
    formData.append("file", data.image[0]);
  }
  formData.append("username", data.username);
  formData.append("password", data.password);
  axios
    .post("/api/register", formData)
    .then(response => {
      dispatch({ type: REGISTER_USER, payload: response.data });
      if (!response.data.error) {
        history.push("/");
      }
    })
    .catch(error => {
      console.log(error);
    });
};

export const logout = () => dispatch => {
  axios
    .post("/api/logout")
    .then(response => {
      localStorage.removeItem("Auth");
      dispatch({ type: LOGOUT_USER, payload: response.data });
    })
    .catch(error => {
      console.log(error);
    });
};

// for image preview
export const getPreview = images => dispatch => {
  if (images[1]) {
    console.log("more than 1 image");
    return dispatch({
      type: GET_PREVIEW,
      payload: { message: "Only 1 image allowed" }
    });
  } else {
    dispatch({ type: GET_PREVIEW, payload: images[0].preview });
  }
};

// resets image preview
export const resetValue = () => dispatch => {
  dispatch({ type: RESET_VALUE, payload: "" });
};

export const getFeed = () => dispatch => {
  axios
    .get("/api/posts")
    .then(posts => {
      dispatch({ type: GET_FEED, payload: posts.data });
    })
    .catch(error => {
      console.log(error);
    });
};

export const getPost = postId => dispatch => {
  axios
    .get(`/api/posts/${postId}`)
    .then(post => {
      dispatch({ type: GET_POST, payload: post.data });
    })
    .catch(error => {
      console.log(error);
    });
};

export const submitNewPost = () => dispatch => {
  return dispatch({ type: SUBMIT_NEW_POST, payload: true });
};

export const createPost = data => dispatch => {
  const user = JSON.parse(localStorage.getItem("Auth"));
  const formData = new FormData();
  formData.append("file", data.image[0]);
  if (data.caption) {
    formData.append("caption", data.caption);
  }
  formData.append("authorId", user.id);
  formData.append("username", user.username);
  formData.append("avatar", user.avatar);

  axios
    .post("/api/posts", formData)
    .then(post => {
      dispatch({ type: CREATE_POST, payload: post.data });
      history.push("/posts");
    })
    .catch(error => {
      console.log(error);
    });
};

export const editPost = (data, postId) => dispatch => {
  if (typeof data.image === "object" && data.image.length > 1) {
    return dispatch({
      type: EDIT_POST,
      payload: "Only 1 image allowed"
    });
  }
  const formData = new FormData();
  if (typeof data.image === "object") {
    formData.append("file", data.image[0]);
  }
  if (data.caption !== "" && data.caption !== undefined) {
    formData.append("caption", data.caption);
  }

  axios
    .put(`/api/posts/${postId}`, formData)
    .then(post => {
      dispatch({ type: EDIT_POST, payload: post.data });
      history.push(`/posts/${post.data._id}`);
    })
    .catch(error => {
      console.log(error);
    });
};

export const deletePost = (postId, singlePost) => dispatch => {
  axios
    .delete(`/api/posts/${postId}`)
    .then(response => {
      if (singlePost) {
        dispatch({
          type: DELETE_SINGLE_POST,
          payload: response
        });
      } else {
        dispatch({
          type: DELETE_POST,
          payload: postId
        });
      }
      history.push("/posts");
    })
    .catch(error => {
      console.log(error);
    });
};

export const likePost = (postId, singlePost) => dispatch => {
  axios
    .post(`/api/posts/${postId}/likes`)
    .then(response => {
      if (singlePost) {
        return dispatch({
          type: LIKE_SINGLE_POST,
          payload: response.data.like
        });
      } else {
        return dispatch({
          type: LIKE_POST,
          payload: { postId, like: response.data.like }
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
};

export const dislikePost = (postId, like, singlePost) => dispatch => {
  axios
    .delete(`/api/posts/${postId}/likes/${like._id}`)
    .then(post => {
      if (singlePost) {
        return dispatch({
          type: DISLIKE_SINGLE_POST,
          payload: like
        });
      } else {
        dispatch({
          type: DISLIKE_POST,
          payload: { postId, likeId: like._id }
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
};

export const getUserProfile = id => dispatch => {
  axios
    .get(`/api/users/${id}`)
    .then(user => {
      dispatch({ type: USER_PROFILE, payload: user.data });
    })
    .catch(error => {
      console.log(error);
    });
};

export const addComment = (text, id, singlePost) => dispatch => {
  axios
    .post(`/api/posts/${id}/comments`, {
      comment: text.comment
    })
    .then(response => {
      // checks if function was called from a single post page instead of the feed
      if (singlePost) {
        return dispatch({
          type: ADD_COMMENT_SINGLE_POST,
          payload: response.data.comment
        });
      } else {
        return dispatch({
          type: ADD_COMMENT,
          payload: {
            postId: response.data.postId,
            comment: response.data.comment
          }
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
};

export const getComment = (postId, commentId) => dispatch => {
  axios
    .get(`/api/posts/${postId}/comments/${commentId}/edit`)
    .then(comment => {
      dispatch({ type: GET_COMMENT, payload: comment.data });
    })
    .catch(error => {
      console.log(error);
    });
};

export const editComment = (postId, commentId, text) => dispatch => {
  axios
    .put(`/api/posts/${postId}/comments/${commentId}`, { comment: text })
    .then(response => {
      dispatch({ type: EDIT_COMMENT, payload: response.data.message });
      history.push(`/posts/${postId}`);
    })
    .catch(error => {
      console.log(error);
    });
};

export const deleteComment = (postId, comment, singlePost) => dispatch => {
  axios
    .delete(`/api/posts/${postId}/comments/${comment._id}`)
    .then(response => {
      if (singlePost) {
        dispatch({
          type: DELETE_COMMENT_SINGLE_POST,
          payload: comment
        });
      } else {
        dispatch({
          type: DELETE_COMMENT,
          payload: { postId, commentId: comment._id }
        });
      }
    })
    .catch(error => {
      console.log(error);
    });
};

export const getUser = () => dispatch => {
  axios
    .get("/api/user")
    .then(response => {
      console.log(response.data);
      dispatch({ type: "GET_USERINFO", payload: response.data });
    })
    .catch(error => {
      console.log(error);
    });
};

export const followUser = userId => dispatch => {
  axios
    .post(`/api/users/${userId}/follow`)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
};

export const unfollowUser = (userId, followId) => dispatch => {
  axios
    .delete(`/api/users/${userId}/follow/${followId}`)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
};
