import { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProfile,
  fetchUserPosts,
  toggleFollow,
} from '../../redux/slices/profileSlice';
import Footer from '../../components/Footer';
import styles from './styles.module.css';

function Profile() {
  const { userId } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, posts, status } = useSelector((state) => state.profile);
  const currentUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchProfile(userId));
    dispatch(fetchUserPosts(userId));
  }, [dispatch, userId]);

  if (!user) {
    return <div className={styles.page}>Loading...</div>;
  }

  const isOwn = currentUser && currentUser._id === user._id;

  const handleFollow = () => {
    dispatch(toggleFollow({ userId: user._id, isFollowing: user.isFollowing }));
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.avatarRing}>
          {user.avatar ? (
            <img className={styles.avatar} src={user.avatar} alt="" />
          ) : (
            <span className={styles.avatar} />
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.topRow}>
            <span className={styles.username}>{user.username}</span>
            {isOwn ? (
              <Link to="/edit-profile" className={styles.greyButton}>
                Edit profile
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  className={
                    user.isFollowing ? styles.greyButton : styles.followButton
                  }
                  onClick={handleFollow}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
                <Link to="/messages" className={styles.greyButton}>
                  Message
                </Link>
              </>
            )}
          </div>

          <ul className={styles.stats}>
            <li>
              <strong>{user.postsCount}</strong> posts
            </li>
            <li>
              <strong>{user.followersCount.toLocaleString()}</strong> followers
            </li>
            <li>
              <strong>{user.followingCount}</strong> following
            </li>
          </ul>

          {user.bio && <p className={styles.bio}>{user.bio}</p>}
          {user.website && (
            <a
              className={styles.website}
              href={user.website}
              target="_blank"
              rel="noreferrer"
            >
              {user.website}
            </a>
          )}
        </div>
      </header>

      {status === 'succeeded' && posts.length === 0 ? (
        <p className={styles.empty}>No posts yet</p>
      ) : (
        <div className={styles.grid}>
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              state={{ background: location }}
              className={styles.cell}
            >
              <img
                className={styles.cellImage}
                src={post.image}
                alt={post.description}
              />
            </Link>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Profile;
