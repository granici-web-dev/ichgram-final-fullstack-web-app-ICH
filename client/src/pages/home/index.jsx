import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPosts } from '../../redux/slices/postsSlice';
import PostCard from '../../components/PostCard';
import Footer from '../../components/Footer';
import feedComplete from '../../assets/feed-complete.png';
import styles from './styles.module.css';

function Home() {
  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.posts);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <div className={styles.feed}>
        {items.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>

      {status === 'succeeded' && (
        <div className={styles.end}>
          <img className={styles.endIcon} src={feedComplete} alt="" />
          <p className={styles.endTitle}>You&apos;ve seen all the updates</p>
          <p className={styles.endText}>You have viewed all new publications</p>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Home;
