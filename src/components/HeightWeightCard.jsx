import React from "react";
// Removed 'import "./Cards.css";' to fix the compilation error.

// Helper function to safely get a value or return a fallback
const safeGet = (data, fallback = "N/A") => data ?? fallback;

/**
 * HeightWeightCard component displays key physical metrics (Height, BMI, Weight).
 * It is defensively coded to prevent crashes if 'rows' data is missing or incomplete.
 * @param {object} props
 * @param {Array<object>} props.rows - Array with exactly 3 expected objects: [Height, BMI, Weight].
 */
export default function HeightWeightCard({ rows }) {
  // Ensure rows is an array and check if it has the required data length
  if (!Array.isArray(rows) || rows.length < 3) {
    return (
      <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-100 flex items-center justify-center min-h-[150px]">
        <p className="text-gray-500 font-medium">
          No height/weight data available.
        </p>
      </div>
    );
  }

  // Define safe variables for readability and to prevent crashes
  // We use optional chaining here, even though we check length above, for extra safety on individual properties.
  const rowHeight = rows[0]; // Expected: {icon, label, value} (Height)
  const rowBMI = rows[1]; // Expected: {label, value} (BMI)
  const rowWeight = rows[2]; // Expected: {icon, label, value} (Weight)

  return (
    // Replaced custom CSS classes with Tailwind for self-contained styling
    <div className="p-6 bg-white shadow-xl rounded-xl border border-gray-100 divide-y divide-gray-200">
      {/* First section: Height and BMI comparison */}
      <div className="flex justify-between items-start pb-4">
        {/* Height Data (rows[0]) */}
        <div className="flex items-center space-x-4">
          <span className="text-3xl">{safeGet(rowHeight?.icon, "📏")}</span>
          <div>
            <div className="text-sm font-medium text-gray-500">
              {safeGet(rowHeight?.label, "Height")}
            </div>
            <div className="text-2xl font-extrabold text-blue-600">
              {safeGet(rowHeight?.value)}
            </div>
          </div>
        </div>

        {/* BMI Data (rows[1]) */}
        <div className="text-right pt-2">
          <div className="text-sm font-medium text-gray-500">
            {safeGet(rowBMI?.label, "BMI")}
          </div>
          <div className="text-2xl font-extrabold text-gray-800">
            {safeGet(rowBMI?.value)}
          </div>
        </div>
      </div>

      {/* Second section: Weight */}
      <div className="pt-4">
        <div className="flex items-center space-x-4">
          {/* Weight Data (rows[2]) */}
          <span className="text-3xl">{safeGet(rowWeight?.icon, "⚖️")}</span>
          <div>
            <div className="text-sm font-medium text-gray-500">
              {safeGet(rowWeight?.label, "Weight")}
            </div>
            <div className="text-2xl font-extrabold text-blue-600">
              {safeGet(rowWeight?.value)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
