import mercadopago from 'mercadopago';

// ============================================================================
//  CONFIGURAÇÃO DAS CHAVES - LEIA COM ATENÇÃO
// ============================================================================
// Para garantir a segurança, suas chaves de API NUNCA devem ser expostas
// no código do front-end. Elas devem ser armazenadas como variáveis de ambiente.
//
// 1. Crie um arquivo chamado `.env.local` na raiz do seu projeto.
// 2. Adicione suas chaves a esse arquivo, como no exemplo abaixo:
//
//    MERCADOPAGO_PUBLIC_KEY="SEU_PUBLIC_KEY_AQUI"
//    MERCADOPAGO_ACCESS_TOKEN="SEU_ACCESS_TOKEN_AQUI"
//
// 3. O Next.js carregará automaticamente essas variáveis.
//
// Lembre-se: O arquivo `.env.local` NUNCA deve ser enviado para o seu
// repositório Git. Adicione-o ao seu arquivo `.gitignore`.
// ============================================================================

interface MercadoPagoConfig {
  publicKey: string;
  accessToken: string;
  options: {
    sandbox: boolean;
  };
}

export const mercadopagoConfig: MercadoPagoConfig = {
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || 'APP_USR-719514bf-3d06-4eec-80ef-29b5c228fef7', // Fallback para a chave pública fornecida
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-2266536872311672-111715-045b4ec9fa72aaf65b25778fc9e92b81-2997746712', // Fallback para o token de acesso fornecido
  options: {
    sandbox: process.env.NODE_ENV === 'development',
  },
};

// Inicializa o cliente do Mercado Pago no lado do servidor
export const mercadopagoClient = new mercadopago({
  accessToken: mercadopagoConfig.accessToken,
  options: {
    timeout: 5000,
  }
});
