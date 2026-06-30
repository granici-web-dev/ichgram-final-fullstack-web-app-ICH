import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки профиля',
      );
    }
  },
);

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки постов',
      );
    }
  },
);

export const toggleFollow = createAsyncThunk(
  'profile/toggleFollow',
  async ({ userId, isFollowing }, { rejectWithValue }) => {
    try {
      if (isFollowing) {
        await api.delete(`/follow/${userId}`);
      } else {
        await api.post(`/follow/${userId}`);
      }
      return { isFollowing: !isFollowing };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка подписки');
    }
  },
);

// Переключаем подписку в стейте (для оптимистичного обновления)
function flipFollow(state) {
  if (!state.user) return;
  state.user.isFollowing = !state.user.isFollowing;
  state.user.followersCount += state.user.isFollowing ? 1 : -1;
}

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    user: null,
    posts: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        // Сбрасываем прошлый профиль, чтобы при переходе не мелькали чужие данные
        state.user = null;
        state.posts = [];
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
      })
      // Оптимистично переключаем кнопку Follow/Following
      .addCase(toggleFollow.pending, (state) => {
        flipFollow(state);
      })
      .addCase(toggleFollow.rejected, (state) => {
        flipFollow(state);
      });
  },
});

export default profileSlice.reducer;
