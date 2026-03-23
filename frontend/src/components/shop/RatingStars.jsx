const RatingStars = ({ value = 0 }) => (
  <div className="flex items-center gap-1 text-sm text-amber-500">
    {Array.from({ length: 5 }).map((_, index) => (
      <span key={index}>{index < Math.round(value) ? "★" : "☆"}</span>
    ))}
  </div>
);

export default RatingStars;
