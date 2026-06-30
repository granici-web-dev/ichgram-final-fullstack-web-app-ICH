import Footer from '../../components/Footer';
import phones from '../../assets/login-phones.png';
import styles from './styles.module.css';

function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <img className={styles.phone} src={phones} alt="" />
        <div className={styles.text}>
          <h1 className={styles.title}>Oops! Page Not Found (404 Error)</h1>
          <p className={styles.lines}>
            We&apos;re sorry, but the page you&apos;re looking for doesn&apos;t
            seem to exist.
            <br />
            If you typed the URL manually, please double-check the spelling.
            <br />
            If you clicked on a link, it may be outdated or broken.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default NotFound;
