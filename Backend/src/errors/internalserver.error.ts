import { httpStatus } from "../config";
import { CustomError } from "./custom.error";

export class InternalServerError extends CustomError {
  constructor(message: string, reasonCode?: string) {
    super(message, httpStatus.INTERNAL_SERVER_ERROR, reasonCode);
  }
}
