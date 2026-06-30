import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки постов',
      );
    }
  },
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка создания поста',
      );
    }
  },
);

export const toggleLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/likes/${postId}`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка лайка');
    }
  },
);

// Переключаем лайк у поста в стейте (используем для оптимистичного обновления)
function flipLike(state, postId) {
  const post = state.items.find((item) => item._id === postId);
  if (!post) return;
  post.isLiked = !post.isLiked;
  post.likesCount += post.isLiked ? 1 : -1;
}

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Новый пост добавляем в начало ленты
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Оптимистично переключаем сердечко сразу, не дожидаясь ответа
      .addCase(toggleLike.pending, (state, action) => {
        flipLike(state, action.meta.arg);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        // Берём точные значения с сервера
        const post = state.items.find(
          (item) => item._id === action.payload.postId,
        );
        if (post) {
          post.isLiked = action.payload.liked;
          post.likesCount = action.payload.likesCount;
        }
      })
      .addCase(toggleLike.rejected, (state, action) => {
        // Запрос упал — откатываем оптимистичное изменение обратно
        flipLike(state, action.meta.arg);
      });
  },
});

export default postsSlice.reducer;
