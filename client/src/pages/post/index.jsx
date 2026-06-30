import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import EmojiPicker from 'emoji-picker-react';
import {
  fetchPost,
  fetchComments,
  addComment,
  updatePost,
  deletePost,
  togglePostLike,
  toggleCommentLike,
} from '../../redux/slices/postSlice';
import { removePost, replacePost } from '../../redux/slices/postsSlice';
import { removeProfilePost } from '../../redux/slices/profileSlice';
import { timeAgo } from '../../utils/timeAgo';
import likeIcon from '../../assets/icons/like.svg';
import likeActiveIcon from '../../assets/icons/like-active.svg';
import commentIcon from '../../assets/icons/comment.svg';
import emojiIcon from '../../assets/icons/emoji.svg';
import optionsIcon from '../../assets/icons/options.svg';
import styles from './styles.module.css';

function PostModal() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { post, comments } = useSelector((state) => state.post);
  const currentUser = useSelector((state) => state.auth.user);

  const [text, setText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    dispatch(fetchPost(postId));
    dispatch(fetchComments(postId));
  }, [dispatch, postId]);

  const close = () => navigate(-1);

  const handleSend = async (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    const result = await dispatch(addComment({ postId, text: value }));
    if (addComment.fulfilled.match(result)) {
      setText('');
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deletePost(postId));
    if (deletePost.fulfilled.match(result)) {
      dispatch(removePost(postId));
      dispatch(removeProfilePost(postId));
      navigate(-1);
    }
  };

  const handleEditStart = () => {
    setEditText(post.description || '');
    setEditing(true);
    setMenuOpen(false);
  };

  const handleEditSave = async () => {
    const result = await dispatch(updatePost({ postId, description: editText }));
    if (updatePost.fulfilled.match(result)) {
      dispatch(replacePost(result.payload));
      setEditing(false);
    }
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setConfirmDelete(false);
    setCopied(false);
  };

  const handleGoToPost = () => {
    closeMenu();
    navigate(`/post/${postId}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    setCopied(true);
  };

  if (!post) {
    return (
      <div className={styles.overlay} onClick={close}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  const author = post.author;
  const isOwn = currentUser && author._id === currentUser._id;

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
            {isOwn && (
              <button
                type="button"
                className={styles.options}
                onClick={() => setMenuOpen(true)}
              >
                <img src={optionsIcon} alt="options" />
              </button>
            )}
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
                    {comment.likesCount > 0 && ` · Likes: ${comment.likesCount}`}
                  </span>
                </div>

                <button
                  type="button"
                  className={styles.commentLike}
                  onClick={() => dispatch(toggleCommentLike(comment._id))}
                >
                  <img
                    src={comment.isLiked ? likeActiveIcon : likeIcon}
                    alt="like"
                  />
                </button>
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

          {editing ? (
            <div className={styles.editForm}>
              <textarea
                className={styles.editInput}
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
              />
              <div className={styles.editButtons}>
                <button
                  type="button"
                  className={styles.editCancel}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.editSave}
                  onClick={handleEditSave}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSend}>
              {showEmoji && (
                <div className={styles.emojiPopover}>
                  <EmojiPicker
                    width={320}
                    height={380}
                    onEmojiClick={(emojiData) =>
                      setText((prev) => prev + emojiData.emoji)
                    }
                  />
                </div>
              )}
              <button
                type="button"
                className={styles.emojiButton}
                onClick={() => setShowEmoji((value) => !value)}
              >
                <img className={styles.emoji} src={emojiIcon} alt="emoji" />
              </button>
              <input
                className={styles.input}
                placeholder="Add comment"
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
              <button
                type="submit"
                className={styles.send}
                disabled={!text.trim()}
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      {menuOpen && (
        <div
          className={styles.menuOverlay}
          onClick={(event) => {
            event.stopPropagation();
            closeMenu();
          }}
        >
          <div className={styles.menu} onClick={(event) => event.stopPropagation()}>
            {confirmDelete ? (
              <>
                <p className={styles.menuTitle}>Delete this post?</p>
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuDanger}`}
                  onClick={handleDelete}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${styles.menuItem} ${styles.menuDanger}`}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleEditStart}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleGoToPost}
                >
                  Go to post
                </button>
                <button
                  type="button"
                  className={styles.menuItem}
                  onClick={handleCopyLink}
                >
                  {copied ? 'Link copied!' : 'Copy link'}
                </button>
                <button type="button" className={styles.menuItem} onClick={closeMenu}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostModal;
