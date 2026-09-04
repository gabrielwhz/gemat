/*
  Lógica da tela "Recuperar senha" (recuperar-senha.html).
  Depende de js/supabase-client.js estar carregado antes.
*/

(function () {
  const form = document.getElementById('recoverForm');
  if (!form) return;

  const emailField = document.getElementById('recoverEmailField');
  const emailInput = document.getElementById('recoverEmail');
  const message = document.getElementById('recoverMessage');
  const submitBtn = form.querySelector('.auth-submit');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'auth-form-message show ' + type;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    emailField.classList.remove('has-error');

    const email = emailInput.value.trim();
    if (!isValidEmail(email)) {
      emailField.classList.add('has-error');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    try {
      const redirectTo = window.location.origin + window.location.pathname.replace('recuperar-senha.html', 'redefinir-senha.html');
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        showMessage('Não foi possível enviar o link agora. Tente novamente em instantes.', 'error');
        return;
      }

      // Mensagem genérica de propósito: não confirma se o e-mail existe ou não,
      // por segurança (evita que alguém descubra quais e-mails têm conta).
      showMessage('Se esse e-mail estiver cadastrado, você vai receber um link de recuperação em instantes.', 'info');
      form.reset();
    } catch (err) {
      console.error('Erro inesperado ao pedir recuperação de senha:', err);
      showMessage('Não foi possível conectar ao Supabase. Confira o console (F12).', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar link de recuperação';
    }
  });
})();
