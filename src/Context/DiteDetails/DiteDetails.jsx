import APIClient from "../../api/Api";
import { usePetContext } from "../../hooks/usePetContext";
import React, { createContext, useContext, useReducer, useEffect } from "react";

const MARK_COMPLETE = "MARK_COMPLETE";
const SET_MEALS = "SET_MEALS";
const SET_SUPPLEMENTS = "SET_SUPPLEMENTS";
const SET_COMPLETED_FROM_HISTORY = "SET_COMPLETED_FROM_HISTORY";

export const initialMeals = [];

const initialState = {
  meals: initialMeals,
  supplements: [],
  completedMeals: {},
};

function todayPlanReducer(state, action) {
  switch (action.type) {
    case MARK_COMPLETE:
      return {
        ...state,
        completedMeals: {
          ...state.completedMeals,
          [action.mealType]: true,
        },
      };
    case SET_MEALS:
      return {
        ...state,
        meals: action.meals,
      };
    case SET_SUPPLEMENTS:
      return {
        ...state,
        supplements: action.supplements,
      };
    case SET_COMPLETED_FROM_HISTORY:
      return {
        ...state,
        completedMeals: action.completedMeals,
      };
    default:
      return state;
  }
}

const TodayPlanContext = createContext();

export function TodayPlanProvider({ children }) {
  const [state, dispatch] = useReducer(todayPlanReducer, initialState);
  const { selectedPet } = usePetContext();

  useEffect(() => {
    if (!selectedPet || !selectedPet._id) return;

    const fetchDiet = async () => {
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

        dispatch({ type: SET_MEALS, meals: mappedMeals });
        dispatch({
          type: SET_SUPPLEMENTS,
          supplements: Array.isArray(response.supplements)
            ? response.supplements
            : [],
        });

        try {
          const now = new Date();
          const startOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          ).toISOString();
          const endOfDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            23,
            59,
            59
          ).toISOString();

          const historyAPI = new APIClient(
            `/meals-history/pets/${selectedPet._id}?time=lastMonth`
          );
          const historyResponse = await historyAPI.get();

          const completedMealsMap = {};
          if (Array.isArray(historyResponse)) {
            const today = historyResponse.filter((history) => {
              const consumedDate = new Date(history.consumedAt);
              return (
                consumedDate >= new Date(startOfDay) &&
                consumedDate <= new Date(endOfDay)
              );
            });

            today.forEach((history) => {
              completedMealsMap[history.mealType] = true;
            });
          }

          dispatch({
            type: SET_COMPLETED_FROM_HISTORY,
            completedMeals: completedMealsMap,
          });
        } catch (error) {
          console.log("No history found");
        }
      } catch (error) {
        console.error("Error fetching diet:", error);
        dispatch({ type: SET_MEALS, meals: [] });
        dispatch({ type: SET_SUPPLEMENTS, supplements: [] });
      }
    };

    fetchDiet();
  }, [selectedPet]);

  const markMealComplete = async (mealType) => {
    const meal = state.meals.find((m) => m.mealType === mealType);
    if (!meal || !selectedPet) return;

    try {
      const historyAPI = new APIClient("/meals-history");
      await historyAPI.post({
        petId: selectedPet._id,
        mealType: meal.mealType,
        name: meal.name,
        calories: meal.calories,
        weight: String(parseInt(meal.weight) || 0),
        proteins: meal.proteins,
        carbs: meal.carbs,
        fats: meal.fats,
      });

      dispatch({ type: MARK_COMPLETE, mealType });
    } catch (error) {
      console.error("Error marking meal complete:", error);
      alert("Failed to mark meal as complete");
    }
  };

  const updateMeals = (meals) => {
    dispatch({ type: SET_MEALS, meals });
  };

  const updateSupplements = (supplements) => {
    dispatch({ type: SET_SUPPLEMENTS, supplements });
  };

  return (
    <TodayPlanContext.Provider
      value={{
        meals: state.meals,
        supplements: state.supplements,
        completedMeals: state.completedMeals,
        markMealComplete,
        updateMeals,
        updateSupplements,
      }}
    >
      {children}
    </TodayPlanContext.Provider>
  );
}

export function useTodayPlan() {
  const context = useContext(TodayPlanContext);
  if (!context) {
    throw new Error("useTodayPlan must be used within a TodayPlanProvider");
  }
  return context;
}

export default TodayPlanProvider;
