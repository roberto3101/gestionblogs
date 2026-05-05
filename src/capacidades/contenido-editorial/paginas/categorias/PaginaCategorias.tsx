import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { useListarCategorias } from '../../ganchos/useCategorias';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { FormularioCategoria } from '../../componentes/listado/FormularioCategoria';
import type { Categoria } from '../../contratos/categoria';

export const PaginaCategorias = () => {
  const { sitioActivo } = useSitioActivo();
  const [mostrar, asignarMostrar] = useState(false);
  const consulta = useListarCategorias(sitioActivo?.id ?? null);

  const columnas: ColumnaTabla<Categoria>[] = [
    { clave: 'color', etiqueta: '', obtener: (c) => <span className="inline-block h-3 w-3 rounded-full" style={{ background: c.color || '#777' }} />, anchoMinimo: '40px' },
    { clave: 'nombre', etiqueta: 'Nombre', obtener: (c) => <span className="font-medium text-tinta">{c.nombre}</span> },
    { clave: 'slug', etiqueta: 'Slug', obtener: (c) => <span className="font-codigo text-xs text-grafito">{c.slug}</span> },
    { clave: 'estado', etiqueta: 'Estado', obtener: (c) => <Etiqueta tono={c.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{c.estado}</Etiqueta> },
  ];

  if (!sitioActivo) {
    return <EstadoVacio titulo="Selecciona un sitio" descripcion="Las categorías son por sitio." />;
  }

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Estructura"
        titulo="Categorías"
        descripcion="Agrupa tus posts por temas grandes. Cada sitio tiene sus propias categorías."
        acciones={<Boton onClick={() => asignarMostrar((v) => !v)}>{mostrar ? 'Cerrar' : 'Nueva categoría'}</Boton>}
      />
      {mostrar && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioCategoria sitioId={sitioActivo.id} alCrear={() => asignarMostrar(false)} />
        </div>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando categorías" />}
      {consulta.data && consulta.data.elementos.length === 0 && !mostrar && (
        <EstadoVacio
          titulo="Crea tu primera categoría"
          descripcion="Las categorías ayudan a organizar tu contenido."
          accion={<Boton onClick={() => asignarMostrar(true)}>Crear categoría</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <Tabla columnas={columnas} filas={consulta.data.elementos} obtenerLlave={(c) => c.id} />
      )}
    </div>
  );
};
