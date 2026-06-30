import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, clearResults } from '../../redux/slices/searchSlice';
import styles from './styles.module.css';

const RECENT_KEY = 'recentSearches';

function readRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function SearchPanel({ onClose }) {
  const dispatch = useDispatch();
  const { results, status } = useSelector((state) => state.search);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(readRecent);

  // Ищем с небольшой задержкой, чтобы не дёргать сервер на каждой букве
  useEffect(() => {
    const value = query.trim();
    if (!value) {
      dispatch(clearResults());
      return;
    }
    const timer = setTimeout(() => {
      dispatch(searchUsers(value));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, dispatch]);

  const handlePick = (user) => {
    // Сохраняем выбранного пользователя в недавние (без дублей, максимум 8)
    const next = [user, ...recent.filter((item) => item._id !== user._id)].slice(
      0,
      8,
    );
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    onClose();
  };

  const renderUser = (user) => (
    <li key={user._id}>
      <Link
        to={`/profile/${user._id}`}
        className={styles.item}
        onClick={() => handlePick(user)}
      >
        {user.avatar ? (
          <img className={styles.avatar} src={user.avatar} alt="" />
        ) : (
          <span className={styles.avatar} />
        )}
        <span className={styles.username}>{user.username}</span>
      </Link>
    </li>
  );

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={styles.panel}>
        <h2 className={styles.title}>Search</h2>

        <div className={styles.inputWrap}>
          <input
            className={styles.input}
            placeholder="Search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery('')}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.divider} />

        {query.trim() ? (
          <ul className={styles.list}>
            {results.map(renderUser)}
            {status === 'succeeded' && results.length === 0 && (
              <p className={styles.empty}>No results found</p>
            )}
          </ul>
        ) : (
          <>
            <p className={styles.recentLabel}>Recent</p>
            <ul className={styles.list}>
              {recent.length > 0 ? (
                recent.map(renderUser)
              ) : (
                <p className={styles.empty}>No recent searches</p>
              )}
            </ul>
          </>
        )}
      </aside>
    </>
  );
}

export default SearchPanel;
