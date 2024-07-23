import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { AuthLoginDto, AuthSignupDto } from "./dto/auth.dto";
import { AuthService } from "./auth.service";
import { JwtGuard } from "./guards/jwt.guards";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('signup')
  async signup(@Body() authDto: AuthSignupDto) {
    return this.authService.signup(authDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() authDto: AuthLoginDto) {
    return this.authService.login(authDto);
  }

  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @Get('payload')
  payload(@Req() req: any): any {
    return req.user;
  }
}
