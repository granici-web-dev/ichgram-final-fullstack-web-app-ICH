import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, logout } from '../../redux/slices/authSlice';
import Logo from '../Logo';
import SearchPanel from '../SearchPanel';
import NotificationsPanel from '../NotificationsPanel';
import homeIcon from '../../assets/icons/home.svg';
import searchIcon from '../../assets/icons/search.svg';
import exploreIcon from '../../assets/icons/explore.svg';
import messagesIcon from '../../assets/icons/messages.svg';
import notificationsIcon from '../../assets/icons/notifications.svg';
import createIcon from '../../assets/icons/create.svg';
import logoutIcon from '../../assets/icons/logout.svg';
import burgerIcon from '../../assets/icons/burger.svg';
import styles from './styles.module.css';

// Пункты меню: c полем `to` — ссылки, без него — кнопки (Search открывает панель,
// Notifications сделаем позже)
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Подгружаем текущего пользователя при входе в приложение
  useEffect(() => {
    if (!user) {
      dispatch(fetchMe());
    }
  }, [dispatch, user]);

  // Закрываем выезжающие панели при переходе на другую страницу
  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Верхняя панель только для мобильных — логотип + бургер */}
      <header className={styles.topbar}>
        <Link to="/">
          <Logo width={90} />
        </Link>
        <button
          type="button"
          className={styles.burger}
          onClick={() => setMobileOpen(true)}
        >
          <img src={burgerIcon} alt="menu" />
        </button>
      </header>

      <aside
        className={
          mobileOpen ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar
        }
      >
        <button
          type="button"
          className={styles.close}
          onClick={() => setMobileOpen(false)}
        >
          ×
        </button>

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
              <button
                key={item.label}
                type="button"
                className={
                  (item.label === 'Search' && searchOpen) ||
                  (item.label === 'Notifications' && notificationsOpen)
                    ? `${styles.link} ${styles.active}`
                    : styles.link
                }
                onClick={() => {
                  if (item.label === 'Search') {
                    setNotificationsOpen(false);
                    setSearchOpen((open) => !open);
                  }
                  if (item.label === 'Notifications') {
                    setSearchOpen(false);
                    setNotificationsOpen((open) => !open);
                  }
                }}
              >
                <img className={styles.icon} src={item.icon} alt="" />
                <span>{item.label}</span>
              </button>
            ),
          )}

          <NavLink
            to={user ? `/profile/${user._id}` : '/profile'}
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

        <button
          type="button"
          className={`${styles.link} ${styles.logout}`}
          onClick={handleLogout}
        >
          <img className={styles.icon} src={logoutIcon} alt="" />
          <span>Log out</span>
        </button>
      </aside>

      {searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}
      {notificationsOpen && (
        <NotificationsPanel onClose={() => setNotificationsOpen(false)} />
      )}

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
