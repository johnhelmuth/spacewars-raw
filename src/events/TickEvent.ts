
export class TickEvent extends Event {

  timestamp: DOMHighResTimeStamp;

  constructor(timestamp: DOMHighResTimeStamp) {
    super("tick");
    this.timestamp = timestamp;
  }

  clone() {
    return new TickEvent(this.timestamp);
  }
}