import { useState } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { Etiqueta } from '@compartido/interfaz/primitivas/Etiqueta';
import { Cargando } from '@compartido/interfaz/retroalimentacion/Cargando';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { PaginadorTabla } from '@compartido/interfaz/visualizacion-datos/PaginadorTabla';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { unirClases } from '@compartido/utilidades/unirClases';
import { paginacionInicial, type Paginacion } from '@compartido/tipos/paginacion';
import {
  useCambiarEstadoMensaje,
  useListarMensajes,
  useProbarCorreo,
} from '../../ganchos/useMensajes';
import type { MensajeContacto } from '../../contratos/mensaje';

/**
 * Bandeja de lo que llega desde el formulario de contacto del sitio.
 *
 * Antes de esto el formulario abría el cliente de correo del visitante, así
 * que una consulta se perdía si la persona no tenía uno configurado. Ahora
 * todo queda registrado aquí, se envíe el aviso por correo o no.
 */

const TONO_ENTREGA: Record<MensajeContacto['estado_entrega'], 'oliva' | 'ambar' | 'cinabrio' | 'neutro'> = {
  ENVIADO: 'oliva',
  PENDIENTE: 'neutro',
  SIN_CORREO: 'ambar',
  FALLIDO: 'cinabrio',
};

const TEXTO_ENTREGA: Record<MensajeContacto['estado_entrega'], string> = {
  ENVIADO: 'Aviso enviado',
  PENDIENTE: 'Enviando',
  SIN_CORREO: 'No salió el correo',
  FALLIDO: 'Aviso no enviado',
};

const FILTROS: Array<{ valor: string; etiqueta: string }> = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'NUEVO', etiqueta: 'Nuevos' },
  { valor: 'LEIDO', etiqueta: 'Leídos' },
  { valor: 'ATENDIDO', etiqueta: 'Atendidos' },
  { valor: 'DESCARTADO', etiqueta: 'Descartados' },
];

