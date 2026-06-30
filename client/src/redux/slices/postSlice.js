import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPost = createAsyncThunk(
  'post/fetchPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки поста',
      );
    }
  },
);

export const fetchComments = createAsyncThunk(
  'post/fetchComments',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/comments/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки комментариев',
      );
    }
  },
);

export const addComment = createAsyncThunk(
  'post/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/comments/${postId}`, { text });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка отправки комментария',
      );
    }
  },
);

export const togglePostLike = createAsyncThunk(
  'post/togglePostLike',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/likes/${postId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка лайка');
    }
  },
);

function flipLike(post) {
  post.isLiked = !post.isLiked;
  post.likesCount += post.isLiked ? 1 : -1;
}

const postSlice = createSlice({
  name: 'post',
  initialState: {
    post: null,
    comments: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPost.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.post = null;
        state.comments = [];
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.post = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        if (state.post) {
          state.post.commentsCount += 1;
        }
      })
      // Лайк поста — тот же оптимистичный приём, что и в ленте
      .addCase(togglePostLike.pending, (state) => {
        if (state.post) flipLike(state.post);
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        if (state.post) {
          state.post.isLiked = action.payload.liked;
          state.post.likesCount = action.payload.likesCount;
        }
      })
      .addCase(togglePostLike.rejected, (state) => {
        if (state.post) flipLike(state.post);
      });
  },
});

export default postSlice.reducer;
