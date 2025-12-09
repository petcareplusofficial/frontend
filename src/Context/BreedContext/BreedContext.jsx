import { createContext, useContext } from "react";
import { useState, useEffect } from "react";
import { usePetContext } from "../../hooks/usePetContext";
import Ollama from "../../ollama/ollama";
import APIClient from "../../api/Api";
const BuddyBreedContext = createContext();

export function BuddyBreedProvider({ children }) {
  const { selectedPet } = usePetContext();
  const [chartData, setChartData] = useState({
    petBMIs: [],
    breedBMIs: [],
    months: [],
  });
  const [recommendations, setRecommendations] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedPet || !selectedPet._id || !selectedPet.breedId) return;
    const fetchRollingBMIs = async () => {
      setLoading(true);
      const latestApi = new APIClient(
        `/reports/pets/${selectedPet._id}/latest`
      );
      const latestReport = await latestApi.get();
      if (!latestReport || !latestReport.month || !latestReport.year) {
        setLoading(false);
        return;
      }
      const MONTHS = [
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
      const shortMonth = (month) => month.slice(0, 3);
      const lookback = 12;
      let baseMonthIdx = MONTHS.indexOf(latestReport.month);
      let baseYear = latestReport.year;

      let forwardMonthIdx = baseMonthIdx + 1;
      let forwardYear = baseYear;
      if (forwardMonthIdx > 11) {
        forwardMonthIdx = 0;
        forwardYear += 1;
      }
      const combos = [];
      for (let i = lookback - 1; i >= 0; --i) {
        let mIdx = forwardMonthIdx - i,
          year = forwardYear;
        while (mIdx < 0) {
          mIdx += 12;
          year -= 1;
        }
        combos.push({
          month: MONTHS[mIdx],
          shortMonth: shortMonth(MONTHS[mIdx]),
          year,
        });
      }

      const requests = combos.map(({ month, year }) =>
        new APIClient(
          `/reports/pets/${selectedPet._id}?month=${month}&year=${year}`
        ).get()
      );
      const responses = await Promise.allSettled(requests);
      console.log("######BMI Report Responses:", responses);
      const petBMIs = combos.map((_, idx) => {
        const data =
          responses[idx].status === "fulfilled" ? responses[idx].value : null;
        const report =
          Array.isArray(data) && data.length
            ? data.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              )[0]
            : data;
        return report && typeof report.bmi !== "undefined" ? report.bmi : null;
      });
      const breedBMIs = combos.map(() => selectedPet.breedId.bmi ?? null);
      console.log("######Combos:", combos);
      console.log("######Pet BMIs:", petBMIs);
      console.log("######Breed BMIs:", breedBMIs);
      const monthsArr = combos.map((c) => c.shortMonth);
      console.log("######Months:", monthsArr);
      setChartData({
        petBMIs,
        breedBMIs,
        months: monthsArr,
      });
      const mealHistory = new APIClient(
        `/meals-history/pets/${selectedPet._id}?time=lastMonth`
      );
      const mealsHistoryResponse = await mealHistory.get();
      const diet = new APIClient(`/diets/pets/${selectedPet._id}`);
      const dietResponse = await diet.get();
      const reportsApi = new APIClient(
        `/reports/pets/${selectedPet._id}?year=2025`
      );
      const reportsResponse = await reportsApi.get();
      const ollamaEngine = new Ollama(
        selectedPet,
        mealsHistoryResponse,
        dietResponse,
        reportsResponse
      );
      const ollamaResponse = await ollamaEngine.ResponseReccomendations(
        "Generate insights and reccomendations for the pet"
      );
      setRecommendations([...ollamaResponse]);
      setLoading(false);
    };
    fetchRollingBMIs();
  }, [selectedPet]);
  return (
    <BuddyBreedContext.Provider
      value={{
        chartData,
        recommendations,
        loading,
      }}
    >
      {children}
    </BuddyBreedContext.Provider>
  );
}

export function useBuddyBreed() {
  return useContext(BuddyBreedContext);
}
