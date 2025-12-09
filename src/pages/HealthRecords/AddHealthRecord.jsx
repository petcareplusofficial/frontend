import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";
import Header from "../../components/Header/header";
import { HealthReportsSubNav } from "./HealthRecords";
import DatePicker from "../../components/Calendar/DatePicker";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
import "./AddHealthRecord.css";
import BackArrow from "../../icon/back-button.svg";
import CalendarIcon from "../../icon/Calendar.svg";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function groupIntoLines(items, yTol = 2) {
  const linesMap = new Map();
  for (const it of items) {
    const y = it.transform?.[5] ?? 0;
    let key = null;
    for (const k of linesMap.keys()) {
      if (Math.abs(k - y) <= yTol) {
        key = k;
        break;
      }
    }
    if (key === null) key = y;
    if (!linesMap.has(key)) linesMap.set(key, []);
    linesMap.get(key).push(it);
  }
  const lines = [...linesMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, arr]) =>
      arr.sort((a, b) => (a.transform?.[4] ?? 0) - (b.transform?.[4] ?? 0))
    );
  return lines;
}

function joinLine(items, gapFactor = 0.3) {
  let out = "";
  for (let i = 0; i < items.length; i++) {
    const cur = items[i];
    out += cur.str;
    const next = items[i + 1];
    if (!next) break;
    const curX = cur.transform?.[4] ?? 0;
    const nextX = next.transform?.[4] ?? 0;
    const curWidth = cur.width ?? 0;
    const gap = nextX - (curX + curWidth);
    const shouldSpace = gap > curWidth * gapFactor;
    if (shouldSpace) out += " ";
  }
  return out;
}

function rebuildText(textContent) {
  const hasAnyEOL = textContent.items?.some((it) => it.hasEOL);
  if (hasAnyEOL) {
    return textContent.items
      .map((it) => it.str + (it.hasEOL ? "\n" : " "))
      .join("");
  }
  const lines = groupIntoLines(textContent.items || [], 2);
  return lines.map((line) => joinLine(line)).join("\n");
}

function buildExtractField(text) {
  return (keyPattern) => {
    // Match the key, then capture everything until we hit a newline
    const re = new RegExp(
      `${keyPattern}[:\\s]+(.+?)(?=\\n|$)`,
      "i"
    );
    const m = text.match(re);
    return m ? m[1].trim() : "";
  };
}

