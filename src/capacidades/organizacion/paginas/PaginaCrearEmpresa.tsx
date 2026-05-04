import { useNavigate } from 'react-router-dom';
import { TituloEditorial } from '@compartido/interfaz/primitivas/TituloEditorial';
import { Migajas } from '@compartido/interfaz/primitivas/Migajas';
import { FormularioEmpresa } from '../componentes/FormularioEmpresa';

export const PaginaCrearEmpresa = () => {
  const navegar = useNavigate();
  return (
    <div className="max-w-2xl">
      <header className="space-y-2 pb-6 mb-6 filete-bajo">
        <Migajas items={[{ etiqueta: 'Organización', ruta: '/panel/empresas' }, { etiqueta: 'Empresas', ruta: '/panel/empresas' }, { etiqueta: 'Nueva empresa' }]} />
        <TituloEditorial nivel={2}>Nueva empresa</TituloEditorial>
        <p className="text-grafito max-w-lectura">Registra la empresa que va a alojar tus sitios y blogs.</p>
      </header>
      <div className="lamina p-6">
        <FormularioEmpresa alCrear={() => navegar('/panel/empresas')} />
      </div>
    </div>
  );
};
