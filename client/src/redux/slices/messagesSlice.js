import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/messages');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки диалогов',
      );
    }
  },
);

// Открываем переписку: история сообщений + данные собеседника
export const openChat = createAsyncThunk(
  'messages/openChat',
  async (userId, { rejectWithValue }) => {
    try {
      const [messages, user] = await Promise.all([
        api.get(`/messages/${userId}`),
        api.get(`/users/${userId}`),
      ]);
      return { messages: messages.data, user: user.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Ошибка загрузки переписки',
      );
    }
  },
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    conversations: [],
    messages: [],
    activeUser: null,
    status: 'idle',
  },
  reducers: {
    // Новое сообщение из сокета — добавляем, если оно из открытой переписки
    addMessage: (state, action) => {
      const { msg, myId } = action.payload;
      const other = msg.sender._id === myId ? msg.recipient : msg.sender._id;
      if (state.activeUser && other === state.activeUser._id) {
        state.messages.push(msg);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload;
      })
      .addCase(openChat.pending, (state) => {
        state.status = 'loading';
        state.messages = [];
      })
      .addCase(openChat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.messages = action.payload.messages;
        state.activeUser = action.payload.user;
      })
      .addCase(openChat.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { addMessage } = messagesSlice.actions;
export default messagesSlice.reducer;
