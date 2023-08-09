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
        error: getFlowserError(exception),
      })
    );
  }
}

function getFlowserError(exception: HttpException): FlowserError {
  return {
    name: exception.name,
    message: exception.message,
    description: getDescription(exception),
  };
}

function getDescription(exception: HttpException): string {
  const response = exception.getResponse() as string | Record<string, string>;

  if (typeof response === "object" && "error" in response) {
    return response.error;
  }

  if (typeof response === "string") {
    return response;
  }

  return "";
}
