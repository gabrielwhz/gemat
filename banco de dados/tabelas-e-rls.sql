-- Tabela de protótipos: cada linha é um dispositivo vinculado a um usuário
create table prototipos (
  id uuid primary key default gen_random_uuid(),
  dono_id uuid references auth.users(id) not null,
  apelido text not null,
  codigo_dispositivo text unique not null,
  criado_em timestamp with time zone default now()
);

-- Tabela de leituras: cada linha é uma medição de um protótipo
create table leituras (
  id bigint generated always as identity primary key,
  prototipo_id uuid references prototipos(id) not null,
  pm25 numeric,
  pm10 numeric,
  so2 numeric,
  nox numeric,
  medido_em timestamp with time zone default now()
);

-- Liga o Row Level Security nas duas tabelas
alter table prototipos enable row level security;
alter table leituras enable row level security;

-- Um usuário só vê os próprios protótipos
create policy "usuario_ve_proprios_prototipos"
on prototipos for select
using (auth.uid() = dono_id);

-- Um usuário só cria protótipos vinculados a ele mesmo
create policy "usuario_cria_proprio_prototipo"
on prototipos for insert
with check (auth.uid() = dono_id);

-- Um usuário só vê leituras dos protótipos que são dele
create policy "usuario_ve_leituras_dos_proprios_prototipos"
on leituras for select
using (
  exists (
    select 1 from prototipos
    where prototipos.id = leituras.prototipo_id
    and prototipos.dono_id = auth.uid()
  )
);