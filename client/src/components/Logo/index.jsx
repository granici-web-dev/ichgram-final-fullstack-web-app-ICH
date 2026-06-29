import logo from '../../assets/logo.png';
import styles from './styles.module.css';

function Logo({ width = 175 }) {
  return (
    <img src={logo} alt="ICHgram" className={styles.logo} style={{ width }} />
  );
}

export default Logo;
