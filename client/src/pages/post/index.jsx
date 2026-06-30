import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPost,
  fetchComments,
  addComment,
  togglePostLike,
} from '../../redux/slices/postSlice';
import { timeAgo } from '../../utils/timeAgo';
import likeIcon from '../../assets/icons/like.svg';
import likeActiveIcon from '../../assets/icons/like-active.svg';
import commentIcon from '../../assets/icons/comment.svg';
import emojiIcon from '../../assets/icons/emoji.svg';
import styles from './styles.module.css';

function PostModal() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { post, comments } = useSelector((state) => state.post);
  const [text, setText] = useState('');

  useEffect(() => {
    dispatch(fetchPost(postId));
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const handleSend = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    const result = await dispatch(addComment({ postId, text: value }));
    if (addComment.fulfilled.match(result)) {
      setText('');
    }
  };

  const close = () => navigate(-1);

  if (!post) {
    return (
      <div className={styles.overlay} onClick={close}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  // Подпись автора показываем первой строкой, как комментарий
  const author = post.author;

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.dialog} onClick={(event) => event.stopPropagation()}>
        <div className={styles.imageBox}>
          <img className={styles.image} src={post.image} alt={post.description} />
        </div>

        <div className={styles.side}>
          <header className={styles.header}>
            <Link to={`/profile/${author._id}`} className={styles.authorLink}>
              {author.avatar ? (
                <img className={styles.avatar} src={author.avatar} alt="" />
              ) : (
                <span className={styles.avatar} />
              )}
              <span className={styles.username}>{author.username}</span>
            </Link>
          </header>

          <div className={styles.comments}>
            {post.description && (
              <div className={styles.comment}>
                {author.avatar ? (
                  <img className={styles.commentAvatar} src={author.avatar} alt="" />
                ) : (
                  <span className={styles.commentAvatar} />
                )}
                <div className={styles.commentBody}>
                  <p className={styles.commentText}>
                    <Link
                      to={`/profile/${author._id}`}
                      className={styles.commentUser}
                    >
                      {author.username}
                    </Link>{' '}
                    {post.description}
                  </p>
                  <span className={styles.commentTime}>
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            )}

            {comments.map((comment) => (
              <div key={comment._id} className={styles.comment}>
                {comment.author.avatar ? (
                  <img
                    className={styles.commentAvatar}
                    src={comment.author.avatar}
                    alt=""
                  />
                ) : (
                  <span className={styles.commentAvatar} />
                )}
                <div className={styles.commentBody}>
                  <p className={styles.commentText}>
                    <Link
                      to={`/profile/${comment.author._id}`}
                      className={styles.commentUser}
                    >
                      {comment.author.username}
                    </Link>{' '}
                    {comment.text}
                  </p>
                  <span className={styles.commentTime}>
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => dispatch(togglePostLike(postId))}
            >
              <img src={post.isLiked ? likeActiveIcon : likeIcon} alt="like" />
            </button>
            <button type="button" className={styles.action}>
              <img src={commentIcon} alt="comment" />
            </button>
          </div>

          <p className={styles.likes}>{post.likesCount.toLocaleString()} likes</p>
          <span className={styles.time}>{timeAgo(post.createdAt)}</span>

          <form className={styles.form} onSubmit={handleSend}>
            <img className={styles.emoji} src={emojiIcon} alt="" />
            <input
              className={styles.input}
              placeholder="Add comment"
              value={text}
              onChange={(event) => setText(event.target.value)}
            />
            <button type="submit" className={styles.send} disabled={!text.trim()}>
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
