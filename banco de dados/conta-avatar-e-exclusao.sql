-- ============================================================
-- PARTE 1: Bucket de fotos de perfil
-- ============================================================
-- Antes de rodar esta parte, crie o bucket pela interface:
-- Storage (menu lateral) > New bucket > nome: avatars > Public bucket: ON
-- Depois rode as políticas abaixo no SQL Editor.

create policy "Avatares são públicos para leitura"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Usuarios enviam apenas para sua propria pasta"
on storage.objects for insert
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Usuarios atualizam apenas seus proprios arquivos"
on storage.objects for update
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Usuarios removem apenas seus proprios arquivos"
on storage.objects for delete
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);


-- ============================================================
-- PARTE 2: Função para o usuário excluir a própria conta
-- ============================================================
-- Roda com privilégios elevados (security definer), mas só apaga
-- os dados do próprio usuário que chamou a função (auth.uid()).

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from leituras where prototipo_id in (
    select id from prototipos where dono_id = auth.uid()
  );
  delete from prototipos where dono_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.excluir_minha_conta() to authenticated;