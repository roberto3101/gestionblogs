import { useState, type FormEvent } from 'react';
import { EncabezadoSeccion } from '@compartido/interfaz/primitivas/EncabezadoSeccion';
import { Boton } from '@compartido/interfaz/primitivas/Boton';
import { CampoTexto } from '@compartido/interfaz/primitivas/CampoTexto';
import { Selector } from '@compartido/interfaz/primitivas/Selector';
import { AvisoError } from '@compartido/interfaz/retroalimentacion/AvisoError';
import { EstadoVacio } from '@compartido/interfaz/retroalimentacion/EstadoVacio';
import { Lamina } from '@compartido/interfaz/primitivas/Lamina';
import { useSitioActivo } from '@plataforma/contexto/contextoSitioActivo';
import { useSubirMedio } from '../../ganchos/useMedios';
import { ErrorHttp } from '@integraciones/http/errorHttp';
import type { TipoMedio } from '../../contratos/medio';

export const PaginaMedios = () => {
  const { sitioActivo } = useSitioActivo();
  const subida = useSubirMedio();
  const [tipo, asignarTipo] = useState<TipoMedio>('IMAGEN');
  const [nombre, asignarNombre] = useState('');
  const [url, asignarUrl] = useState('');
  const [formato, asignarFormato] = useState('image/jpeg');
  const [bytes, asignarBytes] = useState(0);

  if (!sitioActivo) {
    return <EstadoVacio titulo="Selecciona un sitio" descripcion="Los medios viven dentro de un sitio." />;
  }

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    subida.mutate({
      sitio_id: sitioActivo.id,
      tipo,
      nombre,
      url,
      formato,
      tamano_bytes: bytes,
    });
  };

  const mensajeError = subida.error instanceof ErrorHttp ? subida.error.message : null;

  return (
    <div>
      <EncabezadoSeccion
        preTitulo="Redacción"
        titulo="Medios"
        descripcion="Imágenes, videos y archivos que usarás en tus posts. Por ahora se registran por URL."
      />
      <Lamina className="p-6 max-w-2xl">
        <form onSubmit={enviar} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Selector
              etiqueta="Tipo"
              opciones={[
                { valor: 'IMAGEN', etiqueta: 'Imagen' },
                { valor: 'VIDEO', etiqueta: 'Video' },
                { valor: 'AUDIO', etiqueta: 'Audio' },
                { valor: 'DOCUMENTO', etiqueta: 'Documento' },
              ]}
              value={tipo}
              onChange={(e) => asignarTipo(e.target.value as TipoMedio)}
            />
            <CampoTexto
              etiqueta="Formato MIME"
              value={formato}
              onChange={(e) => asignarFormato(e.target.value)}
              placeholder="image/jpeg"
            />
          </div>
          <CampoTexto
            etiqueta="Nombre del archivo"
            value={nombre}
            onChange={(e) => asignarNombre(e.target.value)}
            required
            placeholder="portada-articulo.jpg"
          />
          <CampoTexto
            etiqueta="URL pública"
            value={url}
            onChange={(e) => asignarUrl(e.target.value)}
            required
            placeholder="https://cdn.example.com/portada.jpg"
          />
          <CampoTexto
            etiqueta="Tamaño (bytes)"
            type="number"
            value={String(bytes)}
            onChange={(e) => asignarBytes(Number(e.target.value))}
            placeholder="245678"
          />
          {mensajeError && <AvisoError>{mensajeError}</AvisoError>}
          {subida.isSuccess && (
            <div className="border border-oliva/30 bg-oliva-suave/40 rounded-suave px-4 py-3 text-sm text-tinta">
              Medio registrado correctamente.
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Boton type="submit" cargando={subida.isPending}>Registrar medio</Boton>
          </div>
        </form>
      </Lamina>
    </div>
  );
};
