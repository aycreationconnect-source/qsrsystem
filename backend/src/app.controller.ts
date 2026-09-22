import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';
import { spawn } from 'child_process';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('init')
  async resetDatabase() {
    return await this.appService.resetDatabase();
  }

  @Post('open-terminal')
  async openTerminal(@Body() body: { mode?: string }) {
    const mode = body?.mode === 'table' ? 'table' : 'quick';
    const port = process.env.PORT || 3000;
    const terminalUrl = `http://localhost:${port}/pos?mode=${mode}`;

    const candidateBrowsers = [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    const browserExe = candidateBrowsers.find((p) => fs.existsSync(p));

    if (browserExe) {
      try {
        const child = spawn(browserExe, [`--app=${terminalUrl}`], {
          detached: true,
          stdio: 'ignore',
        });
        child.unref();
        return { success: true, method: 'app-window', url: terminalUrl };
      } catch (err: any) {
        return { success: false, error: err.message, url: terminalUrl };
      }
    }

    return { success: false, reason: 'browser_not_found', url: terminalUrl };
  }
}
