import { useState } from 'react';
import SideMenu from './src/components/side_menu';
import CadastroUser from './src/pages/cadastro_user';
import Login from './src/pages/login';
import Controller from './src/pages/controller';
import Registro from './src/pages/registro';

export default function App() {
  const [page, setPage] = useState('login');
  const [menuVisible, setMenuVisible] = useState(false);
  const [session, setSession] = useState(null);

  const navigate = (nextPage) => {
    setPage(nextPage);
    setMenuVisible(false);
  };

  const handleLogin = ({ token, user }) => {
    setSession({ token, user });
    navigate(user?.is_professor ? 'registro' : 'controle');
  };

  const logout = () => {
    setSession(null);
    navigate('login');
  };

  const commonProps = {
    token: session?.token,
    user: session?.user,
    onMenu: () => setMenuVisible(true),
  };

  return (
    <>
      {page === 'login' ? (
        <Login onRegister={() => navigate('cadastro')} onSuccess={handleLogin} />
      ) : page === 'cadastro' ? (
        <CadastroUser onBack={() => navigate('login')} />
      ) : page === 'registro' ? (
        <Registro {...commonProps} />
      ) : (
        <Controller {...commonProps} onHistory={() => navigate('registro')} />
      )}

      {session ? (
        <SideMenu activePage={page} visible={menuVisible} user={session.user} onClose={() => setMenuVisible(false)} onSelect={navigate} onLogout={logout} />
      ) : null}
    </>
  );
}
