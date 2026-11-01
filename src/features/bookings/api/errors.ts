/** Thrown by getTrip when there's no such trip (deleted, or a bad link). */
export class TripNotFoundError extends Error {
  constructor(id: string) {
    super(`No trip with id "${id}"`)
    this.name = "TripNotFoundError"
  }
}
