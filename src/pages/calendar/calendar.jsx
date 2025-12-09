// import Calendar from "./components/Calendar.jsx";

// export default function Demo() {
//   return <Calendar selectionMode="range" onChangeRange={(r) => console.log(r)} />;
// }
// Single-date (default) — today preselected, no range prompt
//<Calendar selectionMode="single" onChange={(d) => console.log("date:", d)} />

// Date range — click once to set start, again to set end; pill spans the days
//<Calendar selectionMode="range" onChangeRange={(r) => console.log(r)} />

// Appointments — prevent past selections
//<Calendar selectionMode="single" disablePast />

//<Calendar initialDate={new Date(2025, 8, 4)} />

// pages/Demo.jsx
import Calendar from "../components/Calendar/calendar.jsx";

export default function Demo(){
  return (
    <Calendar
      selectionMode="range"
      onChangeRange={(r)=>console.log("range:", r)}
      onStatusChange={(s)=>console.log("status:", s)}
    />
  );
}

