/*
  Lógica da tela "Cadastrar protótipo" (cadastro-prototipo.html).
  Depende de js/supabase-client.js estar carregado antes.
*/

(async function () {
  const form = document.getElementById('prototipoForm');
  if (!form) return;

  const apelidoField = document.getElementById('apelidoField');
  const apelidoInput = document.getElementById('apelido');
  const codigoField = document.getElementById('codigoField');
  const codigoInput = document.getElementById('codigo');
  const message = document.getElementById('prototipoMessage');
  const submitBtn = form.querySelector('.auth-submit');

  function showMessage(text, type) {
    message.textContent = text;
    message.className = 'auth-form-message show ' + type;
  }

  // Confere login; sem sessão, manda pro login.
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  const user = session.user;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    apelidoField.classList.remove('has-error');
    codigoField.classList.remove('has-error');

    const apelido = apelidoInput.value.trim();
    const codigo = codigoInput.value.trim();

    let hasError = false;
    if (apelido.length < 2) {
      apelidoField.classList.add('has-error');
      hasError = true;
    }
    if (codigo.length < 3) {
      codigoField.classList.add('has-error');
      hasError = true;
    }
    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Cadastrando...';

    try {
      const { error } = await supabaseClient
        .from('prototipos')
        .insert({
          dono_id: user.id,
          apelido: apelido,
          codigo_dispositivo: codigo
        });

      if (error) {
        if (error.code === '23505') {
          // violação de UNIQUE (codigo_dispositivo já existe)
          showMessage('Esse código de dispositivo já está em uso. Escolha outro.', 'error');
        } else {
          console.error(error);
          showMessage('Não foi possível cadastrar. Tente novamente.', 'error');
        }
        return;
      }

      showMessage('Protótipo cadastrado! Levando você para a central...', 'info');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    } catch (err) {
      console.error('Erro inesperado ao cadastrar protótipo:', err);
      showMessage('Erro de conexão. Confira o console (F12).', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Cadastrar protótipo';
    }
  });
})();
