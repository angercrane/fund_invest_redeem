import { httpStatus } from "../config";
import { CustomError } from "./custom.error";

export class DuplicateError extends CustomError {
  constructor(message: string, reasonCode?: string) {
    super(message, httpStatus.CONFLICT, reasonCode);
  }
}
