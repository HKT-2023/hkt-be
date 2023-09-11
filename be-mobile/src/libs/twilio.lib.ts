import { HttpException, HttpStatus } from "@nestjs/common";
import { Twilio } from "twilio";

export class TwilioLib {
  private twilioClient: Twilio;
  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    this.twilioClient = new Twilio(accountSid, authToken);
  }

  public async sendSMSCode(phone: string, code: string): Promise<void> {
    try {
      if (process.env.NODE_ENV !== "development") {
        await this.twilioClient.messages.create({
          body: `Your phone code is: ${code}`,
          from: process.env.TWILIO_PHONE,
          to: phone,
        });
      }
    } catch (err) {
      throw new HttpException(
        { message: "Send SMS Error" },
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
