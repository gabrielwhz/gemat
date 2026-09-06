-- Permite que o dono de um prototipo o exclua
create policy "usuario_deleta_proprio_prototipo"
on prototipos for delete
using (auth.uid() = dono_id);

-- Permite que o dono exclua as leituras dos proprios prototipos
-- (precisa ser apagado antes do prototipo, por causa da chave estrangeira)
create policy "usuario_deleta_leituras_dos_proprios_prototipos"
on leituras for delete
using (
  exists (
    select 1 from prototipos
    where prototipos.id = leituras.prototipo_id
    and prototipos.dono_id = auth.uid()
  )
);