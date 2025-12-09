import Header from "../../components/Header/header";
import { useEffect, useState } from "react";
import { usePetContext } from "../../hooks/usePetContext";
import APIClient from "../../api/Api";

export const DiteandSupplimentgenerate = [
  {
    icon: "",
    label: "Generate Dite Plan",
    to: "/diteandsupplements/diteplan",
  },
];

export const DiteandSupplimentsSubNav = [
  {
    icon: "",
    label: "Today's Diet",
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

export function DiteandSuppliment() {
  const { selectedPet } = usePetContext();
  const [hasGeneratedData, setHasGeneratedData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkForExistingDiet = async () => {
      if (!selectedPet?._id) {
        setLoading(false);
        return;
      }

      try {
        const dietAPI = new APIClient(`/diets/pets/${selectedPet._id}`);
        const response = await dietAPI.get();

        // If we get meals, diet plan exists
        if (response && response.meals && response.meals.length > 0) {
          setHasGeneratedData(true);
        } else {
          setHasGeneratedData(false);
        }
      } catch (error) {
        // If error (like 404), no diet exists yet
        setHasGeneratedData(false);
      } finally {
        setLoading(false);
      }
    };

    checkForExistingDiet();
  }, [selectedPet]);

  const subNavItems = hasGeneratedData
    ? DiteandSupplimentsSubNav
    : DiteandSupplimentgenerate;

  if (loading) {
    return (
      <>
        <Header
          title="Diet and Supplements"
          showPetSection={true}
          showSubnavigation={false}
        />
        <main className="diteandsuppliment-main">
          <p>Loading...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Diet and Supplements"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={subNavItems}
      />
      <main className="diteandsuppliment-main body-main-div">
        {hasGeneratedData ? (
          <p>View your pet's diet plan using the tabs above.</p>
        ) : (
          <p>Generate a diet plan for your pet to get started!</p>
        )}
      </main>
    </>
  );
}

export default DiteandSuppliment;
