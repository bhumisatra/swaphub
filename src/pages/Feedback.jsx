import React, { useState } from "react";
import "../styles/feedback.css";
import emailjs from "@emailjs/browser";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);


  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!rating || message.trim() === "") {
    alert("Please give rating and write feedback.");
    return;
  }

  try {

    await emailjs.send(
      "service_kbrygjh",      // your service id
      "template_hw2r2zs",     // your template id
      {
        rating: rating,
        category: category,
        message: message,
        anonymous: anonymous ? "Yes" : "No",
        date: new Date().toLocaleString(),
      },
      "afmx5di6xzwJuUeKK"  // paste public key
    );

    setSubmitted(true);
    setRating(0);
    setMessage("");

  } catch (error) {
    console.log(error);
    alert("Failed to send feedback 😢");
  }
};

  return (
    <div className="feedback-page">
      <h2>Give Your Feedback</h2>

      {submitted && (
        <div className="success-msg">
          Thank you for your feedback ❤️
        </div>
      )}

      <form onSubmit={handleSubmit} className="feedback-form">
        {/* Rating */}
        <div className="rating-section">
          <label>Rate Your Experience:</label>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= (hover || rating)
                    ? "star active"
                    : "star"
                }
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="field">
          <label>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>General</option>
            <option>Design</option>
            <option>Local Help</option>
            <option>Technical</option>
            <option>UI/UX</option>
            <option>Bug Report</option>
          </select>
        </div>

        {/* Message */}
        <div className="field">
          <label>Your Feedback:</label>
          <textarea
            rows="5"
            placeholder="Write your feedback here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Anonymous */}
        <div className="checkbox">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={() => setAnonymous(!anonymous)}
          />
          <label>Submit anonymously</label>
        </div>

        <button type="submit" className="submit-btn">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default Feedback;