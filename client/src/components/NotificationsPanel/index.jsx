import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchNotifications,
  markNotificationsRead,
} from '../../redux/slices/notificationsSlice';
import { timeAgo } from '../../utils/timeAgo';
import styles from './styles.module.css';

// Текст уведомления по типу события
const TEXT = {
  like: 'liked your photo.',
  comment: 'commented your photo.',
  follow: 'started following.',
};

function NotificationsPanel({ onClose }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
    // Открыли панель — помечаем уведомления прочитанными
    dispatch(markNotificationsRead());
  }, [dispatch]);

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.panel}>
        <button type="button" className={styles.close} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>Notifications</h2>
        <p className={styles.section}>New</p>

        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item._id} className={styles.item}>
              <Link to={`/profile/${item.sender._id}`} className={styles.avatarLink}>
                {item.sender.avatar ? (
                  <img className={styles.avatar} src={item.sender.avatar} alt="" />
                ) : (
                  <span className={styles.avatar} />
                )}
              </Link>

              <p className={styles.text}>
                <Link
                  to={`/profile/${item.sender._id}`}
                  className={styles.user}
                >
                  {item.sender.username}
                </Link>{' '}
                {TEXT[item.type]}{' '}
                <span className={styles.time}>{timeAgo(item.createdAt)}</span>
              </p>

              {item.post && (
                <Link
                  to={`/post/${item.post._id}`}
                  state={{ background: location }}
                  className={styles.thumbLink}
                >
                  <img className={styles.thumb} src={item.post.image} alt="" />
                </Link>
              )}
            </li>
          ))}

          {items.length === 0 && (
            <p className={styles.empty}>No notifications yet</p>
          )}
        </ul>
      </aside>
    </>
  );
}

export default NotificationsPanel;
