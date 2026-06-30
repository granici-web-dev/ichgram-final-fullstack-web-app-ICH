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

export const toggleFollow = createAsyncThunk(
  'posts/toggleFollow',
  async ({ userId, isFollowing }, { rejectWithValue }) => {
    try {
      if (isFollowing) {
        await api.delete(`/follow/${userId}`);
      } else {
        await api.post(`/follow/${userId}`);
      }
      return { userId, isFollowing: !isFollowing };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка подписки');
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

// Обновляем флаг подписки у всех постов этого автора в ленте
function setAuthorFollow(state, userId, value) {
  state.items.forEach((post) => {
    if (post.author?._id === userId) {
      post.author.isFollowing = value;
    }
  });
}

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {
    // Синхронизируем ленту после удаления/редактирования поста в модалке
    removePost: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    replacePost: (state, action) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
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
      })
      // Подписка/отписка на автора прямо из ленты (оптимистично)
      .addCase(toggleFollow.pending, (state, action) => {
        const { userId, isFollowing } = action.meta.arg;
        setAuthorFollow(state, userId, !isFollowing);
      })
      .addCase(toggleFollow.fulfilled, (state, action) => {
        setAuthorFollow(state, action.payload.userId, action.payload.isFollowing);
      })
      .addCase(toggleFollow.rejected, (state, action) => {
        const { userId, isFollowing } = action.meta.arg;
        setAuthorFollow(state, userId, isFollowing);
      });
  },
});

export const { removePost, replacePost } = postsSlice.actions;
export default postsSlice.reducer;
