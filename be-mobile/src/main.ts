import * as dotenv from "dotenv";
dotenv.config();

import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";
import { AllExceptionsFilter } from "src/configs/all-exceptions.filter";
import { SentryService } from "@ntegral/nestjs-sentry";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: false,
  });
  app.enableCors();
  app.setGlobalPrefix(process.env.APP_PREFIX);

  app.useGlobalFilters(new AllExceptionsFilter());

  if (process.env.NODE_ENV !== "production") {
    const openAPIConfig = new DocumentBuilder()
      .setTitle(`${process.env.APP_NAME} API`)
      .setDescription(`This api document only available for development only!`)
      .setVersion("1.0")
      .addBearerAuth({
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "Authorization",
        description: "Enter JWT token",
        in: "header",
      })
      .build();

    const document = SwaggerModule.createDocument(app, openAPIConfig);
    SwaggerModule.setup("api/docs", app, document);
  }

  app.useLogger(SentryService.SentryServiceInstance());

  await app.listen(process.env.APP_PORT);

  console.log(
    `[${process.env.APP_NAME}]: `,
    `SERVICE BACKEND RUNNING ON PORT ${process.env.APP_PORT}`
  );
}
bootstrap();
