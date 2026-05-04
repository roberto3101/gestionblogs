import { NavLink } from 'react-router-dom';
import { itemsNavegacion, titulosAgrupacion, type ItemNavegacion } from './itemsNavegacion';
import { unirClases } from '@compartido/utilidades/unirClases';

const agruparItems = (): Record<ItemNavegacion['agrupacion'], ItemNavegacion[]> => {
  const inicial: Record<ItemNavegacion['agrupacion'], ItemNavegacion[]> = {
    general: [], redaccion: [], estructura: [], gobierno: [],
  };
  for (const item of itemsNavegacion) inicial[item.agrupacion].push(item);
  return inicial;
};

const grupos = agruparItems();

export const BarraLateral = () => (
  <aside className="border-r filete-tenue bg-papel flex flex-col py-6 px-4 h-screen overflow-y-auto w-full">
    <div className="px-3 pb-6 flex items-center gap-2.5">
      <span className="h-7 w-7 rounded-suave bg-tinta text-lienzo grid place-items-center titulo-editorial text-sm">
        C
      </span>
      <div>
        <p className="text-sm font-semibold text-tinta leading-tight">Codeplex</p>
        <p className="meta-tipografia">Panel editorial</p>
      </div>
    </div>
    <nav className="flex-1 space-y-6">
      {(Object.keys(grupos) as ItemNavegacion['agrupacion'][]).map((clave) => (
        grupos[clave].length > 0 && (
          <div key={clave} className="space-y-1">
            <p className="meta-tipografia px-3 mb-2">{titulosAgrupacion[clave]}</p>
            {grupos[clave].map((item) => (
              <NavLink
                key={item.ruta}
                to={item.ruta}
                end={item.ruta === '/panel'}
                className={({ isActive }) =>
                  unirClases(
                    'flex items-center px-3 h-9 rounded-suave text-sm transicion-natural',
                    isActive
                      ? 'bg-oliva-suave text-tinta font-medium'
                      : 'text-grafito hover:bg-ceniza/50 hover:text-tinta',
                  )
                }
              >
                {item.etiqueta}
              </NavLink>
            ))}
          </div>
        )
      ))}
    </nav>
  </aside>
);
