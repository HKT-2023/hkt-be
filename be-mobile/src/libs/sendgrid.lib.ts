import { MailService } from "@sendgrid/mail";
import { HttpException, HttpStatus } from "@nestjs/common";
const fs = require("fs");

export class SendgridLib {
  constructor(private readonly mailService: MailService) {
    this.mailService = new MailService();
    this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
  }

  public async sendMailResetPassword(
    userNameIdentity: string,
    userEmail: string,
    code: string
  ): Promise<void> {
    const forgotPasswordTemplate = fs.readFileSync(
      "src/libs/sendgrid-template/forgot-password.txt",
      "utf8"
    );
    try {
      await this.mailService.send({
        from: process.env.SENDGRID_FROM,
        to: userEmail,
        subject: `${userNameIdentity}, Here is your code. Please verify it's you`,
        html: forgotPasswordTemplate.replace("{{ code }}", code),
      });
    } catch (error) {
      console.log(`\n======================================================`);
      console.log(`[${SendgridLib.name}]: Error send mail reset password`);
      console.log(error);
      console.log(`======================================================\n`);
      throw new HttpException(
        { message: `There something error. Please try later.` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async sendMail(
    userEmail: string,
    subject: string,
    message: string
  ): Promise<void> {
    try {
      await this.mailService.send({
        from: process.env.SENDGRID_FROM,
        to: userEmail,
        subject,
        html: `<p>${message}</p>`,
      });
    } catch (error) {
      console.log(`\n======================================================`);
      console.log(`[${SendgridLib.name}]: Error send mail reset password`);
      console.log(error);
      console.log(`======================================================\n`);
      throw new HttpException(
        { message: `There something error. Please try later.` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  public async contactAgent(
    agentName: string,
    agentEmail: string,
    subject: string,
    message: string,
    userFullName: string,
    userEmail: string,
    userPhone: string
  ): Promise<void> {
    let contactAgentTemplate = fs.readFileSync(
      "src/libs/sendgrid-template/contact-agent.txt",
      "utf8"
    );
    contactAgentTemplate = contactAgentTemplate.replaceAll(
      "{{ Agent Name }}",
      agentName
    );
    contactAgentTemplate = contactAgentTemplate.replaceAll(
      "{{ subject }}",
      subject
    );
    contactAgentTemplate = contactAgentTemplate.replace(
      "{{ userMessage }}",
      message
    );
    contactAgentTemplate = contactAgentTemplate.replace(
      "{{ userFullName }}",
      userFullName
    );
    contactAgentTemplate = contactAgentTemplate.replace(
      "{{ userEmail }}",
      userEmail
    );
    contactAgentTemplate = contactAgentTemplate.replace(
      "{{ userPhone }}",
      userPhone
    );

    try {
      await this.mailService.send({
        from: process.env.SENDGRID_FROM,
        to: agentEmail,
        subject,
        html: contactAgentTemplate,
      });
    } catch (error) {
      console.log(`\n======================================================`);
      console.log(`[${SendgridLib.name}]: Error send mail reset password`);
      console.log(error);
      console.log(`======================================================\n`);
      throw new HttpException(
        { message: `There something error. Please try later.` },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
