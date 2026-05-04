import { useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { useAsignarAlcance, useListarRoles } from '../ganchos/useGobierno';
import { SelectorEmpresa } from '@capacidades/contenido-editorial/componentes/selectores/SelectorEmpresa';
import type { Identificador } from '@compartido/tipos/identificador';
import { ErrorHttp } from '@integraciones/http/errorHttp';

export const PaginaAlcances = () => {
  const [usuarioId, asignarUsuarioId] = useState('');
  const [empresaId, asignarEmpresaId] = useState<Identificador | ''>('');
  const [rolId, asignarRolId] = useState('');
  const asignacion = useAsignarAlcance();
  const consultaRoles = useListarRoles();

  const opcionesRoles =
    consultaRoles.data?.elementos.map((rol) => ({ valor: rol.id, etiqueta: rol.nombre })) ?? [];

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!empresaId) return;
    asignacion.mutate(
      { usuario_id: usuarioId.trim(), empresa_id: empresaId, rol_id: rolId },
      {
        onSuccess: () => {
          asignarUsuarioId('');
          asignarRolId('');
        },
      },
    );
  };

  const mensajeError = asignacion.error instanceof ErrorHttp ? asignacion.error.message : null;

  return (
    <div className="max-w-2xl">
      <EncabezadoSeccion
        preTitulo="Gobierno de acceso"
        titulo="Asignar alcance"
        descripcion="Combina una persona, una empresa y un rol. Esta es la unidad mínima de acceso."
      />
      <Lamina className="p-6">
        <form onSubmit={enviar} className="space-y-5">
          <CampoTexto
            etiqueta="ID del usuario"
            ayuda="UUID del usuario que recibe el alcance."
            value={usuarioId}
            onChange={(e) => asignarUsuarioId(e.target.value)}
            required
          />
          <SelectorEmpresa valor={empresaId} alCambiar={asignarEmpresaId} />
          <Selector
            etiqueta="Rol"
            opciones={opcionesRoles}
            marcadorPosicion="Selecciona un rol"
            value={rolId}
            onChange={(e) => asignarRolId(e.target.value)}
            required
          />
          {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
          {asignacion.isSuccess && (
            <div className="border border-oliva/30 bg-oliva-suave/40 rounded-suave px-4 py-3 text-sm text-tinta">
              Alcance asignado correctamente.
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Boton type="submit" cargando={asignacion.isPending}>Asignar</Boton>
          </div>
        </form>
      </Lamina>
    </div>
  );
};
