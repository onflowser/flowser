type ParsedEventId = {
  // Value is `undefined` if event is a core flow event.
  // https://developers.flow.com/cadence/language/core-events
  contractAddress: undefined | string;
  contractName: undefined | string;
  eventType: string;
};

export class EventUtils {
  static parseFullEventType(eventId: string): ParsedEventId {
    const parts = eventId.split(".");

    if (eventId.startsWith("flow.")) {
      return {
        contractAddress: undefined,
        contractName: undefined,
        eventType: parts[1],
      };
    } else {
      return {
        contractAddress: parts[1],
        contractName: parts[2],
        eventType: parts[3],
      };
    }
  }
}
