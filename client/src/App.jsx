import { Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/login';
import SignUp from './pages/signup';
import Reset from './pages/reset';
import Home from './pages/home';
import Explore from './pages/explore';
import Messages from './pages/messages';
import Profile from './pages/profile';
import EditProfile from './pages/editProfile';
import AddPost from './pages/addPost';
import PostModal from './pages/post';
import NotFound from './pages/notFound';

function App() {
  const location = useLocation();
  // Если открыли пост из ленты/профиля — под модалкой остаётся прежняя страница
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        {/* Публичные маршруты */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reset" element={<Reset />} />

        {/* Защищённые маршруты — внутри общего макета с боковым меню */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<Messages />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/add" element={<AddPost />} />
            {/* Прямой переход по ссылке на пост (без фона) */}
            <Route path="/post/:postId" element={<PostModal />} />
            {/* 404 внутри макета — с боковым меню и футером */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>

      {/* Модалка поста поверх страницы-фона */}
      {background && (
        <Routes>
          <Route path="/post/:postId" element={<PostModal />} />
        </Routes>
      )}
    </>
  );
}

export default App;
