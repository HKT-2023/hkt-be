import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FileErrorMessage } from "src/modules/file/file.const";

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(files: any) {
    let totalFileSize = 0;
    const fileTypeAllow = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (files) {
      for (const file of files) {
        const isFileAcceptTable = fileTypeAllow.includes(file.mimetype);
        if (!isFileAcceptTable) {
          throw new HttpException(
            { message: FileErrorMessage.FileTypeNotAcceptTable },
            HttpStatus.BAD_REQUEST
          );
        }
        totalFileSize += file.size;
        if (totalFileSize >= Number(process.env.S3_FILE_SIZE_UPLOAD_ALLOW)) {
          throw new HttpException(
            { message: FileErrorMessage.FileToLarge },
            HttpStatus.BAD_REQUEST
          );
        }
      }
    }

    return files;
  }
}
