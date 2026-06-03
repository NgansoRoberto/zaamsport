// src/components/common/Card.jsx
 function Card({ image, title, description, badge }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
      {image && <img src={image} alt={title} className="w-full h-48 object-cover" />}
      <div className="p-4">
        {badge && <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mb-2">{badge}</span>}
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
export default Card