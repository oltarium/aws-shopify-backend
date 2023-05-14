import {Body, Controller, Delete, Get, Param, Post, Put, Query} from "@nestjs/common";
import {OrderService} from "./services";

@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) {
    }

    @Get()
    getAll(@Query('userId') userId: number): Promise<any> {
        return this.orderService.getAll(userId);
    }

    @Get(':id')
    getById(@Param('id') id: string): Promise<any> {
        return this.orderService.findById(+id);
    }

    @Put()
    create(@Body() body: any): Promise<any> {
        console.log(body)
        return this.orderService.create(body);
    }

    @Post()
    update(@Body() body: any,): Promise<any> {
        return this.orderService.update(body.id, body);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<any> {
        return this.orderService.deleteOrder(+id);
    }
}
