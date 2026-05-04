import { useState, useEffect, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AreaTexto } from '@compartido/interfaz/primitivas/AreaTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { generarSlug } from '@compartido/utilidades/generarSlug';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import { SelectorEmpresa } from '../selectores/SelectorEmpresa';
import { useCrearSitio } from '../../ganchos/useSitios';
import type { Sitio } from '../../contratos/sitio';
import type { Identificador } from '@compartido/tipos/identificador';

interface PropiedadesFormularioSitio {
  empresaIdInicial?: Identificador;
  alCrear?: (sitio: Sitio) => void;
}

export const FormularioSitio = ({ empresaIdInicial, alCrear }: PropiedadesFormularioSitio) => {
  const [empresaId, asignarEmpresaId] = useState<Identificador | ''>(empresaIdInicial ?? '');
  const [nombre, asignarNombre] = useState('');
  const [codigo, asignarCodigo] = useState('');
  const [dominio, asignarDominio] = useState('');
  const [descripcion, asignarDescripcion] = useState('');
  const creacion = useCrearSitio();

  useEffect(() => {
    if (nombre && !codigo) asignarCodigo(generarSlug(nombre).slice(0, 20));
  }, [nombre, codigo]);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!empresaId) return;
    creacion.mutate(
      {
        empresa_id: empresaId,
        codigo: codigo.trim().toLowerCase(),
        nombre: nombre.trim(),
        dominio: dominio.trim(),
        descripcion: descripcion.trim(),
        idioma_default: 'es',
      },
      { onSuccess: alCrear },
    );
  };

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <SelectorEmpresa valor={empresaId} alCambiar={asignarEmpresaId} ayuda="¿En qué empresa vivirá este sitio?" />
      <CampoTexto
        etiqueta="Nombre del sitio"
        ayuda="Cómo lo llamarás en el panel."
        value={nombre}
        onChange={(e) => asignarNombre(e.target.value)}
        required
        placeholder="Mi Blog Personal"
      />
      <div className="grid grid-cols-2 gap-4">
        <CampoTexto
          etiqueta="Código"
          ayuda="Identificador corto, sin espacios."
          value={codigo}
          onChange={(e) => asignarCodigo(generarSlug(e.target.value))}
          required
          placeholder="mi-blog"
          maxLength={20}
        />
        <CampoTexto
          etiqueta="Dominio"
          ayuda="Tu URL pública."
          value={dominio}
          onChange={(e) => asignarDominio(e.target.value)}
          required
          placeholder="blog.miempresa.com"
        />
      </div>
      <AreaTexto
        etiqueta="Descripción"
        ayuda="Una línea explicando de qué trata este sitio."
        value={descripcion}
        onChange={(e) => asignarDescripcion(e.target.value)}
        placeholder="Donde compartimos novedades del producto."
      />
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <div className="flex justify-end pt-2">
        <Boton type="submit" cargando={creacion.isPending} tamano="amplio">
          Crear sitio
        </Boton>
      </div>
    </form>
  );
};
