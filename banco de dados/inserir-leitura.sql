-- Função que o ESP32 vai chamar pra gravar uma leitura.
-- Roda com privilégios elevados (security definer), mas só grava
-- na leitura vinculada ao código de dispositivo informado — o ESP32
-- nunca precisa saber o UUID interno do protótipo, só o próprio código.

create or replace function public.inserir_leitura(
  codigo text,
  p_pm25 numeric,
  p_pm10 numeric,
  p_so2 numeric,
  p_nox numeric
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

  insert into leituras (prototipo_id, pm25, pm10, so2, nox)
  values (v_prototipo_id, p_pm25, p_pm10, p_so2, p_nox);
end;
$$;

-- Permite que qualquer requisição com a chave pública (anon) chame essa
-- função — sem isso, o ESP32 não conseguiria gravar nada.
grant execute on function public.inserir_leitura(text, numeric, numeric, numeric, numeric) to anon;