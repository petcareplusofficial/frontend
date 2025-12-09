// This component assumes it is being passed data for a SINGLE allergy item
export default function AllergiesCard({ type, severity, symptoms, date }) {
  // Define a background color based on severity (using mock logic)
  let severityClass = "text-green-600 bg-green-100";
  if (severity?.toLowerCase() === "moderate") {
    severityClass = "text-yellow-600 bg-yellow-100";
  } else if (
    severity?.toLowerCase() === "high" ||
    severity?.toLowerCase() === "severe"
  ) {
    severityClass = "text-red-600 bg-red-100";
  }

  // Single card container for the allergy item
  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 transition duration-300 hover:shadow-xl">
      {/* Header Row: Type and Severity Badge */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-3xl">🖐️</span>
          <h3 className="text-lg font-bold text-gray-800">
            {type || "Unknown Allergy"}
          </h3>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${severityClass}`}
        >
          {severity || "N/A"}
        </span>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
        {/* Symptoms */}
        <div className="col-span-2">
          <div className="flex items-center text-gray-600">
            <span className="text-base mr-2">💊</span>
            <span className="font-semibold">Symptoms:</span>
          </div>
          <p className="text-gray-800 mt-1 pl-6 break-words">
            {symptoms || "None recorded"}
          </p>
        </div>

        {/* Date Recorded */}
        <div>
          <div className="flex items-center text-gray-600">
            <span className="text-base mr-2">📅</span>
            <span className="font-semibold">Date:</span>
          </div>
          <p className="text-gray-800 mt-1 pl-6">{date || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
