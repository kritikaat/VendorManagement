import { Response } from 'express';

export interface CookieConfig {
  name: string;
  value: string;
  maxAgeInMs?: number;
  httpOnly?: boolean;
  secure?: boolean;
}

export class CookieFactory {
  /**
   * Sets a secure HTTP-only cookie on the response
   */
  public static setCookie(res: Response, config: CookieConfig): void {
    const isProd = process.env.NODE_ENV === 'production';
    
    res.cookie(config.name, config.value, {
      httpOnly: config.httpOnly ?? true,
      secure: config.secure ?? isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: config.maxAgeInMs ?? 24 * 60 * 60 * 1000, // Default 1 day
    });
  }

  /**
   * Clears a cookie by name
   */
  public static clearCookie(res: Response, name: string): void {
    res.clearCookie(name);
  }
}
