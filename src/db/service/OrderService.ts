import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { config } from '../../config';
import { Order } from '../entity/Order';
import { OrderCreationError } from '../error/OrderCreationError';

/**
 * Provides database operations for Order entities.
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getOrder(orderId: number): Promise<Order> {
    return this.orderRepository.findOneOrFail(orderId);
  }

  async getUnfinishedOrders(): Promise<Order[]> {
    this.logger.verbose('Retrieving unfinished orders from database');
    return this.orderRepository.find({ status: Not(config.finishedState) });
  }

  async createOrder(order: Order) {
    this.logger.verbose('Saving order #' + order.orderId + ' to database');
    try {
      return await this.orderRepository.save(order);
    } catch (error) {
      this.logger.error(
        'Saving order #' +
          order.orderId +
          ' to database failed: ' +
          error.message,
      );
      throw new OrderCreationError(order, error);
    }
  }

  async updateOrder(order: Order) {
    this.logger.verbose('Updating order #' + order.orderId + ' in database');
    return this.orderRepository.save(order);
  }
}
