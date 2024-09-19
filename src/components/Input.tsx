export default function Input({ label, type, placeholder, onBlur, error }) {
  return (
    <>
      <label className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
        type={type}
        placeholder={placeholder}
        onBlur={onBlur}
      />
      <span className="relative mb-2 text-sm font-medium text-red-900">{error ?? ""}</span>
    </>
  );
}
