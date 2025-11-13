import { Controller, Get } from '@nestjs/common'

@Controller()
export class AppController {
  @Get()
  helloWorld() {
    return {
      message: 'Hello World!',
    }
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
