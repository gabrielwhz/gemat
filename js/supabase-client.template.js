/*
  Cliente do Supabase, compartilhado por todas as páginas que precisam
  de login ou dados.

  ESTE ARQUIVO É UM MODELO — ele fica versionado no GitHub com
  placeholders. O arquivo real (js/supabase-client.js) é gerado
  automaticamente pelo GitHub Actions no momento do deploy, substituindo
  os placeholders pelos Secrets do repositório. Veja .github/workflows/deploy.yml.

  Para rodar localmente (Live Server), copie este arquivo para
  js/supabase-client.js e troque os placeholders pelos valores reais
  do seu projeto Supabase. Esse arquivo local fica de fora do git
  (veja o .gitignore).
*/

const SUPABASE_URL = '__SUPABASE_URL__';
const SUPABASE_PUBLISHABLE_OR_ANON_KEY = '__SUPABASE_KEY__';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_OR_ANON_KEY);
