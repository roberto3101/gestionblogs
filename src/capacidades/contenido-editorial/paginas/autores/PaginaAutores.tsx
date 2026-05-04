import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { useListarAutores } from '../../ganchos/useAutores';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { FormularioAutor } from '../../componentes/listado/FormularioAutor';
import type { Autor } from '../../contratos/autor';

const columnas: ColumnaTabla<Autor>[] = [
  { clave: 'nombre', etiqueta: 'Nombre público', obtener: (a) => <span className="font-medium text-tinta">{a.nombre_publico}</span> },
  { clave: 'slug', etiqueta: 'Slug', obtener: (a) => <span className="font-codigo text-xs text-grafito">{a.slug}</span> },
  { clave: 'estado', etiqueta: 'Estado', obtener: (a) => <Etiqueta tono={a.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{a.estado}</Etiqueta> },
];

export const PaginaAutores = () => {
  const { sitioActivo } = useSitioActivo();
  const [mostrandoFormulario, asignarMostrandoFormulario] = useState(false);
  const consulta = useListarAutores(sitioActivo?.codigo ?? null);

  if (!sitioActivo) {
    return (
      <EstadoVacio
        titulo="Selecciona un sitio"
        descripcion="Los autores se asocian a un sitio. Crea un sitio primero."
      />
    );
  }

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Redacción"
        titulo="Autores"
        descripcion="Las personas o equipos que firman tus posts."
        acciones={
          <Boton onClick={() => asignarMostrandoFormulario((v) => !v)}>
            {mostrandoFormulario ? 'Cerrar formulario' : 'Nuevo autor'}
          </Boton>
        }
      />
      {mostrandoFormulario && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioAutor alCrear={() => asignarMostrandoFormulario(false)} />
        </div>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando autores" />}
      {consulta.data && consulta.data.elementos.length === 0 && !mostrandoFormulario && (
        <EstadoVacio
          titulo="Crea tu primer autor"
          descripcion="Sin un autor no puedes publicar posts."
          accion={<Boton onClick={() => asignarMostrandoFormulario(true)}>Crear autor</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <Tabla columnas={columnas} filas={consulta.data.elementos} obtenerLlave={(a) => a.id} />
      )}
    </div>
  );
};
