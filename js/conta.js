/*
  Lógica da tela "Sua conta" (conta.html).
  Depende de js/supabase-client.js estar carregado antes.
*/

(async function () {
  const perfilForm = document.getElementById('perfilForm');
  const perfilNomeField = document.getElementById('perfilNomeField');
  const perfilNomeInput = document.getElementById('perfilNome');
  const perfilMessage = document.getElementById('perfilMessage');

  const avatarForm = document.getElementById('avatarForm');
  const avatarInput = document.getElementById('avatarInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarMessage = document.getElementById('avatarMessage');

  const emailForm = document.getElementById('emailForm');
  const emailAtualEl = document.getElementById('emailAtual');
  const novoEmailField = document.getElementById('novoEmailField');
  const novoEmailInput = document.getElementById('novoEmail');
  const senhaEmailField = document.getElementById('senhaEmailField');
  const senhaEmailInput = document.getElementById('senhaEmail');
  const emailMessage = document.getElementById('emailMessage');

  const excluirForm = document.getElementById('excluirForm');
  const senhaExcluirField = document.getElementById('senhaExcluirField');
  const senhaExcluirInput = document.getElementById('senhaExcluir');
  const excluirMessage = document.getElementById('excluirMessage');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = 'auth-form-message show ' + type;
  }

  function renderAvatar(user) {
    const avatarUrl = user.user_metadata && user.user_metadata.avatar_url;
    if (avatarUrl) {
      avatarPreview.innerHTML = '<img src="' + avatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;">';
    } else {
      const displayName = (user.user_metadata && user.user_metadata.full_name) || user.email;
      avatarPreview.textContent = displayName.trim().charAt(0).toUpperCase();
    }
  }

  // Confere login; sem sessão, manda pro login.
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;
  perfilNomeInput.value = (user.user_metadata && user.user_metadata.full_name) || '';
  emailAtualEl.textContent = user.email;
  renderAvatar(user);

  /* ---------- NOME ---------- */
  perfilForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    perfilNomeField.classList.remove('has-error');

    if (perfilNomeInput.value.trim().length < 2) {
      perfilNomeField.classList.add('has-error');
      return;
    }

    const btn = perfilForm.querySelector('.auth-submit');
    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: { full_name: perfilNomeInput.value.trim() }
      });

      if (error) {
        showMsg(perfilMessage, 'Não foi possível salvar. Tente de novo.', 'error');
        return;
      }
      showMsg(perfilMessage, 'Nome atualizado!', 'info');
    } catch (err) {
      console.error('Erro ao atualizar nome:', err);
      showMsg(perfilMessage, 'Erro de conexão. Confira o console (F12).', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar nome';
    }
  });

  /* ---------- FOTO DE PERFIL ---------- */
  avatarForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const file = avatarInput.files[0];
    if (!file) {
      showMsg(avatarMessage, 'Escolha uma imagem primeiro.', 'error');
      return;
    }
    if (!file.type.startsWith('image/')) {
      showMsg(avatarMessage, 'O arquivo precisa ser uma imagem (JPG ou PNG).', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showMsg(avatarMessage, 'A imagem precisa ter no máximo 2MB.', 'error');
      return;
    }

    const btn = avatarForm.querySelector('.auth-submit');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const path = user.id + '/avatar';
      const { error: uploadError } = await supabaseClient.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        console.error(uploadError);
        showMsg(avatarMessage, 'Não foi possível enviar a imagem. Confira se o bucket "avatars" foi criado no Supabase.', 'error');
        return;
      }

      const { data: publicUrlData } = supabaseClient.storage.from('avatars').getPublicUrl(path);
      const avatarUrl = publicUrlData.publicUrl + '?t=' + Date.now(); // evita cache da imagem antiga

      const { error: updateError } = await supabaseClient.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      if (updateError) {
        showMsg(avatarMessage, 'Imagem enviada, mas não foi possível salvar no perfil.', 'error');
        return;
      }

      avatarPreview.innerHTML = '<img src="' + avatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;">';
      showMsg(avatarMessage, 'Foto de perfil atualizada!', 'info');
      avatarForm.reset();
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
      showMsg(avatarMessage, 'Erro de conexão. Confira o console (F12).', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar foto';
    }
  });

  /* ---------- E-MAIL (exige senha atual) ---------- */
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    novoEmailField.classList.remove('has-error');
    senhaEmailField.classList.remove('has-error');

    const novoEmail = novoEmailInput.value.trim();
    const senhaAtual = senhaEmailInput.value;

    let hasError = false;
    if (!isValidEmail(novoEmail)) {
      novoEmailField.classList.add('has-error');
      hasError = true;
    }
    if (senhaAtual.length < 6) {
      senhaEmailField.classList.add('has-error');
      hasError = true;
    }
    if (hasError) return;

    const btn = emailForm.querySelector('.auth-submit');
    btn.disabled = true;
    btn.textContent = 'Verificando senha...';

    try {
      // Reautentica com a senha atual antes de aceitar a troca de e-mail
      const { error: reauthError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: senhaAtual
      });

      if (reauthError) {
        showMsg(emailMessage, 'Senha atual incorreta.', 'error');
        return;
      }

      btn.textContent = 'Enviando...';
      const { error } = await supabaseClient.auth.updateUser({ email: novoEmail });

      if (error) {
        showMsg(emailMessage, 'Não foi possível atualizar. Tente de novo.', 'error');
        return;
      }

      showMsg(
        emailMessage,
        'Enviamos um link de confirmação para o novo e-mail. O e-mail só muda depois que você clicar nesse link.',
        'info'
      );
      emailForm.reset();
    } catch (err) {
      console.error('Erro ao atualizar e-mail:', err);
      showMsg(emailMessage, 'Erro de conexão. Confira o console (F12).', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Atualizar e-mail';
    }
  });

  /* ---------- EXCLUIR CONTA ---------- */
  excluirForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    senhaExcluirField.classList.remove('has-error');

    if (senhaExcluirInput.value.length < 6) {
      senhaExcluirField.classList.add('has-error');
      return;
    }

    const confirmar = window.confirm('Tem certeza que quer excluir sua conta? Essa ação não pode ser desfeita.');
    if (!confirmar) return;

    const btn = excluirForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Verificando senha...';

    try {
      const { error: reauthError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: senhaExcluirInput.value
      });

      if (reauthError) {
        showMsg(excluirMessage, 'Senha incorreta.', 'error');
        return;
      }

      btn.textContent = 'Excluindo...';
      const { error: rpcError } = await supabaseClient.rpc('excluir_minha_conta');

      if (rpcError) {
        console.error(rpcError);
        showMsg(excluirMessage, 'Não foi possível excluir a conta. Confira se a função excluir_minha_conta foi criada no Supabase.', 'error');
        return;
      }

      await supabaseClient.auth.signOut();
      window.location.href = '../index.html';
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      showMsg(excluirMessage, 'Erro de conexão. Confira o console (F12).', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Excluir minha conta';
    }
  });
})();
