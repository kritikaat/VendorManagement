import { EventEmitter } from 'events';
import { Logger } from '../helpers/logger.helper.js';

class AppEventEmitter extends EventEmitter {}

export const appEmitter = new AppEventEmitter();

export class EventListenerInit {
  /**
   * Registers global event listeners
   */
  public static init(): void {
    Logger.info('Initializing Application Event Listeners...');

    appEmitter.on('user:registered', (userData) => {
      Logger.info(`Event 'user:registered' received for user: ${userData.email}`);
      // Here you would trigger post-registration tasks, like sending a welcome email
    });

    appEmitter.on('error:critical', (err) => {
      Logger.error(`Critical event listener received error: ${err.message}`);
    });
  }
}
