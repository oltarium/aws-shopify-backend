import {Body, Controller, Get, Param, Post, Req} from "@nestjs/common";
import {UsersService} from "./services";
import {AppRequest} from "../shared";
import {User} from "./models";

@Controller('users')
export class UsersController {
    constructor(
        private userService: UsersService,
    ) {
    }

    @Post('login')
    login(@Req() req: AppRequest, @Body() body: User) {
        return this.userService.login(body.username, body.password);
    }

    @Post('signup')
    signup(@Req() req: AppRequest, @Body() body: User) {
        return this.userService.signup(body.name, body.password, body.username);
    }
}