import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo';
import Button from '../../components/Button';
import lockIcon from '../../assets/trouble.svg';
import styles from './styles.module.css';

function Reset() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (value.trim()) {
      setSent(true);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/login">
          <Logo width={97} />
        </Link>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.body}>
            <img className={styles.icon} src={lockIcon} alt="" />
            <h1 className={styles.title}>Trouble logging in?</h1>
            <p className={styles.text}>
              Enter your email, phone, or username and we&apos;ll send you a link
              to get back into your account.
            </p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={styles.input}
                type="text"
                placeholder="Email or Username"
                value={value}
                onChange={(event) => setValue(event.target.value)}
              />
              <Button type="submit">Reset your password</Button>
            </form>

            {sent && (
              <p className={styles.sent}>
                If an account matches, we&apos;ve sent a recovery link.
              </p>
            )}

            <div className={styles.divider}>
              <span className={styles.line} />
              <span className={styles.or}>OR</span>
              <span className={styles.line} />
            </div>

            <Link to="/signup" className={styles.createLink}>
              Create new account
            </Link>
          </div>

          <Link to="/login" className={styles.backBar}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Reset;
