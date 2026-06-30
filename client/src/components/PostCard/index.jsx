import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toggleLike } from '../../redux/slices/postsSlice';
import { timeAgo } from '../../utils/timeAgo';
import likeIcon from '../../assets/icons/like.svg';
import likeActiveIcon from '../../assets/icons/like-active.svg';
import commentIcon from '../../assets/icons/comment.svg';
import styles from './styles.module.css';

function PostCard({ post }) {
  const dispatch = useDispatch();
  const { author, image, description, createdAt } = post;
  const { likesCount, commentsCount, isLiked } = post;

  const handleLike = () => {
    dispatch(toggleLike(post._id));
  };

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <Link to={`/profile/${author.username}`} className={styles.avatarLink}>
          {author.avatar ? (
            <img className={styles.avatar} src={author.avatar} alt="" />
          ) : (
            <span className={styles.avatar} />
          )}
        </Link>
        <Link to={`/profile/${author.username}`} className={styles.username}>
          {author.username}
        </Link>
        <span className={styles.dot}>•</span>
        <span className={styles.time}>{timeAgo(createdAt)}</span>
        <span className={styles.dot}>•</span>
        <button type="button" className={styles.follow}>
          follow
        </button>
      </header>

      <img className={styles.image} src={image} alt={description} />

      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={handleLike}>
          <img src={isLiked ? likeActiveIcon : likeIcon} alt="like" />
        </button>
        <button type="button" className={styles.action}>
          <img src={commentIcon} alt="comment" />
        </button>
      </div>

      <p className={styles.likes}>{likesCount.toLocaleString()} likes</p>

      {description && (
        <p className={styles.caption}>
          <Link to={`/profile/${author.username}`} className={styles.captionUser}>
            {author.username}
          </Link>{' '}
          {description}
        </p>
      )}

      {commentsCount > 0 && (
        <p className={styles.comments}>View all comments ({commentsCount})</p>
      )}
    </article>
  );
}

export default PostCard;
