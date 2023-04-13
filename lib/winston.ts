import {v4 as uuidv4} from 'uuid';
import {StringHashMap} from '@icancode/base';
import {
  Logger as Winston,
  format,
  createLogger,
  transports,
} from 'winston';
import {Logger} from '@icancode/logger';

/**
 * WinstonLogger
 */
export default class WinstonLogger implements Logger {
  private engine: Winston;
  private metadata: StringHashMap;
  private timestamp: number;

  /**
   * Constructor
   * @param {string} name
   * @param {StringHashMap=} metadata
   */
  constructor(name: string, metadata: StringHashMap = {}) {
    this.metadata = Object.assign({}, {
      TraceID: uuidv4(),
    }, metadata);
    this.timestamp = Date.now();

    /* eslint-disable max-len, no-invalid-this */
    this.engine = createLogger({
      format: format.combine(
          format.printf(({level, message}) => {
            const now = Date.now();
            let duration: number = 0;
            if (this.timestamp !== undefined) {
              duration = now - this.timestamp;
            }
            this.timestamp = now;
            return JSON.stringify(Object.assign({}, {
              Timestamp: (new Date()).toISOString(),
              Level: level,
              Logger: name,
              Duration: duration,
              Message: message,
            }, this.metadata));
          }),
      ),
      transports: new transports.Console({
        level: process.env.LOGGER_LEVEL || (process.env.NODE_ENV === 'local' ? 'debug' : 'info'),
      }),
    });
    /* eslint-enable max-len, no-invalid-this */
  }

  /**
   * Create a logger instance
   * @param {string} name represents name of Logger
   * @param {StringHashMap} metadata additional string key-value pairs
   * @return {Logger} logger instance
   */
  static create(name: string, metadata?: StringHashMap): Logger {
    return new WinstonLogger(name, metadata);
  }

  /**
   * Logs debug message
   * @param {*} message
   */
  debug(message: any) {
    this.engine.debug(message);
  }

  /**
   * Logs info message
   * @param {*} message
   */
  info(message: any) {
    this.engine.info(message);
  }

  /**
   * Logs warn message
   * @param {*} message
   */
  warn(message: any) {
    this.engine.warn(message);
  }

  /**
   * Logs error message
   * @param {*} message
   */
  error(message: any) {
    this.engine.error(message);
  }

  /**
   * Set meta
   * @param {StringHashMap} metadata
   * @param {boolean=} merge
   * @return {Logger}
   */
  with(metadata: StringHashMap, merge?: boolean): Logger {
    if (merge) {
      this.metadata = Object.assign({}, this.metadata, metadata);
    } else {
      this.metadata = metadata;
    }

    return this;
  }

  /**
   * Get a value of metadata
   * @param {string} key
   * @return {string}
   */
  get(key: string): string {
    return this.metadata[key] || '';
  }

  /**
   * Set a metadata key=value
   * @param {string} key
   * @param {string} value
   * @return {Logger}
   */
  set(key: string, value: string): Logger {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Flush the logs
   */
  flush() {
    // do nothing
  }
}
