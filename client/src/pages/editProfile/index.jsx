import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../../redux/slices/authSlice';
import Footer from '../../components/Footer';
import styles from './styles.module.css';

const MAX_BIO = 150;

function EditProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fileInputRef = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [username, setUsername] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Подставляем текущие данные, когда профиль загрузился
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setWebsite(user.website || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handlePhoto = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setAvatarFile(selected);
      setAvatarPreview(URL.createObjectURL(selected));
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('website', website);
    formData.append('bio', bio);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    setSaving(true);
    const result = await dispatch(updateProfile(formData));
    setSaving(false);

    if (updateProfile.fulfilled.match(result)) {
      navigate(`/profile/${user._id}`);
    } else {
      setError(result.payload);
    }
  };

  const avatarSrc = avatarPreview || user?.avatar;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Edit profile</h1>

      <div className={styles.card}>
        {avatarSrc ? (
          <img className={styles.avatar} src={avatarSrc} alt="" />
        ) : (
          <span className={styles.avatar} />
        )}
        <div className={styles.cardInfo}>
          <span className={styles.cardName}>{user?.username}</span>
          <span className={styles.cardBio}>{user?.bio}</span>
        </div>
        <button
          type="button"
          className={styles.newPhoto}
          onClick={() => fileInputRef.current.click()}
        >
          New photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePhoto}
        />
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Username</span>
        <input
          className={styles.input}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Website</span>
        <input
          className={styles.input}
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>About</span>
        <div className={styles.textareaWrap}>
          <textarea
            className={styles.textarea}
            maxLength={MAX_BIO}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
          />
          <span className={styles.counter}>
            {bio.length} / {MAX_BIO}
          </span>
        </div>
      </label>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={styles.save}
        onClick={handleSave}
        disabled={saving}
      >
        Save
      </button>

      <Footer />
    </div>
  );
}

export default EditProfile;
