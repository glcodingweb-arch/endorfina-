// app/api/send-email/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// NOTA: As credenciais estão diretamente no código apenas para fins de teste local.
// Em produção, utilize variáveis de ambiente.
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "endorfinaesportesbr@gmail.com", // E-mail do aplicativo
    pass: "peqg gwvq vkwl ikpt",       // Senha de aplicativo para o e-mail
  },
});

const siteUrl = "https://www.endorfinaesportes.com";
const logoUrl = "https://res.cloudinary.com/dl38o4mnk/image/upload/v1769463771/LOGO.png_gteiuk.png";

interface EmailTemplateProps {
  title: string;
  name: string;
  mainMessage: string;
  infoBlock?: string;
  buttonLink?: string;
  buttonText?: string;
}

const emailWrapper = ({
  title,
  name,
  mainMessage,
  infoBlock,
  buttonLink,
  buttonText
}: EmailTemplateProps) => {

  const infoBlockHtml = infoBlock ? `
    <tr>
      <td style="padding:0 30px 20px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6fc; border-radius:12px; border:1px solid #e0cfee;">
          <tr>
            <td style="padding:14px; color:#333333; font-size:14px; line-height:20px;">
              ${infoBlock}
            </td>
          </tr>
        </table>
      </td>
    </tr>` : '';
  
  const buttonHtml = buttonLink && buttonText ? `
    <tr>
      <td align="center" style="padding:10px 30px 30px 30px;">
        <a href="${buttonLink}"
           style="background-color:#6A1B9A; color:#ffffff; text-decoration:none; padding:14px 28px; font-size:15px; border-radius:30px; display:inline-block; font-weight:bold;">
          ${buttonText}
        </a>
      </td>
    </tr>` : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Email Endorfina Esportes</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f2f2f7; font-family:Arial, Helvetica, sans-serif;">

      <!-- Wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f7; padding:20px 0;">
        <tr>
          <td align="center">

            <!-- Card principal -->
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:16px; overflow:hidden; border: 1px solid #e5e7eb;">

              <!-- Header -->
              <tr>
                <td align="center" style="padding:32px 20px 20px 20px;">
                  <img src="${logoUrl}" alt="Endorfina Esportes" width="140" style="display:block;">
                </td>
              </tr>

              <!-- Título -->
              <tr>
                <td align="center" style="padding:0 30px 10px 30px;">
                  <h1 style="margin:0; font-size:22px; color:#6A1B9A; font-weight:bold;">
                    ${title}
                  </h1>
                </td>
              </tr>

              <!-- Texto principal -->
              <tr>
                <td style="padding:20px 30px; color:#333333; font-size:15px; line-height:22px;">
                  <p style="margin:0;">
                    Olá, <strong>${name}</strong>,
                  </p>

                  <p style="margin:12px 0 0 0;">
                    ${mainMessage}
                  </p>
                </td>
              </tr>
              
              ${infoBlockHtml}
              ${buttonHtml}

              <!-- Assinatura -->
              <tr>
                <td style="padding:0 30px 30px 30px; color:#555555; font-size:14px; line-height:20px;">
                  <p style="margin:0;">
                    Qualquer dúvida, é só falar com a gente 💜
                  </p>

                  <p style="margin:12px 0 0 0;">
                    Abraços,<br>
                    <strong>Equipe ENDORFINA ESPORTES</strong>
                  </p>
                </td>
              </tr>

              <!-- Rodapé -->
              <tr>
                <td style="background-color:#f4eff9; padding:20px 30px; font-size:12px; color:#777777; line-height:18px;">
                  <p style="margin:0;">
                    Você recebeu este e-mail porque possui cadastro na Endorfina Esportes.
                  </p>
                  <p style="margin:8px 0 0 0;">
                    © ${new Date().getFullYear()} Endorfina Esportes · Todos os direitos reservados
                  </p>
                </td>
              </tr>

            </table>
            <!-- Fim card -->

          </td>
        </tr>
      </table>

    </body>
    </html>`;
};


// Função para construir o conteúdo do e-mail com base no tipo
function getEmailContent({ type, data }: { type: string; data?: any }) {
  let subject = "";
  let htmlContent = "";

  switch (type) {
    case "welcome":
      subject = `Bem-vindo(a) à Endorfina Esportes!`;
      htmlContent = emailWrapper({
        title: "Sua jornada começa agora!",
        name: data?.customerName || "Atleta",
        mainMessage: "Sua conta foi criada com sucesso! Estamos felizes em ter você na nossa comunidade. Agora você pode explorar nossos eventos, gerenciar suas inscrições e muito mais.",
        buttonLink: `${siteUrl}/races`,
        buttonText: "Encontrar minha próxima corrida",
      });
      break;
      
    case "passwordChanged":
      subject = `[Segurança] Sua senha foi alterada`;
      htmlContent = emailWrapper({
        title: "Aviso de Segurança",
        name: data?.customerName || "Atleta",
        mainMessage: "Este é um aviso de segurança para informar que a senha da sua conta na Endorfina Esportes foi alterada com sucesso. Se você não realizou esta alteração, entre em contato com nosso suporte imediatamente."
      });
      break;

    case "orderConfirmation":
      subject = `Inscrição Confirmada! Pedido #${data?.orderNumber || ""}`;
      htmlContent = emailWrapper({
        title: "Pagamento Aprovado!",
        name: data?.customerName || "Atleta",
        mainMessage: `Seu pagamento foi aprovado e sua inscrição para o evento <strong>${data?.raceName}</strong> foi confirmada com sucesso! O próximo passo é identificar os atletas para cada vaga adquirida. Você pode fazer isso a qualquer momento no seu painel.`,
        infoBlock: `<b>Número do Pedido:</b> #${data?.orderNumber || "-"}<br><b>Total de Inscrições:</b> ${data?.totalInscriptions || "-"}`,
        buttonLink: `${siteUrl}/dashboard/subscriptions`,
        buttonText: "Acessar Minhas Inscrições",
      });
      break;

    case "paymentPending":
      subject = `Aguardando pagamento do seu pedido #${data?.orderNumber}`;
      htmlContent = emailWrapper({
        title: "Finalize seu pagamento!",
        name: data?.customerName || "Atleta",
        mainMessage: `Vimos que você gerou um PIX para o pedido <strong>#${data?.orderNumber}</strong>, mas ainda não identificamos o pagamento. Não perca sua vaga! Lembre-se que o código PIX expira em breve. Use o QR Code ou o código copia-e-cola para finalizar.`,
        infoBlock: `<p style="font-family:monospace;word-break:break-all;text-align:center;">${data?.pixCode || "Código PIX não disponível"}</p>`,
      });
      break;

    case "paymentFailed":
       subject = `Problema no pagamento do seu pedido #${data?.orderNumber}`;
       htmlContent = emailWrapper({
          title: "Pagamento Recusado",
          name: data?.customerName || "Atleta",
          mainMessage: `Houve um problema ao processar o pagamento do seu pedido <strong>#${data?.orderNumber}</strong> para o evento <strong>${data?.raceName}</strong>. Por favor, verifique os dados do seu cartão ou tente uma nova forma de pagamento para garantir sua vaga.`,
          buttonLink: `${siteUrl}/cart`,
          buttonText: "Tentar Novamente",
       });
       break;

    case "kitShipped":
       subject = `Seu kit está a caminho! Pedido #${data?.orderNumber}`;
       htmlContent = emailWrapper({
          title: "Kit a Caminho!",
          name: data?.customerName || "Atleta",
          mainMessage: `Ótima notícia! O kit para sua inscrição no evento <strong>${data?.raceName}</strong> já foi enviado. Em breve você o receberá no endereço cadastrado.`,
          infoBlock: data?.trackingCode ? `<b>Código de Rastreio:</b> ${data.trackingCode}` : undefined
       });
       break;

    case "orderCancelled":
       subject = `Pedido #${data?.orderNumber} cancelado`;
       htmlContent = emailWrapper({
          title: "Inscrição Cancelada",
          name: data?.customerName || "Atleta",
          mainMessage: `Conforme solicitado, sua inscrição para o evento <strong>${data?.raceName}</strong> (pedido #${data?.orderNumber}) foi cancelada. Esperamos ver você em nossos próximos eventos!`,
          infoBlock: data?.refundInfo
       });
       break;

    case "abandonedCart":
      subject = `Finalize sua inscrição para ${data?.raceName || "a corrida"}`;
      htmlContent = emailWrapper({
        title: "Você está quase lá!",
        name: data?.customerName || "Atleta",
        mainMessage: `Notamos que você iniciou o processo de inscrição para <strong>${data?.raceName}</strong>, mas não finalizou. Não perca a chance de participar deste evento incrível! Restam poucas vagas. Complete sua inscrição agora mesmo.`,
        buttonLink: data?.checkoutUrl || `${siteUrl}/cart`,
        buttonText: "Finalizar Inscrição",
      });
      break;
      
    case "profileUpdated":
      subject = `[Segurança] Seus dados foram atualizados`;
      htmlContent = emailWrapper({
        title: "Seu Perfil Foi Atualizado",
        name: data?.customerName || "Atleta",
        mainMessage: "Este é um aviso para confirmar que as informações do seu perfil na Endorfina Esportes foram atualizadas com sucesso. Se você não realizou esta alteração, entre em contato com nosso suporte imediatamente."
      });
      break;

    case "contactConfirmation":
      subject = `Recebemos sua mensagem!`;
      htmlContent = emailWrapper({
        title: "Contato Recebido",
        name: data?.customerName || "Atleta",
        mainMessage: "Obrigado por entrar em contato! Recebemos sua mensagem e nossa equipe responderá o mais breve possível.",
        infoBlock: `<strong>Sua Mensagem:</strong><br/><i>"${data?.message}"</i>`
      });
      break;
    
    case "identificationPending":
      subject = `⚠️ Lembrete: Identifique seus atletas para a ${data?.raceName || "corrida"}`;
      htmlContent = emailWrapper({
        title: "Ação Necessária!",
        name: data?.customerName || "Atleta",
        mainMessage: `Vimos que você tem <strong>${data?.pendingCount || 'algumas'} inscrições pendentes de identificação</strong> para o evento <strong>${data?.raceName}</strong>. Para garantir a participação de todos, é essencial que você atribua um atleta a cada vaga adquirida.`,
        buttonLink: data?.dashboardUrl || `${siteUrl}/dashboard/subscriptions`,
        buttonText: "Identificar Atletas Agora",
      });
      break;

    case "newContactMessageAdmin":
      subject = `Nova Mensagem Recebida de ${data?.senderName}`;
      htmlContent = emailWrapper({
        title: "Novo Contato no Site",
        name: "Admin",
        mainMessage: `Você recebeu uma nova mensagem através do formulário de contato do site Endorfina Esportes.`,
        infoBlock: `
          <b>De:</b> ${data?.senderName} (${data?.senderEmail})<br>
          <br>
          <b>Mensagem:</b><br>
          <p style="white-space: pre-wrap; font-style: italic;">${data?.message}</p>
        `,
        buttonLink: `${siteUrl}/admin/messages`,
        buttonText: "Ver na Caixa de Entrada",
      });
      break;

    default:
      return { subject: "", htmlContent: "" };
  }

  return { subject, htmlContent };
}

// Rota da API
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data, to } = body;

    // Valida os campos obrigatórios
    if (!type || !to) {
        return NextResponse.json({ error: "Os parâmetros 'type' e 'to' são obrigatórios." }, { status: 400 });
    }

    const { subject, htmlContent } = getEmailContent({ type, data });

    if (!subject || !htmlContent) {
      return NextResponse.json({ error: "Tipo de e-mail inválido ou não encontrado." }, { status: 400 });
    }

    await transporter.sendMail({
      from: `"Endorfina Esportes" <${(transporter.options as any).auth.user}>`,
      to,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: "E-mail enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro interno.";
    return NextResponse.json({ error: "Ocorreu um erro interno ao tentar enviar o e-mail.", details: errorMessage }, { status: 500 });
  }
}
