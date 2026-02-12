import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello() {
        return { message: 'CursApp API v1 Running' };
    }
}
