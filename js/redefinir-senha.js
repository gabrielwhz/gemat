/*
  Lógica da tela "Definir nova senha" (redefinir-senha.html).

  O usuário chega aqui depois de clicar no link do e-mail de recuperação.
  O supabase-js lê automaticamente o token que vem na URL e já deixa uma
  sessão de recuperação ativa — não precisamos fazer nada manual com a URL.
*/

(async function () {
  const form = document.getElementById('redefinirForm');
  if (!form) return;

  const lede = document.getElementById('redefinirLede');
  const novaSenhaField = document.getElementById('novaSenhaField');
  const novaSenhaInput = document.getElementById('novaSenha');
  const confirmField = document.getElementById('confirmarSenhaField');
  const confirmInput = document.getElementById('confirmarSenha');
  const message = document.getElementById('redefinirMessage');
  const submitBtn = form.querySelector('.auth-submit');
  const toggleBtn = document.getElementById('novaSenhaToggle');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = novaSenhaInput.type === 'password';
      novaSenhaInput.type = isHidden ? 'text' : 'password';
      toggleBtn.textContent = isHidden ? 'ocultar' : 'mostrar';
    });
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'auth-form-message show ' + type;
  }

  // Confere se realmente existe uma sessão de recuperação válida
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    lede.textContent = 'Esse link expirou ou já foi usado. Volte e solicite um novo link de recuperação.';
    form.style.display = 'none';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    novaSenhaField.classList.remove('has-error');
    confirmField.classList.remove('has-error');

    let hasError = false;
    if (novaSenhaInput.value.length < 6) {
      novaSenhaField.classList.add('has-error');
      hasError = true;
    }
    if (confirmInput.value !== novaSenhaInput.value) {
      confirmField.classList.add('has-error');
      hasError = true;
    }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Salvando...';

    try {
      const { error } = await supabaseClient.auth.updateUser({ password: novaSenhaInput.value });

      if (error) {
        showMessage('Não foi possível salvar a nova senha. Tente novamente.', 'error');
        return;
      }

      showMessage('Senha atualizada! Levando você para a central...', 'info');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    } catch (err) {
      console.error('Erro inesperado ao redefinir senha:', err);
      showMessage('Não foi possível conectar ao Supabase. Confira o console (F12).', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Salvar nova senha';
    }
  });
})();
