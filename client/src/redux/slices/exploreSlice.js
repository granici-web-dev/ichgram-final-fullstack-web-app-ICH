import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchExplore = createAsyncThunk(
  'explore/fetchExplore',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/explore');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки',
      );
    }
  },
);

const exploreSlice = createSlice({
  name: 'explore',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExplore.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchExplore.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchExplore.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default exploreSlice.reducer;
