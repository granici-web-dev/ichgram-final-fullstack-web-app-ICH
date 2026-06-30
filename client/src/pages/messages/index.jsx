import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchConversations,
  openChat,
  addMessage,
} from '../../redux/slices/messagesSlice';
import { getSocket } from '../../api/socket';
import { timeAgo } from '../../utils/timeAgo';
import styles from './styles.module.css';

function Messages() {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const me = useSelector((state) => state.auth.user);
  const { conversations, messages, activeUser } = useSelector(
    (state) => state.messages,
  );
  const [text, setText] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    if (userId) {
      dispatch(openChat(userId));
    }
  }, [dispatch, userId]);

  // Подписка на входящие сообщения через сокет
  useEffect(() => {
    const socket = getSocket();
    const handler = (msg) => {
      dispatch(addMessage({ msg, myId: me?._id }));
      dispatch(fetchConversations());
    };
    socket.on('receiveMessage', handler);
    return () => socket.off('receiveMessage', handler);
  }, [dispatch, me]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages]);

  const handleSend = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value || !activeUser) return;
    getSocket().emit('sendMessage', { to: activeUser._id, text: value });
    setText('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.list}>
          <h2 className={styles.myName}>{me?.username}</h2>

          {conversations.map((conv) => (
            <button
              key={conv.user._id}
              type="button"
              className={
                userId === conv.user._id
                  ? `${styles.conv} ${styles.convActive}`
                  : styles.conv
              }
              onClick={() => navigate(`/messages/${conv.user._id}`)}
            >
              {conv.user.avatar ? (
                <img className={styles.convAvatar} src={conv.user.avatar} alt="" />
              ) : (
                <span className={styles.convAvatar} />
              )}
              <span className={styles.convBody}>
                <span className={styles.convName}>{conv.user.username}</span>
                <span className={styles.convPreview}>
                  {conv.lastMessage.text} · {timeAgo(conv.lastMessage.createdAt)}
                </span>
              </span>
            </button>
          ))}
        </aside>

        <section className={styles.thread}>
          {activeUser ? (
            <>
              <header className={styles.threadHeader}>
                {activeUser.avatar ? (
                  <img
                    className={styles.headerAvatar}
                    src={activeUser.avatar}
                    alt=""
                  />
                ) : (
                  <span className={styles.headerAvatar} />
                )}
                <span className={styles.headerName}>{activeUser.username}</span>
              </header>

              <div className={styles.messages}>
                <div className={styles.intro}>
                  {activeUser.avatar ? (
                    <img
                      className={styles.introAvatar}
                      src={activeUser.avatar}
                      alt=""
                    />
                  ) : (
                    <span className={styles.introAvatar} />
                  )}
                  <span className={styles.introName}>{activeUser.username}</span>
                  <span className={styles.introSub}>
                    {activeUser.username} · {activeUser.fullName}
                  </span>
                  <Link
                    to={`/profile/${activeUser._id}`}
                    className={styles.viewProfile}
                  >
                    View profile
                  </Link>
                </div>

                {messages.map((message) => {
                  const mine = message.sender._id === me?._id;
                  return (
                    <div
                      key={message._id}
                      className={mine ? styles.rowMine : styles.row}
                    >
                      {message.sender.avatar ? (
                        <img
                          className={styles.bubbleAvatar}
                          src={message.sender.avatar}
                          alt=""
                        />
                      ) : (
                        <span className={styles.bubbleAvatar} />
                      )}
                      <p className={mine ? styles.bubbleMine : styles.bubble}>
                        {message.text}
                      </p>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form className={styles.composer} onSubmit={handleSend}>
                <input
                  className={styles.input}
                  placeholder="Write message"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </form>
            </>
          ) : (
            <div className={styles.empty}>Select a chat to start messaging</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Messages;
