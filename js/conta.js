/*
  Lógica da tela "Sua conta" (conta.html).
  Depende de js/supabase-client.js estar carregado antes.
*/

(async function () {
  const perfilForm = document.getElementById('perfilForm');
  const perfilNomeField = document.getElementById('perfilNomeField');
  const perfilNomeInput = document.getElementById('perfilNome');
  const perfilMessage = document.getElementById('perfilMessage');

  const emailForm = document.getElementById('emailForm');
  const emailAtualEl = document.getElementById('emailAtual');
  const novoEmailField = document.getElementById('novoEmailField');
  const novoEmailInput = document.getElementById('novoEmail');
  const emailMessage = document.getElementById('emailMessage');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showMsg(el, text, type) {
    el.textContent = text;
    el.className = 'auth-form-message show ' + type;
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

  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    novoEmailField.classList.remove('has-error');

    const novoEmail = novoEmailInput.value.trim();
    if (!isValidEmail(novoEmail)) {
      novoEmailField.classList.add('has-error');
      return;
    }

    const btn = emailForm.querySelector('.auth-submit');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      const { error } = await supabaseClient.auth.updateUser({ email: novoEmail });

      if (error) {
        showMsg(emailMessage, 'Não foi possível atualizar. Tente de novo.', 'error');
        return;
      }

      showMsg(
        emailMessage,
        'Enviamos um link de confirmação para o novo e-mail (e talvez também para o antigo). O e-mail só muda de fato depois que você confirmar pelo link.',
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
})();
