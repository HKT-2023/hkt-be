import { S3 } from "aws-sdk";
import { HttpException, HttpStatus } from "@nestjs/common";
import { FileErrorMessage } from "src/modules/file/file.const";
import { User } from "src/models/schemas/user.schema";

export class FileService {
  private s3: S3;
  private getS3Instance(): S3 {
    if (!this.s3) {
      this.s3 = new S3({
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
      });
    }
    return this.s3;
  }

  //===================================================================================================================/

  private async uploadFileToS3(fileName: string, buffer: Buffer) {
    try {
      return await this.getS3Instance()
        .upload({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          Body: buffer,
        })
        .promise()
        .catch((error) => {
          console.log(error);
          throw new HttpException(
            { message: FileErrorMessage.ServerUnableToUploadFile },
            HttpStatus.SERVICE_UNAVAILABLE
          );
        });
    } catch (error) {
      console.log(error);
    }
  }

  //===================================================================================================================/

  private static getFileName(user: User, file: any): string {
    const path = `${user._id}/`;
    const timestamp = Date.now();
    const fileName = path + timestamp + "-" + file.originalname;
    return fileName || "failed_get_file_name";
  }

  //===================================================================================================================/

  public async uploadFiles(
    user: any,
    files: any
  ): Promise<
    {
      order: number;
      name: string;
      link: string;
    }[]
  > {
    if (files) {
      try {
        const listFile = [];
        let fileIndex = 1;

        for (const file of files) {
          const fileName = FileService.getFileName(user, file);
          const uploadS3Response = await this.uploadFileToS3(
            fileName,
            file.buffer
          );

          if (uploadS3Response) {
            listFile.push({
              order: fileIndex,
              name: file.originalname,
              link: uploadS3Response.Location,
            });
          }
          fileIndex++;
        }

        return listFile;
      } catch (error) {
        console.log(error);
        throw new HttpException(
          { message: FileErrorMessage.ServerUnableToUploadFile },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }

    throw new HttpException(
      { message: FileErrorMessage.ServerUnableToUploadFile },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }
}
