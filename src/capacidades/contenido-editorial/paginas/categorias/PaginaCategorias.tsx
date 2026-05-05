import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { useListarCategorias } from '../../ganchos/useCategorias';
import { useEditarCategoria, useEliminarCategoria } from '../../ganchos/useEdicion';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { FormularioCategoria } from '../../componentes/listado/FormularioCategoria';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Categoria } from '../../contratos/categoria';

export const PaginaCategorias = () => {
  const { sitioActivo } = useSitioActivo();
  const [mostrarCrear, asignarMostrarCrear] = useState(false);
  const [enEdicion, asignarEnEdicion] = useState<Categoria | null>(null);
  const consulta = useListarCategorias(sitioActivo?.id ?? null);
  const eliminacion = useEliminarCategoria();

  const columnas: ColumnaTabla<Categoria>[] = [
    { clave: 'color', etiqueta: '', obtener: (c) => <span className="inline-block h-3 w-3 rounded-full" style={{ background: c.color || '#777' }} />, anchoMinimo: '40px' },
    { clave: 'nombre', etiqueta: 'Nombre', obtener: (c) => <span className="font-medium text-tinta">{c.nombre}</span> },
    { clave: 'slug', etiqueta: 'Slug', obtener: (c) => <span className="font-codigo text-xs text-grafito">{c.slug}</span> },
    { clave: 'estado', etiqueta: 'Estado', obtener: (c) => <Etiqueta tono={c.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{c.estado}</Etiqueta> },
    {
      clave: 'acciones',
      etiqueta: '',
      obtener: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Boton tono="discreto" tamano="compacto" onClick={() => asignarEnEdicion(c)}>
            Editar
          </Boton>
          <Boton
            tono="peligro"
            tamano="compacto"
            cargando={eliminacion.isPending && eliminacion.variables === c.id}
            onClick={() => {
              const confirmacion = window.confirm(
                `¿Eliminar la categoría "${c.nombre}"? Los posts que la tengan asignada perderán esa categoría (los posts NO se eliminan).`,
              );
              if (confirmacion) eliminacion.mutate(c.id);
            }}
          >
            Eliminar
          </Boton>
        </div>
      ),
      anchoMinimo: '180px',
    },
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
        acciones={
          <Boton onClick={() => asignarMostrarCrear((v) => !v)}>
            {mostrarCrear ? 'Cerrar' : 'Nueva categoría'}
          </Boton>
        }
      />
      {mostrarCrear && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioCategoria sitioId={sitioActivo.id} alCrear={() => asignarMostrarCrear(false)} />
        </div>
      )}
      {enEdicion && (
        <div className="lamina p-6 mb-6 max-w-2xl">
          <FormularioEditarCategoria
            categoria={enEdicion}
            alGuardar={() => asignarEnEdicion(null)}
            alCancelar={() => asignarEnEdicion(null)}
          />
        </div>
      )}
      {consulta.isLoading && <Cargando etiqueta="Cargando categorías" />}
      {consulta.data && consulta.data.elementos.length === 0 && !mostrarCrear && (
        <EstadoVacio
          titulo="Crea tu primera categoría"
          descripcion="Las categorías ayudan a organizar tu contenido."
          accion={<Boton onClick={() => asignarMostrarCrear(true)}>Crear categoría</Boton>}
        />
      )}
      {consulta.data && consulta.data.elementos.length > 0 && (
        <Tabla columnas={columnas} filas={consulta.data.elementos} obtenerLlave={(c) => c.id} />
      )}
    </div>
  );
};

interface PropiedadesEditar {
  categoria: Categoria;
  alGuardar: () => void;
  alCancelar: () => void;
}

const FormularioEditarCategoria = ({ categoria, alGuardar, alCancelar }: PropiedadesEditar) => {
  const [nombre, asignarNombre] = useState(categoria.nombre);
  const [descripcion, asignarDescripcion] = useState(categoria.descripcion ?? '');
  const [color, asignarColor] = useState(categoria.color ?? '#3f5c34');
  const [estado, asignarEstado] = useState(categoria.estado);
  const edicion = useEditarCategoria(categoria.id);

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    edicion.mutate(
      { nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, color, estado },
      { onSuccess: alGuardar },
    );
  };

  const mensajeError = edicion.error instanceof ErrorHttp ? edicion.error.message : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <p className="meta-tipografia">Editar categoría · {categoria.slug}</p>
      <CampoTexto etiqueta="Nombre" value={nombre} onChange={(e) => asignarNombre(e.target.value)} required />
      <AreaTexto
        etiqueta="Descripción"
        value={descripcion}
        onChange={(e) => asignarDescripcion(e.target.value)}
      />
      <label className="flex items-center gap-3">
        <span className="meta-tipografia">Color</span>
        <input
          type="color"
          value={color}
          onChange={(e) => asignarColor(e.target.value)}
          className="h-10 w-16 rounded-suave border border-ceniza cursor-pointer"
        />
        <span className="font-codigo text-xs text-humo">{color}</span>
      </label>
      <div className="space-y-1.5">
        <span className="meta-tipografia">Estado</span>
        <select
          value={estado}
          onChange={(e) => asignarEstado(e.target.value)}
          className="w-full bg-papel border border-ceniza rounded-suave outline-none text-sm text-tinta h-10 px-3 focus:border-tinta"
        >
          <option value="ACTIVO">ACTIVO — visible en blogs públicos</option>
          <option value="INACTIVO">INACTIVO — oculta categoría sin borrarla</option>
        </select>
      </div>
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <div className="flex justify-end gap-3 pt-2">
        <Boton type="button" tono="discreto" onClick={alCancelar}>
          Cancelar
        </Boton>
        <Boton type="submit" cargando={edicion.isPending}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  );
};
