import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import { ErrorResponse, FlowserError } from "@flowser/shared";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).json(
      ErrorResponse.toJSON({
        error: FlowserError.fromPartial({
          name: exception.name,
          message: exception.message,
        }),
      })
    );
  }
}
