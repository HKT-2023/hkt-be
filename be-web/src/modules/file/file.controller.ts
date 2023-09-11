import {
  Controller,
  HttpStatus,
  Post,
  Request,
  UploadedFiles,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from "@nestjs/swagger";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { FileValidationPipe } from "src/modules/file/file.validator";
import { IResponseToClient } from "src/configs/response";
import { FileService } from "src/modules/file/file.service";
import { FileSuccessMessage } from "src/modules/file/file.const";

@Controller("file")
@ApiBearerAuth()
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Post("upload-files")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Api for upload file to S3, return the link of file",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @UseInterceptors(AnyFilesInterceptor())
  async uploadFile(
    @Request() request,
    @UploadedFiles(new FileValidationPipe()) file: Array<Express.Multer.File>
  ): Promise<IResponseToClient> {
    const data = await this.fileService.uploadFiles(request.user, file);
    return {
      message: FileSuccessMessage.FileUploadSuccessfully,
      data: data,
      statusCode: HttpStatus.CREATED,
    };
  }
}
