export async function fetchEvents(searchTerm) {
  const url = searchTerm ? `http://localhost:3000/events?search=${searchTerm}` : "http://localhost:3000/events";

  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
}
