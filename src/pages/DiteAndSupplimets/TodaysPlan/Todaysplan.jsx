import { useEffect, useState } from "react";
import { useTodayPlan } from "../../../Context/DiteDetails/DiteDetails";
import APIClient from "../../../api/Api";
import Header from "../../../components/Header/header";
import MealCard, {
  SupplementCard,
} from "../../../components/MeelCard/MeelCard";
import { usePetContext } from "../../../hooks/usePetContext";
import "./Todaysplan.css";
import Popup from "../../../components/pop-up/popup";
import LoadingScreen from "../../../components/LoadingScreen/LoadingScreen";

export const TodaysDitePlanSubNav = [
  {
    icon: "",
    label: "Today's Plan",
    to: "/diteandsupplements/todaysplan",
  },
  {
    icon: "",
    label: "Completion History",
    to: "/diteandsupplements/completionhistory",
  },
  {
    icon: "",
    label: "Breed Details",
    to: "/diteandsupplements/breedspec",
  },
];

export function TodaysPlan() {
  const {
    meals,
    supplements,
    completedMeals,
    markMealComplete,
    updateMeals,
    updateSupplements,
  } = useTodayPlan();
  const { selectedPet } = usePetContext();

  const [refreshingMealId, setRefreshingMealId] = useState(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [showMealNotFound, setShowMealNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!selectedPet?._id) {
      updateMeals([]);
      updateSupplements([]);
      return;
    }
    const fetchDietPlan = async () => {
      setIsLoadingPlan(true);
      try {
        const dietAPI = new APIClient(`/diets/pets/${selectedPet._id}`);
        const response = await dietAPI.get();
        const mappedMeals = Array.isArray(response.meals)
          ? response.meals.map((meal) => ({
              _id: meal._id,
              dietId: meal.dietId,
              mealType: meal.mealType,
              name: meal.name,
              calories: meal.calories,
              weight: meal.weight ? `${meal.weight}gm` : "",
              proteins: meal.proteins,
              carbs: meal.carbs,
              fats: meal.fats,
              image: meal.image,
            }))
          : [];
        updateMeals(mappedMeals);
        updateSupplements(
          Array.isArray(response.supplements) ? response.supplements : []
        );
      } catch (err) {
        updateMeals([]);
        updateSupplements([]);
      } finally {
        setIsLoadingPlan(false);
      }
    };
    fetchDietPlan();
  }, [selectedPet?._id]);

  const handleRefreshMeal = async (mealType, mealDietId, mealId) => {
    setRefreshingMealId(mealId);
    try {
      const currentMeal = meals.find((meal) => meal._id === mealId);
      if (!currentMeal) {
        setShowMealNotFound(true);
        return;
      }
      const refreshAPI = new APIClient(`/diets/${mealDietId}/meals/${mealId}`);
      const requestBody = {
        mealType: currentMeal.mealType,
        name: currentMeal.name,
        calories: currentMeal.calories,
        weight: parseInt(currentMeal.weight) || 0,
        proteins: currentMeal.proteins,
        carbs: currentMeal.carbs,
        fats: currentMeal.fats,
      };
      const refreshedMeal = await refreshAPI.put(requestBody);
      const mappedMeal = {
        _id: refreshedMeal._id || mealId,
        mealType: refreshedMeal.mealType || mealType,
        name: refreshedMeal.name || "",
        calories: refreshedMeal.calories || "",
        weight: refreshedMeal.weight ? `${refreshedMeal.weight}gm` : "",
        proteins: refreshedMeal.proteins,
        carbs: refreshedMeal.carbs,
        fats: refreshedMeal.fats,
        image: refreshedMeal.image || currentMeal.image,
        dietId: mealDietId,
      };
      updateMeals(
        meals.map((meal) => (meal._id === mealId ? mappedMeal : meal))
      );
    } catch (err) {
      setErrorMsg(
        `Failed to refresh meal: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setRefreshingMealId(null);
    }
  };

  return (
    <>
      <Header
        title="Today's Diet Plan"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={TodaysDitePlanSubNav}
      />
      {isLoadingPlan && <LoadingScreen message="Loading diet plan..." />}
      <main
        className="todaysplan-main body-main-div"
        style={isLoadingPlan ? { filter: "blur(2px)" } : {}}
      >
        <div className="todaysplan-meal-section">
          <h1>Generated Meals</h1>
          {isLoadingPlan ? (
            <></>
          ) : meals.length === 0 ? (
            <p>No meals have been planned yet for today.</p>
          ) : (
            meals.map((meal) => (
              <MealCard
                key={meal._id || meal.mealType}
                mealType={meal.mealType}
                calories={meal.calories}
                foodName={meal.name}
                weight={meal.weight}
                image={meal.image}
                isCompleted={!!completedMeals[meal.mealType]}
                onComplete={() => markMealComplete(meal.mealType)}
                onRefresh={() =>
                  handleRefreshMeal(meal.mealType, meal.dietId, meal._id)
                }
                isRefreshing={refreshingMealId === meal._id}
              />
            ))
          )}
        </div>
        <div className="todaysplan-supplement-section">
          <h2>Supplements</h2>
          {supplements.length === 0 ? (
            <p>No supplements recommended for today.</p>
          ) : (
            supplements.map((supplement, idx) => (
              <SupplementCard
                key={idx}
                name={supplement.name}
                description={supplement.description}
              />
            ))
          )}
        </div>
      </main>
      <Popup
        isOpen={showMealNotFound}
        onClose={() => setShowMealNotFound(false)}
        title="Meal not found"
        message="The requested meal was not found."
        type=""
      />
      <Popup
        isOpen={!!errorMsg}
        onClose={() => setErrorMsg("")}
        title="Error"
        message={errorMsg}
        type=""
      />
    </>
  );
}

export default TodaysPlan;
