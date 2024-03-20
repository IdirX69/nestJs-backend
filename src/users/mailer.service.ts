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
}
