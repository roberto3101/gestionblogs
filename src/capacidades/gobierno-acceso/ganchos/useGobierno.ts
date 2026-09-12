import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRecursoListado } from '@compartido/biblioteca/useRecursoListado';
import { listarRoles, registrarRol } from '../servicios/servicioRoles';
import { listarPermisos, registrarPermiso } from '../servicios/servicioPermisos';
import {
  asignarAlcance,
  asignarRolPermiso,
  cambiarEstadoUsuarioAdmin,
  crearUsuarioAdmin,
  editarUsuarioAdmin,
  eliminarUsuarioAdmin,
  listarAlcances,
  listarUsuariosAdmin,
  revocarAlcance,
} from '../servicios/servicioAlcances';
import type { Identificador } from '@compartido/tipos/identificador';
import type { Paginacion } from '@compartido/tipos/paginacion';
import { paginacionInicial } from '@compartido/tipos/paginacion';

const CLAVE_ROLES = ['roles'] as const;
const CLAVE_PERMISOS = ['permisos'] as const;
const CLAVE_ALCANCES = ['alcances'] as const;
const CLAVE_USUARIOS = ['usuarios'] as const;

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

export const useAsignarAlcance = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: asignarAlcance,
    meta: { exito: 'Alcance asignado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_ALCANCES }),
  });
};

export const useAsignarRolPermiso = () =>
  useMutation({ mutationFn: asignarRolPermiso, meta: { exito: 'Permiso asignado al rol' } });

export const useListarAlcances = () =>
  useQuery({ queryKey: CLAVE_ALCANCES, queryFn: listarAlcances });

export const useRevocarAlcance = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: revocarAlcance,
    meta: { exito: 'Acceso revocado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_ALCANCES }),
  });
};

export const useListarUsuariosAdmin = (paginacion: Paginacion = paginacionInicial, filtroEstado?: string) =>
  useQuery({
    queryKey: [...CLAVE_USUARIOS, paginacion, filtroEstado ?? ''],
    queryFn: () => listarUsuariosAdmin(paginacion, filtroEstado),
  });

export const useCrearUsuarioAdmin = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: crearUsuarioAdmin,
    meta: { exito: 'Usuario creado' },
    onSuccess: () => {
      cliente.invalidateQueries({ queryKey: CLAVE_USUARIOS });
      cliente.invalidateQueries({ queryKey: CLAVE_ALCANCES });
    },
  });
};

export const useEditarUsuarioAdmin = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, correo }: { id: Identificador; correo: string }) =>
      editarUsuarioAdmin(id, correo),
    meta: { exito: 'Correo actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_USUARIOS }),
  });
};

export const useCambiarEstadoUsuarioAdmin = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: Identificador; estado: 'ACTIVO' | 'INACTIVO' }) =>
      cambiarEstadoUsuarioAdmin(id, estado),
    meta: { exito: 'Estado actualizado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_USUARIOS }),
  });
};

export const useEliminarUsuarioAdmin = () => {
  const cliente = useQueryClient();
  return useMutation({
    mutationFn: (id: Identificador) => eliminarUsuarioAdmin(id),
    meta: { exito: 'Usuario eliminado' },
    onSuccess: () => cliente.invalidateQueries({ queryKey: CLAVE_USUARIOS }),
  });
};
