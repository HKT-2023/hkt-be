import { Module } from "@nestjs/common";
import { FileController } from "src/modules/file/file.controller";
import { FileService } from "src/modules/file/file.service";

@Module({
  imports: [],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
