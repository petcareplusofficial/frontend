import Header from "../../../components/Header/header";
import { useContext } from "react";
import { TodaysDitePlanSubNav } from "../TodaysPlan/Todaysplan";
import "./BreedSpec.css";
import {
  BuddyBreedProvider,
  useBuddyBreed,
} from "../../../Context/BreedContext/BreedContext";
import WeightComparisonChart, {
  RecommendationCard,
  AiInsightCard,
} from "../../../components/LineChart/LineChart";
import { usePetContext } from "../../../hooks/usePetContext";

function BreedSpecificGuidancePageContent() {
  const { chartData, recommendations } = useBuddyBreed();
  const { selectedPet } = usePetContext();
  console.log("#***************Chart Data:", chartData);

  return (
    <div className="breed-guidance-container">
      <h1>Breed specific guidance</h1>
      <h2>
        {(selectedPet?.name ?? "Pet") +
          " vs. " +
          (selectedPet?.breedId?.name ?? "Breed") +
          " Breed's Average (BMI)"}
      </h2>

      <div className="chart-card">
        <WeightComparisonChart
          petWeights={chartData.petBMIs}
          breedAvgWeights={chartData.breedBMIs}
          months={chartData.months}
          yLabel="BMI"
        />
      </div>
      <RecommendationCard recommendations={recommendations} />
    </div>
  );
}

export function BreedSpecificGuidance() {
  return (
    <BuddyBreedProvider>
      <BreedSpecificGuidancePageContent />
    </BuddyBreedProvider>
  );
}

export function BreedSpec() {
  return (
    <>
      <Header
        title="Breed Details"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={TodaysDitePlanSubNav}
      />
      <main className="breedspec-main body-main-div">
        <BreedSpecificGuidance />
      </main>
    </>
  );
}

export default BreedSpec;
