declare global {
  namespace Express {
    interface Request {
      userId?: string;
      deviceId?: string;
      tokenIssuedAt?: string;
    }
  }
}

export {};