
export class TickEvent extends Event {

  timestamp: DOMHighResTimeStamp | undefined;

  constructor(timestamp: DOMHighResTimeStamp) {
    super("tick");
    this.timestamp = timestamp;
  }
}