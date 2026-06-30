import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const searchUsers = createAsyncThunk(
  'search/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка поиска');
    }
  },
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    status: 'idle',
  },
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.results = action.payload;
      })
      .addCase(searchUsers.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { clearResults } = searchSlice.actions;
export default searchSlice.reducer;
