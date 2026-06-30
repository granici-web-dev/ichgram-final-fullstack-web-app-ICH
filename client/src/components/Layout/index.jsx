import { useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../../redux/slices/authSlice';
import Logo from '../Logo';
import homeIcon from '../../assets/icons/home.svg';
import searchIcon from '../../assets/icons/search.svg';
import exploreIcon from '../../assets/icons/explore.svg';
import messagesIcon from '../../assets/icons/messages.svg';
import notificationsIcon from '../../assets/icons/notifications.svg';
import createIcon from '../../assets/icons/create.svg';
import styles from './styles.module.css';

// Пункты меню: c полем `to` — ссылки, без него — кнопки (Search и Notifications
// открывают панели, которые сделаем позже)
const navItems = [
  { label: 'Home', icon: homeIcon, to: '/' },
  { label: 'Search', icon: searchIcon },
  { label: 'Explore', icon: exploreIcon, to: '/explore' },
  { label: 'Messages', icon: messagesIcon, to: '/messages' },
  { label: 'Notifications', icon: notificationsIcon },
  { label: 'Create', icon: createIcon, to: '/add' },
];

function Layout() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Подгружаем текущего пользователя при входе в приложение
  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Link to="/" className={styles.logo}>
          <Logo width={103} />
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) =>
            item.to ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? `${styles.link} ${styles.active}` : styles.link
                }
              >
                <img className={styles.icon} src={item.icon} alt="" />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <button key={item.label} type="button" className={styles.link}>
                <img className={styles.icon} src={item.icon} alt="" />
                <span>{item.label}</span>
              </button>
            ),
          )}

          <NavLink
            to={user ? `/profile/${user.username}` : '/profile'}
            className={({ isActive }) =>
              isActive
                ? `${styles.link} ${styles.profile} ${styles.active}`
                : `${styles.link} ${styles.profile}`
            }
          >
            {user?.avatar ? (
              <img className={styles.avatar} src={user.avatar} alt="" />
            ) : (
              <span className={styles.avatar} />
            )}
            <span>Profile</span>
          </NavLink>
        </nav>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
