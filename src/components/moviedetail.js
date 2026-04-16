import React, { useEffect, useState } from 'react';
import { fetchMovie } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();

  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading);
  const error = useSelector(state => state.movie.error);

  const [reviewData, setReviewData] = useState({
    rating: "",
    review: ""
  });

  // FETCH MOVIE
  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  // HANDLE INPUT (FIXED)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setReviewData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // SUBMIT REVIEW (FIXED)
  const submitReview = async (e) => {
    e.preventDefault();

    if (!selectedMovie?._id) {
      alert("Movie not loaded yet");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${import.meta.env.REACT_APP_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({
          movieID: selectedMovie._id,
          rating: Number(reviewData.rating),
          review: reviewData.review
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to submit review");
      }

      setReviewData({ rating: "", review: "" });
      dispatch(fetchMovie(movieId));

    } catch (err) {
      alert("Review failed: " + err.message);
    }
  };

  // LOADING / ERROR STATES
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!selectedMovie) return <div>No movie data available</div>;

  return (
    <Card className="bg-dark text-dark p-4 rounded">

      {/* MOVIE IMAGE */}
      <Card.Body>
        <Image src={selectedMovie.imageUrl} thumbnail />
      </Card.Body>

      {/* TITLE + ACTORS + RATING */}
      <ListGroup>

        <ListGroupItem>
          <h3>{selectedMovie.title}</h3>
        </ListGroupItem>

        <ListGroupItem>
          {selectedMovie.actors?.map((actor, i) => (
            <p key={i}>{actor}</p>
          ))}
        </ListGroupItem>

        <ListGroupItem>
          <h4>
            <BsStarFill /> {selectedMovie.avgRating || "No ratings yet"}
          </h4>
        </ListGroupItem>

      </ListGroup>

      {/* REVIEWS */}
      <Card.Body className="bg-white mt-3 p-3 rounded">
        <h5>Reviews</h5>

        {selectedMovie.reviews?.length > 0 ? (
          selectedMovie.reviews.map((r, i) => (
            <p key={i}>
              <b>{r.username}</b> — {r.review} — <BsStarFill /> {r.rating}
            </p>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </Card.Body>

      {/* ADD REVIEW */}
      <Card.Body className="bg-light mt-3 p-3 rounded">
        <h5>Add Review</h5>

        <form onSubmit={submitReview}>

          <input
            type="number"
            name="rating"
            min="1"
            max="5"
            value={reviewData.rating}
            onChange={handleChange}
            className="form-control mb-2"
            placeholder="Rating (1-5)"
          />

          <textarea
            name="review"
            value={reviewData.review}
            onChange={handleChange}
            className="form-control mb-2"
            placeholder="Write your review..."
          />

          <button className="btn btn-primary" type="submit">
            Submit Review
          </button>

        </form>
      </Card.Body>

    </Card>
  );
};

export default MovieDetail;