import { useState, type FormEvent } from 'react';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { useCrearEmpresa } from '../ganchos/useEmpresas';
import type { Empresa } from '../contratos/empresa';
import { ErrorHttp } from '@integraciones/http/errorHttp';

interface PropiedadesFormularioEmpresa {
  alCrear?: (empresa: Empresa) => void;
  textoBoton?: string;
}

export const FormularioEmpresa = ({ alCrear, textoBoton = 'Crear empresa' }: PropiedadesFormularioEmpresa) => {
  const [ruc, asignarRuc] = useState('');
  const [razonSocial, asignarRazon] = useState('');
  const creacion = useCrearEmpresa();

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    creacion.mutate(
      { ruc: ruc.trim(), razon_social: razonSocial.trim() },
      { onSuccess: alCrear },
    );
  };

  const mensajeError = creacion.error instanceof ErrorHttp ? creacion.error.message : null;

  return (
    <form onSubmit={enviar} className="space-y-5">
      <CampoTexto
        etiqueta="RUC"
        ayuda="11 dígitos, solo números."
        value={ruc}
        onChange={(e) => asignarRuc(e.target.value)}
        maxLength={11}
        required
        placeholder="20100000000"
      />
      <CampoTexto
        etiqueta="Razón social"
        value={razonSocial}
        onChange={(e) => asignarRazon(e.target.value)}
        required
        placeholder="Mi Empresa S.A.C."
      />
      {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
      <Boton type="submit" cargando={creacion.isPending}>{textoBoton}</Boton>
    </form>
  );
};
