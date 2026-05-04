import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRecursoListado } from '@compartido/biblioteca/useRecursoListado';
import { listarRoles, registrarRol } from '../servicios/servicioRoles';
import { listarPermisos, registrarPermiso } from '../servicios/servicioPermisos';
import { asignarAlcance, asignarRolPermiso } from '../servicios/servicioAlcances';
import type { Paginacion } from '@compartido/tipos/paginacion';

const CLAVE_ROLES = ['roles'] as const;
const CLAVE_PERMISOS = ['permisos'] as const;

export const useListarRoles = (paginacion?: Paginacion) =>
  useRecursoListado({ clave: CLAVE_ROLES, consultar: listarRoles, paginacion });

export const useListarPermisos = (paginacion?: Paginacion) =>
  useRecursoListado({ clave: CLAVE_PERMISOS, consultar: listarPermisos, paginacion });

export const useRegistrarRol = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: registrarRol,
    meta: { exito: 'Rol registrado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_ROLES }),
  });
};

export const useRegistrarPermiso = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: registrarPermiso,
    meta: { exito: 'Permiso registrado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_PERMISOS }),
  });
};

export const useAsignarAlcance = () =>
  useMutation({ mutationFn: asignarAlcance, meta: { exito: 'Alcance asignado' } });

export const useAsignarRolPermiso = () =>
  useMutation({ mutationFn: asignarRolPermiso, meta: { exito: 'Permiso asignado al rol' } });
