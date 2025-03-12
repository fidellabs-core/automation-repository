import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo(): object {
    return {
      name: 'Social Media API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}
