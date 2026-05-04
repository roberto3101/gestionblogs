import { useNavigate } from 'react-router-dom';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { Migajas } from '@compartido/interfaz/primitivas/Migajas';
import { FormularioSitio } from '../../componentes/listado/FormularioSitio';

export const PaginaCrearSitio = () => {
  const navegar = useNavigate();
  return (
    <div className="max-w-2xl">
      <header className="space-y-2 pb-6 mb-6 filete-bajo">
        <Migajas items={[{ etiqueta: 'Estructura', ruta: '/panel/sitios' }, { etiqueta: 'Sitios', ruta: '/panel/sitios' }, { etiqueta: 'Nuevo sitio' }]} />
        <TituloEditorial nivel={2}>Nuevo sitio</TituloEditorial>
        <p className="text-grafito max-w-lectura">Define dónde van a vivir tus posts.</p>
      </header>
      <div className="lamina p-6">
        <FormularioSitio alCrear={() => navegar('/panel/sitios')} />
      </div>
    </div>
  );
};
