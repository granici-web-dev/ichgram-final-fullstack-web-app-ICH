import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Пускаем только авторизованных, иначе — на страницу входа
function ProtectedRoute() {
  const { token } = useSelector((state) => state.auth);

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
