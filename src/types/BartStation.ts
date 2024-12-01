export default interface BartStation {
  name: string;
  code: string;
  address: string;
  entries: string; // Entries are in string format, we need to parse them to numbers
  exits: string; // Exits are in string format, we need to parse them to numbers
  coordinates: [number, number]; // [longitude, latitude]
}
