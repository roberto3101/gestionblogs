import { useMemo, useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import { Tabla, type ColumnaTabla } from '@compartido/interfaz/visualizacion-datos/Tabla';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { SelectorEmpresa } from '@capacidades/contenido-editorial/componentes/selectores/SelectorEmpresa';
import {
  useAsignarAlcance,
  useCrearUsuarioAdmin,
  useListarAlcances,
  useListarRoles,
  useListarUsuariosAdmin,
  useRevocarAlcance,
} from '../ganchos/useGobierno';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { Identificador } from '@compartido/tipos/identificador';
import type { UsuarioAdmin } from '../servicios/servicioAlcances';

interface UsuarioConAccesos extends UsuarioAdmin {
  asignaciones: Array<{ alcanceId: Identificador; empresa: string; rol: string }>;
}

const generarPasswordSegura = (): string => {
  // 16 caracteres con números, mayúsculas, minúsculas y símbolos seguros
  const conjunto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&';
  const longitud = 16;
  let resultado = '';
  const buffer = new Uint32Array(longitud);
  crypto.getRandomValues(buffer);
  for (let i = 0; i < longitud; i += 1) {
    resultado += conjunto[buffer[i] % conjunto.length];
  }
  return resultado;
};

const correoEsValido = (correo: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

export const PaginaUsuarios = () => {
  const usuarios = useListarUsuariosAdmin();
  const alcances = useListarAlcances();
  const roles = useListarRoles();
  const creacionUsuario = useCrearUsuarioAdmin();
  const asignacion = useAsignarAlcance();
  const revocacion = useRevocarAlcance();

  // Form crear usuario
  const [mostrarCrear, asignarMostrarCrear] = useState(false);
  const [correo, asignarCorreo] = useState('');
  const [password, asignarPassword] = useState('');
  const [verPassword, asignarVerPassword] = useState(false);
  const [empresaInicial, asignarEmpresaInicial] = useState<Identificador | ''>('');
  const [rolInicial, asignarRolInicial] = useState<Identificador | ''>('');
  const [errorValidacion, asignarErrorValidacion] = useState<string | null>(null);
  const [credencialesUltimas, asignarCredencialesUltimas] = useState<{ correo: string; password: string } | null>(null);

  // Lateral: usuario en detalle (para asignar más accesos)
  const [usuarioDetalle, asignarUsuarioDetalle] = useState<UsuarioConAccesos | null>(null);
  const [empresaNueva, asignarEmpresaNueva] = useState<Identificador | ''>('');
  const [rolNuevo, asignarRolNuevo] = useState<Identificador | ''>('');

  const opcionesRoles = useMemo(
    () => (roles.data?.elementos ?? []).map((r) => ({ valor: r.id, etiqueta: r.nombre })),
    [roles.data],
  );

  const usuariosConAccesos = useMemo<UsuarioConAccesos[]>(() => {
    if (!usuarios.data || !alcances.data) return [];
    return usuarios.data.elementos.map((u) => ({
      ...u,
      asignaciones: alcances.data
        .filter((a) => a.usuario_id === u.id)
        .map((a) => ({ alcanceId: a.id, empresa: a.empresa_nombre, rol: a.rol_nombre })),
    }));
  }, [usuarios.data, alcances.data]);

  const detalleActualizado = useMemo<UsuarioConAccesos | null>(
    () => (usuarioDetalle ? usuariosConAccesos.find((u) => u.id === usuarioDetalle.id) ?? null : null),
    [usuariosConAccesos, usuarioDetalle],
  );

  const limpiarForm = () => {
    asignarCorreo('');
    asignarPassword('');
    asignarVerPassword(false);
    asignarEmpresaInicial('');
    asignarRolInicial('');
    asignarErrorValidacion(null);
  };

  const enviarCrear = (evento: FormEvent) => {
    evento.preventDefault();
    asignarErrorValidacion(null);
    const correoLimpio = correo.trim();
    if (!correoEsValido(correoLimpio)) {
      asignarErrorValidacion('Ingresa un correo electrónico válido.');
      return;
    }
    if (password.trim().length < 8) {
      asignarErrorValidacion('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    const ambasOninguna = (empresaInicial && rolInicial) || (!empresaInicial && !rolInicial);
    if (!ambasOninguna) {
      asignarErrorValidacion('Si asignas acceso inicial, elige empresa y rol juntos.');
      return;
    }
    const solicitud = {
      correo_electronico: correoLimpio,
      password: password.trim(),
      ...(empresaInicial && rolInicial
        ? { empresa_id: empresaInicial as Identificador, rol_id: rolInicial as Identificador }
        : {}),
    };
    creacionUsuario.mutate(solicitud, {
      onSuccess: () => {
        asignarCredencialesUltimas({ correo: correoLimpio, password: password.trim() });
        limpiarForm();
        asignarMostrarCrear(false);
      },
    });
  };

  const enviarAsignacion = (evento: FormEvent) => {
    evento.preventDefault();
    if (!detalleActualizado || !empresaNueva || !rolNuevo) return;
    asignacion.mutate(
      {
        usuario_id: detalleActualizado.id,
        empresa_id: empresaNueva,
        rol_id: rolNuevo as Identificador,
      },
      {
        onSuccess: () => {
          asignarEmpresaNueva('');
          asignarRolNuevo('');
        },
      },
    );
  };

  const columnas: ColumnaTabla<UsuarioConAccesos>[] = [
    {
      clave: 'correo',
      etiqueta: 'Correo',
      obtener: (u) => (
        <div className="space-y-0.5">
          <span className="font-medium text-tinta">{u.correo_electronico}</span>
          {!u.correo_electronico_verificado && (
            <span className="block text-xs text-ambar">Sin verificar</span>
          )}
        </div>
      ),
    },
    {
      clave: 'estado',
      etiqueta: 'Estado',
      obtener: (u) => (
        <Etiqueta tono={u.estado === 'ACTIVO' ? 'oliva' : 'neutro'}>{u.estado}</Etiqueta>
      ),
    },
    {
      clave: 'asignaciones',
      etiqueta: 'Empresas con acceso',
      obtener: (u) =>
        u.asignaciones.length === 0 ? (
          <span className="text-sm text-grafito italic">Sin accesos</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {u.asignaciones.map((a) => (
              <span
                key={a.alcanceId}
                className="inline-flex items-center gap-1 rounded-suave border border-ceniza bg-papel px-2 py-1 text-xs text-tinta"
              >
                <span className="text-grafito">{a.empresa}:</span>
                <span className="font-medium">{a.rol}</span>
              </span>
            ))}
          </div>
        ),
    },
    {
      clave: 'acciones',
      etiqueta: '',
      obtener: (u) => (
        <div className="flex justify-end">
          <Boton tono="discreto" tamano="compacto" onClick={() => asignarUsuarioDetalle(u)}>
            Gestionar accesos
          </Boton>
        </div>
      ),
      anchoMinimo: '170px',
    },
  ];

  const mensajeErrorCrear = creacionUsuario.error instanceof ErrorHttp ? creacionUsuario.error.message : null;
  const mensajeErrorAsignar = asignacion.error instanceof ErrorHttp ? asignacion.error.message : null;
  const cargandoBase = usuarios.isLoading || alcances.isLoading;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Gobierno de acceso"
        titulo="Usuarios"
        descripcion="Crea usuarios, asígnales rol y empresa con acceso, y gestiona quién puede entrar."
        acciones={
          <Boton
            onClick={() => {
              asignarMostrarCrear((v) => !v);
              asignarCredencialesUltimas(null);
            }}
          >
            {mostrarCrear ? 'Cerrar' : 'Crear usuario'}
          </Boton>
        }
      />

      {credencialesUltimas && (
        <Lamina className="p-5 mb-6 max-w-3xl border-oliva/40">
          <p className="meta-tipografia mb-2">Credenciales del nuevo usuario · cópialas y compártelas (no se vuelven a mostrar)</p>
          <div className="font-codigo text-sm text-tinta space-y-1">
            <div>correo: {credencialesUltimas.correo}</div>
            <div>password: {credencialesUltimas.password}</div>
          </div>
          <Boton
            tono="discreto"
            tamano="compacto"
            onClick={() => asignarCredencialesUltimas(null)}
            className="mt-3"
          >
            Listo, las copié
          </Boton>
        </Lamina>
      )}

      {mostrarCrear && (
        <Lamina className="p-6 mb-6 max-w-2xl">
          <form onSubmit={enviarCrear} className="space-y-5">
            <CampoTexto
              etiqueta="Correo electrónico"
              type="email"
              value={correo}
              onChange={(e) => asignarCorreo(e.target.value)}
              required
              placeholder="redactor@empresa.com"
            />
            <div className="space-y-1.5">
              <span className="meta-tipografia">Contraseña</span>
              <div className="flex items-center gap-2">
                <input
                  type={verPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => asignarPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="mínimo 8 caracteres"
                  className="flex-1 bg-papel border border-ceniza rounded-suave outline-none text-sm text-tinta h-10 px-3 focus:border-tinta"
                />
                <Boton
                  type="button"
                  tono="discreto"
                  tamano="compacto"
                  onClick={() => asignarVerPassword((v) => !v)}
                >
                  {verPassword ? 'Ocultar' : 'Ver'}
                </Boton>
                <Boton
                  type="button"
                  tono="discreto"
                  tamano="compacto"
                  onClick={() => {
                    asignarPassword(generarPasswordSegura());
                    asignarVerPassword(true);
                  }}
                >
                  Generar
                </Boton>
              </div>
              <p className="text-xs text-grafito">
                El usuario podrá cambiarla después. Generar te crea una segura aleatoria.
              </p>
            </div>

            <div className="border-t border-ceniza pt-5">
              <p className="meta-tipografia mb-3">Acceso inicial (opcional)</p>
              <div className="space-y-4">
                <SelectorEmpresa
                  valor={empresaInicial}
                  alCambiar={(id) => asignarEmpresaInicial(id ?? '')}
                />
                <Selector
                  etiqueta="Rol"
                  opciones={opcionesRoles}
                  marcadorPosicion="Sin acceso inicial"
                  value={rolInicial}
                  onChange={(e) => asignarRolInicial(e.target.value as Identificador | '')}
                />
                <p className="text-xs text-grafito">
                  Si dejas estos campos vacíos, el usuario quedará creado sin acceso a ninguna empresa
                  y podrás asignárselo después con "Gestionar accesos".
                </p>
              </div>
            </div>

            {(errorValidacion || mensajeErrorCrear) && (
              <AvisoError titulo={errorValidacion ? 'Falta algo' : 'No pudimos crear el usuario'}>
                {errorValidacion ?? mensajeErrorCrear ?? ''}
              </AvisoError>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Boton type="button" tono="discreto" onClick={() => { asignarMostrarCrear(false); limpiarForm(); }}>
                Cancelar
              </Boton>
              <Boton type="submit" cargando={creacionUsuario.isPending}>
                Crear usuario
              </Boton>
            </div>
          </form>
        </Lamina>
      )}

      {cargandoBase && <Cargando etiqueta="Cargando usuarios" />}
      {!cargandoBase && usuariosConAccesos.length === 0 && !mostrarCrear && (
        <EstadoVacio
          titulo="Aún no hay usuarios"
          descripcion="Crea el primero para empezar a asignar accesos."
          accion={<Boton onClick={() => asignarMostrarCrear(true)}>Crear usuario</Boton>}
        />
      )}
      {!cargandoBase && usuariosConAccesos.length > 0 && (
        <Tabla columnas={columnas} filas={usuariosConAccesos} obtenerLlave={(u) => u.id} />
      )}

      {detalleActualizado && (
        <Lamina className="p-6 mt-8 max-w-3xl">
          <div className="flex items-start justify-between mb-5 gap-4">
            <div>
              <p className="meta-tipografia">Gestionar accesos · {detalleActualizado.correo_electronico}</p>
              <p className="text-xs text-grafito mt-1">
                Cada acceso es la combinación de una empresa y un rol. Puedes tener varios.
              </p>
            </div>
            <Boton tono="discreto" tamano="compacto" onClick={() => asignarUsuarioDetalle(null)}>
              Cerrar
            </Boton>
          </div>

          <div className="space-y-3 mb-6">
            {detalleActualizado.asignaciones.length === 0 ? (
              <p className="text-sm text-grafito italic">Este usuario aún no tiene accesos asignados.</p>
            ) : (
              <ul className="space-y-2">
                {detalleActualizado.asignaciones.map((a) => (
                  <li
                    key={a.alcanceId}
                    className="flex items-center justify-between border border-ceniza rounded-suave px-4 py-3"
                  >
                    <span className="text-sm text-tinta">
                      <span className="text-grafito">{a.empresa}</span>
                      {' · '}
                      <span className="font-medium">{a.rol}</span>
                    </span>
                    <Boton
                      tono="peligro"
                      tamano="compacto"
                      cargando={revocacion.isPending && revocacion.variables === a.alcanceId}
                      onClick={() => {
                        if (window.confirm(`¿Revocar el acceso a ${a.empresa} (${a.rol})?`)) {
                          revocacion.mutate(a.alcanceId);
                        }
                      }}
                    >
                      Revocar
                    </Boton>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={enviarAsignacion} className="space-y-4 border-t border-ceniza pt-5">
            <p className="meta-tipografia">Agregar nuevo acceso</p>
            <SelectorEmpresa valor={empresaNueva} alCambiar={(id) => asignarEmpresaNueva(id ?? '')} />
            <Selector
              etiqueta="Rol"
              opciones={opcionesRoles}
              marcadorPosicion="Selecciona un rol"
              value={rolNuevo}
              onChange={(e) => asignarRolNuevo(e.target.value as Identificador | '')}
            />
            {mensajeErrorAsignar && <AvisoError>{mensajeErrorAsignar}</AvisoError>}
            <div className="flex justify-end">
              <Boton
                type="submit"
                cargando={asignacion.isPending}
                disabled={!empresaNueva || !rolNuevo}
              >
                Asignar acceso
              </Boton>
            </div>
          </form>
        </Lamina>
      )}
    </div>
  );
};
