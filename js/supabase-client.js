/*
  Cliente do Supabase, compartilhado por todas as páginas que precisam
  de login ou dados (login.html, cadastro.html, e futuramente dashboard.html).

  Troque as duas constantes abaixo pelos valores do SEU projeto Supabase:
  clique em "Connect" no topo do painel do projeto, ou vá em
  Settings > API Keys.

  Copie a "Project URL" e a chave publishable (começa com sb_publishable_...).
  Se seu projeto só mostrar a chave "anon" (uma string longa começando com
  eyJ...), pode usar ela também — funciona igual aqui.
*/

const SUPABASE_URL = 'https://tswsktdepokffukzoabp.supabase.co';
const SUPABASE_PUBLISHABLE_OR_ANON_KEY = 'sb_publishable_0Tuyd26ErflOYVg5u9k--w_pUJaHOjx';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_OR_ANON_KEY);