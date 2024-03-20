import { Resend } from 'resend';

export class MailerService {
  private readonly mailer: Resend;
  constructor() {
    this.mailer = new Resend(process.env.RESEND_API_KEY);
  }
  async sendCreatedAccountEmail({
    recepient,
    firstname,
  }: {
    recepient: string;
    firstname: string;
  }) {
    const { data, error } = await this.mailer.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [recepient],
      subject: 'Bienvenue sur la plateforme',
      html: `Bonjour ${firstname} et bienvenue,
      <strong>Votre compte a bien été crée</strong>`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  }
  async sendRequestedPasswordEmail({
    recepient,
    firstname,
    token,
  }: {
    recepient: string;
    firstname: string;
    token: string;
  }) {
    const link = `${process.env.FRONTEND_URL}/forgot-password?token=${token}`;
    const { data, error } = await this.mailer.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [recepient],
      subject: 'Réinitialisation de mot de passe...',
      html: `Bonjour ${firstname} voici votre lien de réinitalisation de mot de passe :,
      <strong>${link}</strong>`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  }
}
