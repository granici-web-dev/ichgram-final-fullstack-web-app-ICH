import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки уведомлений',
      );
    }
  },
);

export const markNotificationsRead = createAsyncThunk(
  'notifications/markRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.put('/notifications/read');
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Ошибка');
    }
  },
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    status: 'idle',
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(markNotificationsRead.fulfilled, (state) => {
        state.items.forEach((item) => {
          item.read = true;
        });
      });
  },
});

export default notificationsSlice.reducer;
