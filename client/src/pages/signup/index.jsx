import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../redux/slices/authSlice';
import Logo from '../../components/Logo';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from './styles.module.css';

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    username: '',
    password: '',
  });

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Logo />

        <p className={styles.subtitle}>
          Sign up to see photos and videos from your friends.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
          />
          <Input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <p className={styles.legal}>
            People who use our service may have uploaded your contact
            information to Instagram. <span className={styles.link}>Learn More</span>
          </p>
          <p className={styles.legal}>
            By signing up, you agree to our{' '}
            <span className={styles.link}>Terms</span> ,{' '}
            <span className={styles.link}>Privacy Policy</span> and{' '}
            <span className={styles.link}>Cookies Policy</span> .
          </p>

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" disabled={status === 'loading'}>
            Sign up
          </Button>
        </form>
      </div>

      <div className={styles.loginCard}>
        <span>Have an account? </span>
        <Link to="/login" className={styles.loginLink}>
          Log in
        </Link>
      </div>
    </div>
  );
}

export default SignUp;
