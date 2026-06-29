import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../redux/slices/authSlice';
import Logo from '../../components/Logo';
import Input from '../../components/Input';
import Button from '../../components/Button';
import phones from '../../assets/login-phones.png';
import styles from './styles.module.css';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ login: '', password: '' });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className={styles.page}>
      <img className={styles.illustration} src={phones} alt="" />

      <div className={styles.authColumn}>
        <div className={styles.card}>
          <Logo />

          <form className={styles.form} onSubmit={handleSubmit}>
            <Input
              name="login"
              placeholder="Username, or email"
              value={form.login}
              onChange={handleChange}
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
            <Button type="submit" disabled={status === 'loading'}>
              Log in
            </Button>

            <div className={styles.divider}>
              <span className={styles.line} />
              <span className={styles.or}>OR</span>
              <span className={styles.line} />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Link to="/reset" className={styles.forgot}>
              Forgot password?
            </Link>
          </form>
        </div>

        <div className={styles.signupCard}>
          <span>Don&apos;t have an account? </span>
          <Link to="/signup" className={styles.signupLink}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
