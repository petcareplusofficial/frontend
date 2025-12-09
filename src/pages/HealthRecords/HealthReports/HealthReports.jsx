import Header from "../../../components/Header/header";
import { HealthReportsSubNav } from "../HealthRecords";

export function HealthReports() {
  return (
    <>
      <Header
        title="Health Reports"
        showPetSection={true}
        showSubnavigation={true}
        subNavItems={HealthReportsSubNav}
      />
      <main className="healthrecords-main body-main-div">
        <p>Welcome to the Health Records page!</p>
      </main>
    </>
  );
}

export default HealthReports;
