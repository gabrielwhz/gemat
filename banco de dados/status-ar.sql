-- Adiciona a coluna que guarda o status do ar (true = poluido, false = estavel)
alter table leituras add column if not exists ar_poluido boolean;

-- Recria a função de inserção aceitando esse novo dado.
-- Precisa remover a versão antiga primeiro porque o número de
-- parâmetros mudou (Postgres trata isso como uma função diferente).
drop function if exists public.inserir_leitura(text, numeric, numeric, numeric, numeric);

create or replace function public.inserir_leitura(
  codigo text,
  p_pm25 numeric,
  p_pm10 numeric,
  p_so2 numeric,
  p_nox numeric,
  p_ar_poluido boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prototipo_id uuid;
begin
  select id into v_prototipo_id
  from prototipos
  where codigo_dispositivo = codigo;

  if v_prototipo_id is null then
    raise exception 'Codigo de dispositivo nao encontrado: %', codigo;
  end if;

  insert into leituras (prototipo_id, pm25, pm10, so2, nox, ar_poluido)
  values (v_prototipo_id, p_pm25, p_pm10, p_so2, p_nox, p_ar_poluido);
end;
$$;

grant execute on function public.inserir_leitura(text, numeric, numeric, numeric, numeric, boolean) to anon;