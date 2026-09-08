import { useState } from 'react';
import SideMenu from './src/components/side_menu';
import CadastroUser from './src/pages/cadastro_user';
import Controller from './src/pages/controller';
import Registro from './src/pages/registro';

export default function App() {
  const [page, setPage] = useState('controle');
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = (nextPage) => { setPage(nextPage); setMenuVisible(false); };
  const openMenu = () => setMenuVisible(true);

  return (
    <>
      {page === 'cadastro'
        ? <CadastroUser onBack={() => navigate('controle')} onMenu={openMenu} />
        : page === 'registro'
          ? <Registro onMenu={openMenu} />
          : <Controller onMenu={openMenu} />}
      <SideMenu activePage={page} visible={menuVisible} onClose={() => setMenuVisible(false)} onSelect={navigate} />
    </>
  );
}
