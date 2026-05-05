import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { useListarEtiquetas } from '../../ganchos/useEtiquetas';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { FormularioEtiqueta } from '../../componentes/listado/FormularioEtiqueta';
import type { EtiquetaContenido } from '../../contratos/etiqueta';

const columnas: ColumnaTabla<EtiquetaContenido>[] = [
  { clave: 'nombre', etiqueta: 'Nombre', obtener: (e) => <span className="font-medium text-tinta">{e.nombre}</span> },
  { clave: 'slug', etiqueta: 'Slug', obtener: (e) => <span className="font-codigo text-xs text-grafito">{e.slug}</span> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (e) => <Etiqueta tono={e.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{e.estado}</Etiqueta> },
];

export const PaginaEtiquetas = () => {
  const { sitioActivo } = useSitioActivo();
  const [mostrar, asignarMostrar] = useState(false);
  const consulta = useListarEtiquetas(sitioActivo?.id ?? null);

  if (!sitioActivo) {
    return <EstadoVacio titulo="Selecciona un sitio" descripcion="Las etiquetas son por sitio." />;
  }

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Estructura"
        titulo="Etiquetas"
        descripcion="Tags más finos que las categorías. Un post puede tener varias."
        acciones={<Boton onClick={() => asignarMostrar((v) => !v)}>{mostrar ? 'Cerrar' : 'Nueva etiqueta'}</Boton>}
      />
      {mostrar && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioEtiqueta sitioId={sitioActivo.id} alCrear={() => asignarMostrar(false)} />
        </div>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando etiquetas" />}
      {consulta.data && consulta.data.elementos.length === 0 && !mostrar && (
        <EstadoVacio
          titulo="Aún no hay etiquetas"
          descripcion="No son obligatorias, pero ayudan a la búsqueda."
          accion={<Boton onClick={() => asignarMostrar(true)}>Crear etiqueta</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <Tabla columnas={columnas} filas={consulta.data.elementos} obtenerLlave={(e) => e.id} />
      )}
    </div>
  );
};
