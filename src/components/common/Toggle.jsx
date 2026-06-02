 function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm cursor-pointer">
      <div
        className={`w-8 h-4 rounded-full transition ${value ? "bg-red-600" : "bg-gray-300"}`}
        onClick={() => onChange(!value)}
      >
        <div
          className={`w-3 h-3 bg-white rounded-full transition-transform duration-200 ${
            value ? "translate-x-4" : "translate-x-0.5"
          } mt-0.5`}
        />
      </div>
      <span>{label}</span>
    </label>
  );
}
export default Toggle