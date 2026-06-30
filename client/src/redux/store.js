import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import postReducer from './slices/postSlice';
import profileReducer from './slices/profileSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    post: postReducer,
    profile: profileReducer,
  },
});

export default store;
