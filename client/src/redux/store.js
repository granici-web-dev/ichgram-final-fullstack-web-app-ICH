import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import postReducer from './slices/postSlice';
import profileReducer from './slices/profileSlice';
import exploreReducer from './slices/exploreSlice';
import searchReducer from './slices/searchSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    post: postReducer,
    profile: profileReducer,
    explore: exploreReducer,
    search: searchReducer,
  },
});

export default store;