const fecha = (iso: string): string =>
  new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export const PaginaMensajes = () => {
  const { sitioActivo } = useSitioActivo();
  const [paginacion, asignarPaginacion] = useState<Paginacion>(paginacionInicial);
  const [filtro, asignarFiltro] = useState('');
  const [abierto, asignarAbierto] = useState<string | null>(null);

  const consulta = useListarMensajes(sitioActivo?.id ?? null, paginacion, filtro);
  const cambioEstado = useCambiarEstadoMensaje();
  const prueba = useProbarCorreo(sitioActivo?.id ?? null);

  if (!sitioActivo) {
    return (
      <EstadoVacio
        titulo="Selecciona un sitio"
        descripcion="Los mensajes llegan al sitio desde el que se enviaron."
      />
    );
  }

  const mensajes = consulta.data?.elementos ?? [];
  const hayFallidos = mensajes.some((m) => m.estado_entrega === 'FALLIDO' || m.estado_entrega === 'SIN_CORREO');

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Contacto"
        titulo="Mensajes recibidos"
        descripcion="Consultas enviadas desde el formulario de la web. Se guardan aquí aunque falle el correo."
        acciones={
          <Boton tono="discreto" cargando={prueba.isPending} onClick={() => prueba.mutate('es')}>
            Probar correo
          </Boton>
        }
      />

      {prueba.isError && <AvisoError>{(prueba.error as Error).message}</AvisoError>}
      {prueba.isSuccess && (
        <p className="mb-4 text-sm text-oliva">
          Correo de prueba enviado a {prueba.data.destinatarios.join(', ')}.
        </p>
      )}

      {hayFallidos && (
        <div className="mb-5 border border-ambar/40 bg-ambar/5 rounded-suave px-4 py-3 text-sm text-grafito">
          De algunos mensajes no salió el aviso por correo. <strong>No se ha perdido nada</strong>:
          están completos en esta lista. Para que los próximos también lleguen al correo, hay que
          configurar el envío en el servidor; pásale esto a quien lo lleve.
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            type="button"
            onClick={() => {
              asignarFiltro(f.valor);
              asignarPaginacion(paginacionInicial);
            }}
            className={unirClases(
              'h-8 px-3 rounded-suave text-sm border transition-colors',
              f.valor === filtro
                ? 'bg-tinta text-lienzo border-tinta'
                : 'bg-papel text-grafito border-ceniza hover:border-humo',
            )}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {consulta.isLoading ? (
        <Cargando />
      ) : mensajes.length === 0 ? (
        <EstadoVacio
          titulo="Sin mensajes"
          descripcion="Cuando alguien escriba desde el formulario de la web, aparecerá aquí."
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {mensajes.map((mensaje) => {
              const desplegado = abierto === mensaje.id;
              return (
                <article
                  key={mensaje.id}
                  className={unirClases(
                    'border rounded-suave bg-papel overflow-hidden',
                    mensaje.estado === 'NUEVO' ? 'border-tinta/30' : 'border-ceniza',
                  )}
                >
                  <header className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => asignarAbierto(desplegado ? null : mensaje.id)}
                      className="flex-1 flex items-center gap-3 text-left min-w-0"
                    >
                      {mensaje.estado === 'NUEVO' && (
                        <span className="h-2 w-2 rounded-full bg-tinta shrink-0" />
                      )}
                      <span className="text-sm font-medium text-tinta shrink-0">{mensaje.nombre}</span>
                      <span className="text-xs text-grafito shrink-0">{mensaje.correo}</span>
                      <span className="text-sm text-humo truncate">{mensaje.cuerpo}</span>
                    </button>
                    <Etiqueta tono={TONO_ENTREGA[mensaje.estado_entrega]}>
                      {TEXTO_ENTREGA[mensaje.estado_entrega]}
                    </Etiqueta>
                    <span className="text-xs text-humo shrink-0">{fecha(mensaje.creado_en)}</span>
                  </header>

                  {desplegado && (
                    <div className="border-t border-ceniza/60 p-5 bg-lienzo">
                      <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4 max-w-2xl">
                        {mensaje.empresa && (
                          <>
                            <dt className="text-humo">Empresa</dt>
                            <dd className="text-tinta">{mensaje.empresa}</dd>
                          </>
                        )}
                        {mensaje.telefono && (
                          <>
                            <dt className="text-humo">Teléfono</dt>
                            <dd className="text-tinta">{mensaje.telefono}</dd>
                          </>
                        )}
                        {mensaje.consulta && (
                          <>
                            <dt className="text-humo">Tipo de consulta</dt>
                            <dd className="text-tinta">{mensaje.consulta}</dd>
                          </>
                        )}
                        {mensaje.origen && (
                          <>
                            <dt className="text-humo">Página de origen</dt>
                            <dd className="font-codigo text-xs text-grafito">{mensaje.origen}</dd>
                          </>
                        )}
                        <dt className="text-humo">Idioma</dt>
                        <dd className="text-tinta">{mensaje.idioma}</dd>
                      </dl>

                      <p className="text-sm text-tinta whitespace-pre-wrap max-w-2xl mb-4">
                        {mensaje.cuerpo}
                      </p>

                      {mensaje.detalle_entrega && (
                        <p className="text-xs text-cinabrio mb-4 font-codigo">
                          {mensaje.detalle_entrega}
                        </p>
                      )}

                      <footer className="flex items-center gap-2 pt-4 border-t border-ceniza/60">
                        <Boton
                          tono="discreto"
                          tamano="compacto"
                          onClick={() => {
                            window.location.href = `mailto:${mensaje.correo}?subject=${encodeURIComponent(
                              'Re: ' + (mensaje.consulta || 'Tu consulta'),
                            )}`;
                          }}
                        >
                          Responder
                        </Boton>
                        {(['LEIDO', 'ATENDIDO', 'DESCARTADO'] as const).map((estado) => (
                          <Boton
                            key={estado}
                            tono={estado === 'DESCARTADO' ? 'peligro' : 'fantasma'}
                            tamano="compacto"
                            disabled={mensaje.estado === estado}
                            cargando={
                              cambioEstado.isPending && cambioEstado.variables?.id === mensaje.id
                            }
                            onClick={() => cambioEstado.mutate({ id: mensaje.id, estado })}
                          >
                            {estado === 'LEIDO'
                              ? 'Marcar leído'
                              : estado === 'ATENDIDO'
                                ? 'Marcar atendido'
                                : 'Descartar'}
                          </Boton>
                        ))}
                      </footer>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {consulta.data && (
            <PaginadorTabla
              pagina={paginacion.pagina}
              tamanoPagina={paginacion.tamano_pagina}
              totalFilas={consulta.data.total_filas}
              totalPaginas={consulta.data.total_paginas}
              alCambiarPagina={(pagina) => asignarPaginacion((previa) => ({ ...previa, pagina }))}
            />
          )}
        </>
      )}
    </div>
  );
};
