import { Link } from 'react-router-dom';
import styles from './styles.module.css';

// Нижнее меню-дубль из макета: ссылки на основные разделы + копирайт
const links = [
  { label: 'Home', to: '/' },
  { label: 'Search', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Messages', to: '/messages' },
  { label: 'Notifications', to: '/' },
  { label: 'Create', to: '/add' },
];

function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        {links.map((link) => (
          <Link key={link.label} to={link.to} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </nav>
      <p className={styles.copyright}>© 2024 ICHgram</p>
    </footer>
  );
}

export default Footer;
