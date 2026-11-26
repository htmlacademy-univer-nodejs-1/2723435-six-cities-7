import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mime from 'mime-types';
import multer from 'multer';
import { nanoid } from 'nanoid';
import { HttpError } from '../http-error.js';
import { Middleware } from '../middleware.interface.js';

type UploadFileOptions = {
  allowedMimeTypes?: readonly string[];
  maxFileSize?: number;
  required?: boolean;
};

export class UploadFileMiddleware implements Middleware {
  private readonly upload: RequestHandler;
  private readonly required: boolean;

  constructor(uploadDirectory: string, fieldName: string, options: UploadFileOptions = {}) {
    const destination = resolve(uploadDirectory);
    mkdirSync(destination, { recursive: true });
    this.required = options.required ?? true;

    const storage = multer.diskStorage({
      destination,
      filename: (_request, file, callback) => {
        const detectedExtension = mime.extension(file.mimetype);
        if (!detectedExtension) {
          callback(new HttpError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, 'Unknown file type'), '');
          return;
        }
        const fileExtension = detectedExtension === 'jpeg' ? 'jpg' : detectedExtension;
        callback(null, `${nanoid()}.${fileExtension}`);
      },
    });

    this.upload = multer({
      storage,
      limits: options.maxFileSize ? { fileSize: options.maxFileSize } : undefined,
      fileFilter: (_request, file, callback) => {
        if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.mimetype)) {
          callback(new HttpError(StatusCodes.UNSUPPORTED_MEDIA_TYPE, 'Unsupported file type'));
          return;
        }
        callback(null, true);
      },
    }).single(fieldName);
  }

  public execute(request: Request, response: Response, next: NextFunction): void {
    this.upload(request, response, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }
      if (this.required && !request.file) {
        next(new HttpError(StatusCodes.BAD_REQUEST, 'File is required'));
        return;
      }
      next();
    });
  }
}
