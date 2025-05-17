import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import { useState } from "react";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
  });

  const {
    mutate,
    isPending: isPendingDeletion,
    isError: isErrorDeleting,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"], refetchType: "none" });
      navigate("/events");
    },
  });

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock title="Failed to load event" message={error.info?.message || "Failed to fetch event data, please try again later."} />
      </div>
    );
  }

  if (data) {
    const formattedDate = new Date(data.date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={() => setIsOpenDeleteModal(true)}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {isOpenDeleteModal && (
        <Modal onClose={() => setIsOpenDeleteModal(false)}>
          <h2>Are you sure?</h2>
          <p>Do you really want to delete this event? This action cannot be undone.</p>
          <div className="form-actions">
            {isPendingDeletion ? (
              <p>Deleting, please wait...</p>
            ) : (
              <>
                <button onClick={() => setIsOpenDeleteModal(false)} className="button-text">
                  Cancel
                </button>
                <button onClick={() => mutate({ id })} className="button">
                  Delete
                </button>
              </>
            )}
          </div>
          {isErrorDeleting && (
            <ErrorBlock title="Failed to delete event" message={deleteError.info?.message || "Failed to delete event, please try again later."} />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
