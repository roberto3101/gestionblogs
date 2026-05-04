import { Route } from 'react-router-dom';
import { DisposicionPanel } from '@plataforma/caparazon/disposicion/DisposicionPanel';
import { PaginaInicio } from '@plataforma/caparazon/tablero/PaginaInicio';
import { GuardiaAutenticacion } from './GuardiaAutenticacion';
import { ProveedorSitioActivo } from '@plataforma/contexto/contextoSitioActivo';

import { PaginaEmpresas } from '@capacidades/organizacion/paginas/PaginaEmpresas';
import { PaginaCrearEmpresa } from '@capacidades/organizacion/paginas/PaginaCrearEmpresa';

import { PaginaSitios } from '@capacidades/contenido-editorial/paginas/sitios/PaginaSitios';
import { PaginaCrearSitio } from '@capacidades/contenido-editorial/paginas/sitios/PaginaCrearSitio';
import { PaginaAutores } from '@capacidades/contenido-editorial/paginas/autores/PaginaAutores';
import { PaginaCategorias } from '@capacidades/contenido-editorial/paginas/categorias/PaginaCategorias';
import { PaginaEtiquetas } from '@capacidades/contenido-editorial/paginas/etiquetas/PaginaEtiquetas';
import { PaginaMedios } from '@capacidades/contenido-editorial/paginas/medios/PaginaMedios';
import { PaginaPosts } from '@capacidades/contenido-editorial/paginas/posts/PaginaPosts';
import { PaginaCrearPost } from '@capacidades/contenido-editorial/paginas/posts/PaginaCrearPost';
import { PaginaDetallePost } from '@capacidades/contenido-editorial/paginas/posts/PaginaDetallePost';
import { PaginaEditarPost } from '@capacidades/contenido-editorial/paginas/posts/PaginaEditarPost';

import { PaginaRoles } from '@capacidades/gobierno-acceso/paginas/PaginaRoles';
import { PaginaPermisos } from '@capacidades/gobierno-acceso/paginas/PaginaPermisos';
import { PaginaAlcances } from '@capacidades/gobierno-acceso/paginas/PaginaAlcances';

export const rutasPrivadas = (
  <Route
    path="/panel"
    element={
      <GuardiaAutenticacion>
        <ProveedorSitioActivo>
          <DisposicionPanel />
        </ProveedorSitioActivo>
      </GuardiaAutenticacion>
    }
  >
    <Route index element={<PaginaInicio />} />
    <Route path="empresas" element={<PaginaEmpresas />} />
    <Route path="empresas/nueva" element={<PaginaCrearEmpresa />} />
    <Route path="sitios" element={<PaginaSitios />} />
    <Route path="sitios/nuevo" element={<PaginaCrearSitio />} />
    <Route path="autores" element={<PaginaAutores />} />
    <Route path="categorias" element={<PaginaCategorias />} />
    <Route path="etiquetas" element={<PaginaEtiquetas />} />
    <Route path="medios" element={<PaginaMedios />} />
    <Route path="posts" element={<PaginaPosts />} />
    <Route path="posts/nuevo" element={<PaginaCrearPost />} />
    <Route path="posts/:postId" element={<PaginaDetallePost />} />
    <Route path="posts/:postId/editar" element={<PaginaEditarPost />} />
    <Route path="roles" element={<PaginaRoles />} />
    <Route path="permisos" element={<PaginaPermisos />} />
    <Route path="alcances" element={<PaginaAlcances />} />
  </Route>
);
