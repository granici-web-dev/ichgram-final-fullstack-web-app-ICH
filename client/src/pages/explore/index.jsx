import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExplore } from '../../redux/slices/exploreSlice';
import Footer from '../../components/Footer';
import styles from './styles.module.css';

function Explore() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { items } = useSelector((state) => state.explore);

  useEffect(() => {
    dispatch(fetchExplore());
  }, [dispatch]);

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        {items.map((post, index) => {
          // Каждая 3-я и 6-я ячейка в блоке из 10 — высокая (как в Explore Instagram)
          const isTall = index % 10 === 2 || index % 10 === 5;
          return (
            <Link
              key={post._id}
              to={`/post/${post._id}`}
              state={{ background: location }}
              className={isTall ? `${styles.cell} ${styles.tall}` : styles.cell}
            >
              <img
                className={styles.image}
                src={post.image}
                alt={post.description}
              />
            </Link>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}

export default Explore;