function normalizeDateString(s) {
  return s.replace(/\s+/g, "").replace(/\//g, "-");
}

export function AddHealthRecord() {
  const navigate = useNavigate();
  const { selectedPet } = usePetContext();
  const [formData, setFormData] = useState({
    respiratoryRate: "",
    heartRate: "",
    bloodPressure: "",
    vaccinatedType: "",
    vaccinatedDate: "",
    vaccinatedPlace: "",
    height: "",
    weight: "",
    bodyMassIndex: "",
    allergyType: "",
    symptoms: "",
    severity: "",
    consultedDate: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [loading, setLoading] = useState(false);
  const bmiEditRef = useRef(false);
  const isParsedRef = useRef(false);

  useEffect(() => {
    // Only auto-calculate BMI if not from PDF parsing and user hasn't manually edited BMI
    if (formData.height && formData.weight && !bmiEditRef.current && !isParsedRef.current) {
      const heightInMeters = parseFloat(formData.height) / 100;
      const weightInKg = parseFloat(formData.weight);
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmi = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData((prev) => ({ ...prev, bodyMassIndex: bmi }));
      }
    }
  }, [formData.height, formData.weight]);

  const handleInputChange = (field, value) => {
    if (field === "height" || field === "weight") {
      bmiEditRef.current = false;
      isParsedRef.current = false;
    }
    if (field === "bodyMassIndex") {
      bmiEditRef.current = true;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
        await parsePDF(file);
      } else {
        setParseError("Please upload a PDF file");
      }
    }
  };
  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        await parsePDF(file);
      } else {
        setParseError("Please upload a PDF file");
      }
    }
  };
  const parsePDF = async (file) => {
    setIsProcessing(true);
    setParseError("");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          disableCombineTextItems: true,
        });
        const pageText = rebuildText(textContent);
        fullText += pageText + "\n";
      }
      parseTextAndFillForm(fullText);
      setIsProcessing(false);
    } catch (error) {
      setParseError("Failed to parse PDF. Please fill the form manually.");
      setIsProcessing(false);
    }
  };
  const parseTextAndFillForm = (text) => {
    const extractField = buildExtractField(text);
    const extractNumber = (pattern) => {
      const regex = new RegExp(pattern, "i");
      const match = text.match(regex);
      if (match) {
        // Extract just the number, ignoring units like cm, kg, etc.
        const numMatch = match[1].match(/[\d.]+/);
        return numMatch ? numMatch[0] : "";
      }
      return "";
    };
    
    const respiratory = extractNumber("respiratory[_\\s]?rate[:\\s]*([\\d.]+)");
    const heart = extractNumber("heart[_\\s]?rate[:\\s]*([\\d.]+)");
    
    // Blood pressure can be single number or format like "110/70"
    const bloodMatch = text.match(/blood[_\s]?pressure[:\s]*([\d.]+(?:\/[\d.]+)?)/i);
    const blood = bloodMatch ? bloodMatch[1] : "";
    
    const height = extractNumber("height[:\\s]*([\\d.]+)");
    const weight = extractNumber("weight[:\\s]*([\\d.]+)");
    const bmi = extractNumber("bmi[:\\s]*([\\d.]+)");
    const vacType = extractField("vaccinated[_\\s]?type");
    const vacPlace = extractField("vaccinated[_\\s]?place");
    const vacDateRaw = extractField("vaccinated[_\\s]?date");
    const allergy = extractField("allergy[_\\s]?type");
    const symptoms = extractField("symptoms");
    const severity = extractField("severity");
    const consultedDateRaw = extractField("consulted[_\\s]?date");
    
    const datePattern =
      /\b(\d{4}\s*[-/]\s*\d{2}\s*[-/]\s*\d{2}|\d{2}\s*[-/]\s*\d{2}\s*[-/]\s*\d{4})\b/gi;
    const dates = (text.match(datePattern) || []).map(normalizeDateString);
    const updates = {};
    if (respiratory) updates.respiratoryRate = respiratory;
    if (heart) updates.heartRate = heart;
    if (blood) updates.bloodPressure = blood;
    if (height) updates.height = height;
    if (weight) updates.weight = weight;
    if (bmi) {
      updates.bodyMassIndex = bmi;
      isParsedRef.current = true; // Mark that BMI came from PDF
    }
    if (vacType) updates.vaccinatedType = vacType;
    if (vacPlace) updates.vaccinatedPlace = vacPlace;
    if (allergy) updates.allergyType = allergy;
    if (symptoms) updates.symptoms = symptoms;
    if (severity) updates.severity = severity;
    if (vacDateRaw) {
      updates.vaccinatedDate = normalizeDateString(vacDateRaw);
    } else if (dates.length > 0) {
      updates.vaccinatedDate = dates[0];
    }
    
    if (consultedDateRaw) {
      updates.consultedDate = normalizeDateString(consultedDateRaw);
    } else if (!updates.vaccinatedDate && dates.length > 0) {
      updates.consultedDate = dates[1];
    } else if (dates.length > 1) {
      updates.consultedDate = dates[1];
    }
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    bmiEditRef.current = false;
    if (Object.keys(updates).length === 0) {
      setParseError("Could not extract data from PDF. Please fill manually.");
    }
  };
  const handleGenerate = () => {
    document.getElementById("pdf-input").click();
  };
  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!selectedPet || !selectedPet._id) {
        setParseError("No pet selected. Please select a pet first.");
        setLoading(false);
        return;
      }
      if (!formData.height || !formData.weight || !formData.vaccinatedType) {
        setParseError(
          "Please fill in all required fields: Height, Weight, and Vaccination Type"
        );
        setLoading(false);
        return;
      }
      if (!formData.vaccinatedDate) {
        setParseError("Vaccinated Date is required.");
        setLoading(false);
        return;
      }
      const vaccDate = new Date(formData.vaccinatedDate);
      if (isNaN(vaccDate.getTime())) {
        setParseError("Vaccinated Date is invalid.");
        setLoading(false);
        return;
      }
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const vaccineMonth = monthNames[vaccDate.getMonth()];
      const vaccineDay = vaccDate.getDate();
      const reportData = {
        petId: selectedPet._id,
        height: parseFloat(formData.height) || 0,
        weight: parseFloat(formData.weight) || 0,
        month: vaccineMonth,
        year: vaccDate.getFullYear(),
        bmi: parseFloat(formData.bodyMassIndex) || 0,
        respiratoryRate: parseFloat(formData.respiratoryRate) || 0,
        heartRate: parseFloat(formData.heartRate) || 0,
        bloodPressure: parseFloat(formData.bloodPressure) || 0,
        type: formData.vaccinatedType || "general",
        vaccineMonth,
        vaccineDay,
        place:
          formData.vaccinatedPlace && formData.vaccinatedPlace.trim()
            ? formData.vaccinatedPlace.trim()
            : "Unknown",
      };
      const reportsAPI = new APIClient("/reports");
      await reportsAPI.post(reportData);
      if (formData.allergyType || formData.symptoms || formData.severity) {
        try {
          const allergyData = {
            petId: selectedPet._id,
            food: formData.allergyType || "Unknown",
            symptoms: formData.symptoms || "Not specified",
            severity: formData.severity
              ? formData.severity.toLowerCase()
              : "mild",
            notes: formData.consultedDate
              ? `Consulted on: ${new Date(
                  formData.consultedDate
                ).toLocaleDateString()}`
              : "",
          };
          const allergiesAPI = new APIClient("/allergies");
          await allergiesAPI.post(allergyData);
        } catch {}
      }
      navigate("/healthreports/healthrecords");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save report";
      setParseError(`Failed to save report: ${errorMessage}`);
      if (error.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    navigate("/healthreports/healthrecords");
  };
  return (
    <>
      <Header
        title="Pet Health"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={HealthReportsSubNav}
      />
      {loading && <LoadingScreen message="Saving health record..." />}
      <main
        className="add-health-record-page body-main-div"
        style={loading ? { filter: "blur(2px)" } : {}}
      >
        <button className="back-nav-button" onClick={handleCancel}>
          <img src={BackArrow} alt="Back" />
          Back
        </button>
        <div className="pdf-upload-area">
          <div
            className={`pdf-dropzone-area ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="pdf-input"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            {pdfFile ? (
              <div className="pdf-file-info">
                <p className="pdf-file-name">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      fill="#1E6F78"
                    />
                  </svg>
                  {pdfFile.name}
                </p>
                {isProcessing && (
                  <p className="processing-text">Processing PDF...</p>
                )}
              </div>
            ) : (
              <p className="dropzone-text">Drag and drop your PDF here</p>
            )}
          </div>
          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Upload"}
          </button>
        </div>
        {parseError && (
          <div className="parse-error-message">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z"
                fill="#c62828"
              />
            </svg>
            {parseError}
          </div>
        )}
        <div className="health-form-grid">
          <div className="form-card medical-card">
            <h3 className="form-card-title">Medical</h3>
            <div className="form-field">
              <label>Respiratory Rate</label>
              <input
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) =>
                  handleInputChange("respiratoryRate", e.target.value)
                }
                placeholder="80"
              />
            </div>
            <div className="form-field">
              <label>Heart Rate</label>
              <input
                type="number"
                value={formData.heartRate}
                onChange={(e) => handleInputChange("heartRate", e.target.value)}
                placeholder="90"
              />
            </div>
            <div className="form-field">
              <label>Blood Pressure</label>
              <input
                type="text"
                value={formData.bloodPressure}
                onChange={(e) =>
                  handleInputChange("bloodPressure", e.target.value)
                }
                placeholder="110/70"
              />
            </div>
          </div>
          <div className="form-card vaccination-card">
            <h3 className="form-card-title">Vaccination</h3>
            <div className="form-field">
              <label>Vaccinated Type</label>
              <input
                type="text"
                value={formData.vaccinatedType}
                onChange={(e) =>
                  handleInputChange("vaccinatedType", e.target.value)
                }
                placeholder="Haptics"
              />
            </div>
            <div className="form-field">
              <DatePicker
                label="Vaccinated Date"
                value={formData.vaccinatedDate}
                onChange={(date) => handleInputChange("vaccinatedDate", date)}
                placeholder="yyyy-mm-dd"
              />
            </div>
            <div className="form-field">
              <label>Vaccinated Place</label>
              <input
                type="text"
                value={formData.vaccinatedPlace}
                onChange={(e) =>
                  handleInputChange("vaccinatedPlace", e.target.value)
                }
                placeholder="Vancouver"
              />
            </div>
          </div>
          <div className="form-card allergy-card">
            <h3 className="form-card-title">Allergy</h3>
            <div className="form-field">
              <label>Allergy Type</label>
              <input
                type="text"
                value={formData.allergyType}
                onChange={(e) =>
                  handleInputChange("allergyType", e.target.value)
                }
                placeholder="Shrimps"
              />
            </div>
            <div className="form-field">
              <label>Symptoms</label>
              <input
                type="text"
                value={formData.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                placeholder="Cough"
              />
            </div>
            <div className="form-field">
              <label>Severity</label>
              <input
                type="text"
                value={formData.severity}
                onChange={(e) => handleInputChange("severity", e.target.value)}
                placeholder="Moderate"
              />
            </div>
            <div className="form-field">
              <DatePicker
                label="Consulted Date"
                value={formData.consultedDate}
                onChange={(date) => handleInputChange("consultedDate", date)}
                placeholder="yyyy-mm-dd"
              />
            </div>
          </div>
          <div className="form-card notes-card">
            <h3 className="form-card-title">Notes</h3>
            <div className="form-field">
              <label>Height</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange("height", e.target.value)}
                placeholder="34 cm"
              />
            </div>
            <div className="form-field">
              <label>Weight</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="56 kg"
              />
            </div>
            <div className="form-field">
              <label>Body Mass Index</label>
              <input
                type="text"
                value={formData.bodyMassIndex}
                onChange={(e) =>
                  handleInputChange("bodyMassIndex", e.target.value)
                }
                placeholder="24.9"
              />
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </main>
    </>
  );
}

export default AddHealthRecord;