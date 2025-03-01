import { httpStatus } from "../config";
import { CustomError } from "./custom.error";

export class NotFoundError extends CustomError {
  constructor(message: string, reasonCode?: string) {
    super(message, httpStatus.NOT_FOUND, reasonCode);
  }
}
