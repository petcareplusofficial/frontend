import { useEffect, useState, useMemo } from "react";
import Header from "../../../components/Header/header";
import { TodaysDitePlanSubNav } from "../TodaysPlan/Todaysplan";
import MealCard from "../../../components/MeelCard/MeelCard";
import { useTodayPlan } from "../../../Context/DiteDetails/DiteDetails";
import { DietHistoryChart } from "../../../components/BarGraph/BarGraph";
import NutritionPieChart, {
  NutritionTotalsCard,
} from "../../../components/PieChart/PieChart";
import APIClient from "../../../api/Api";
import { usePetContext } from "../../../hooks/usePetContext";
import "./CompletionHistory.css";

export function CompletionHistory() {
  const { meals, completedMeals } = useTodayPlan();
  const { selectedPet } = usePetContext();
  const [historyData, setHistoryData] = useState([]);
  const [nutritionTotals, setNutritionTotals] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
  });

  const completed = useMemo(
    () => meals.filter((meal) => completedMeals[meal.mealType]),
    [meals, completedMeals]
  );

  useEffect(() => {
    if (!selectedPet?._id) return;

    const fetchHistory = async () => {
      try {
        const historyAPI = new APIClient(
          `/meals-history/pets/${selectedPet._id}?time=lastMonth`
        );
        const response = await historyAPI.get();
        setHistoryData(response);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, [selectedPet]);

  useEffect(() => {
    if (completed.length === 0) {
      setNutritionTotals({ calories: 0, carbs: 0, protein: 0, fat: 0 });
      return;
    }

    const totals = completed.reduce(
      (acc, meal) => ({
        calories: acc.calories + (parseInt(meal.calories) || 0),
        carbs: acc.carbs + (parseFloat(meal.carbs) || 0),
        protein: acc.protein + (parseFloat(meal.proteins) || 0),
        fat: acc.fat + (parseFloat(meal.fats) || 0),
      }),
      { calories: 0, carbs: 0, protein: 0, fat: 0 }
    );
    setNutritionTotals(totals);
  }, [completed]);

  const chartData = useMemo(() => {
    if (!historyData.length)
      return { labels: [], targetData: [], achievedData: [] };

    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last30Days.push(date);
    }

    const labels = last30Days.map((date) => {
      const month = date.toLocaleString("default", { month: "short" });
      const day = date.getDate();
      return `${month} ${day}`;
    });

    const achievedData = last30Days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const dayMeals = historyData.filter((meal) => {
        const mealDate = new Date(meal.consumedAt);
        return mealDate >= date && mealDate < nextDay;
      });

      return dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
    });

    const targetCalories = 800;
    const targetData = new Array(30).fill(targetCalories);

    return { labels, targetData, achievedData };
  }, [historyData]);

  return (
    <>
      <Header
        title="Completion History"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={TodaysDitePlanSubNav}
      />

      <main className="completionhistory-main body-main-div">
        <div className="CompletionHistory-Main-Container">
          <div className="CompletionHistory-Main-FirstChild">
            <h1>Completed Meals Today</h1>
            {completed.length === 0 ? (
              <p>No meals completed today yet.</p>
            ) : (
              completed.map((meal) => (
                <MealCard
                  key={meal._id || meal.mealType}
                  mealType={meal.mealType}
                  calories={meal.calories}
                  foodName={meal.name}
                  weight={meal.weight ? `${meal.weight}` : ""}
                  image={meal.image}
                  isRefreshing={false}
                />
              ))
            )}
            <div>
              <h4>Overview of last 30 days</h4>
              <DietHistoryChart
                labels={chartData.labels}
                targetData={chartData.targetData}
                achievedData={chartData.achievedData}
              />
            </div>
          </div>
          <div className="CompletionHistory-Main-SecondChild">
            <div className="CompletionHistory-Main-SecondChild-sub-div">
              <h1>Nutrition Summary (Today)</h1>
              <NutritionPieChart
                carbs={nutritionTotals.carbs}
                protein={nutritionTotals.protein}
                fat={nutritionTotals.fat}
              />
              <NutritionTotalsCard
                calories={nutritionTotals.calories}
                carbs={nutritionTotals.carbs}
                protein={nutritionTotals.protein}
                fat={nutritionTotals.fat}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CompletionHistory;
