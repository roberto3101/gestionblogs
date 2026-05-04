interface PropiedadesBuscadorTabla {
  valor: string;
  alCambiar: (valor: string) => void;
  marcador?: string;
}

export const BuscadorTabla = ({ valor, alCambiar, marcador = 'Buscar…' }: PropiedadesBuscadorTabla) => (
  <div className="flex items-center bg-papel border border-ceniza rounded-suave focus-within:border-tinta transicion-natural">
    <input
      type="search"
      value={valor}
      onChange={(evento) => alCambiar(evento.target.value)}
      placeholder={marcador}
      className="flex-1 bg-transparent outline-none text-sm text-tinta placeholder:text-humo h-10 px-3"
    />
  </div>
);
