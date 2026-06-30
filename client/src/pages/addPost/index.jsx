import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { createPost } from '../../redux/slices/postsSlice';
import uploadCloud from '../../assets/upload-cloud.png';
import emojiIcon from '../../assets/icons/emoji.svg';
import styles from './styles.module.css';

const MAX_LENGTH = 2200;

function AddPost() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const handleFile = (event) => {
    const selected = event.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleShare = async () => {
    if (!file) {
      setError('Сначала выберите изображение');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('description', caption);

    setSubmitting(true);
    const result = await dispatch(createPost(formData));
    setSubmitting(false);

    if (createPost.fulfilled.match(result)) {
      navigate('/');
    } else {
      setError(result.payload);
    }
  };

  return (
    <div className={styles.overlay} onClick={() => navigate(-1)}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <span className={styles.title}>Create new post</span>
          <button
            type="button"
            className={styles.share}
            onClick={handleShare}
            disabled={!file || submitting}
          >
            Share
          </button>
        </header>

        <div className={styles.body}>
          <button
            type="button"
            className={styles.dropzone}
            onClick={() => fileInputRef.current.click()}
          >
            {preview ? (
              <img className={styles.preview} src={preview} alt="" />
            ) : (
              <img className={styles.cloud} src={uploadCloud} alt="" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />

          <div className={styles.side}>
            <div className={styles.user}>
              {user?.avatar ? (
                <img className={styles.avatar} src={user.avatar} alt="" />
              ) : (
                <span className={styles.avatar} />
              )}
              <span className={styles.username}>{user?.username}</span>
            </div>

            <textarea
              className={styles.caption}
              placeholder="Add a caption..."
              maxLength={MAX_LENGTH}
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />

            <div className={styles.meta}>
              <button
                type="button"
                className={styles.emojiButton}
                onClick={() => setShowEmoji((value) => !value)}
              >
                <img className={styles.emoji} src={emojiIcon} alt="emoji" />
              </button>
              <span className={styles.counter}>
                {caption.length}/{MAX_LENGTH}
              </span>

              {showEmoji && (
                <div className={styles.emojiPopover}>
                  <EmojiPicker
                    width={320}
                    height={380}
                    onEmojiClick={(emojiData) =>
                      setCaption((prev) => prev + emojiData.emoji)
                    }
                  />
                </div>
              )}
            </div>

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddPost;
