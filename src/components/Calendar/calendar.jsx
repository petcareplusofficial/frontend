import { useMemo, useState, useEffect } from "react";
import "./calendar.css";

const ACCENT = "#00425C";
const RANGE_BG = "rgba(0, 66, 92, 0.20)";
const HEADER_COLOR = "#00425C";
const fmt = new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" });

function startOfDay(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function todayLocal(){ return startOfDay(new Date()); }
function pad2(n){ return String(n).padStart(2,"0"); }
function getFirstWeekdayIndex(y,m){ return (new Date(y,m,1).getDay()+6)%7; }
function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function sameDate(a,b){ return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate(); }
function isBefore(a,b){ return startOfDay(a).getTime()<startOfDay(b).getTime(); }
function isAfter(a,b){ return startOfDay(a).getTime()>startOfDay(b).getTime(); }
function clampMin(d,min){ return isBefore(d,min)?min:d; }

export default function Calendar(props){
  const selectionMode = props.selectionMode === "range" ? "range" : "single";

  const {
    disablePast = false,
    disableFuture = false,
    minDate,
    maxDate,
    value, onChange,
    startValue, endValue, onChangeRange,
    initialMonth,
    onStatusChange,
    style, className
  } = props;

  useEffect(()=>{ console.log("mode prop =", selectionMode); },[selectionMode]);

  const today = todayLocal();
  const effectiveMin = disablePast ? (minDate ? startOfDay(minDate) : today) : minDate ? startOfDay(minDate) : null;
  const effectiveMax = disableFuture ? (maxDate ? startOfDay(maxDate) : today) : maxDate ? startOfDay(maxDate) : null;

  const [single, setSingle] = useState(()=> effectiveMin ? clampMin(value ?? today, effectiveMin) : (value ?? today));
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);

  const selectedSingle = value ?? single;
  const rangeStart = startValue ?? start;
  const rangeEnd = endValue ?? end;

  const initialViewDate = initialMonth ?? (selectionMode==="range" ? (rangeStart ?? today) : selectedSingle);
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 100}, (_, i) => currentYear - 50 + i);

  const { weeks, monthLabel } = useMemo(()=>{
    const days = getDaysInMonth(viewYear, viewMonth);
    const lead = getFirstWeekdayIndex(viewYear, viewMonth);
    const cells = Array(lead).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
    while(cells.length%7!==0) cells.push(null);
    const weeks=[]; for(let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
    const monthLabel = new Intl.DateTimeFormat(undefined,{month:"long",year:"numeric"}).format(new Date(viewYear,viewMonth,1));
    return { weeks, monthLabel };
  },[viewYear,viewMonth]);

  function gotoPrev(){ const d=new Date(viewYear,viewMonth-1,1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }
  function gotoNext(){ const d=new Date(viewYear,viewMonth+1,1); setViewYear(d.getFullYear()); setViewMonth(d.getMonth()); }

  const dayDate = (d)=> new Date(viewYear, viewMonth, d);
  const isDisabled = (d)=> {
    if (!d) return true;
    const date = dayDate(d);
    if (effectiveMin && isBefore(date, effectiveMin)) return true;
    if (effectiveMax && isAfter(date, effectiveMax)) return true;
    return false;
  };

  function clickDay(d){
    if(!d || isDisabled(d)) return;
    const date = dayDate(d);

    if(selectionMode==="single"){
      onChange ? onChange(date) : setSingle(date);
      return;
    }
    if(!rangeStart || (rangeStart && rangeEnd)){
      const nextStart = effectiveMin ? clampMin(date, effectiveMin) : date;
      setStart(nextStart); setEnd(null);
      onChangeRange && onChangeRange({ start: nextStart, end: null });
      return;
    }
    if(isBefore(date, rangeStart)){
      const nextStart = effectiveMin ? clampMin(date, effectiveMin) : date;
      setStart(nextStart);
      onChangeRange && onChangeRange({ start: nextStart, end: null });
    }else{
      const nextEnd = effectiveMin && isBefore(date, effectiveMin) ? effectiveMin : date;
      setEnd(nextEnd);
      onChangeRange && onChangeRange({ start: rangeStart, end: nextEnd });
    }
  }

  const inRange = (d)=>{
    if(!d || selectionMode!=="range" || !rangeStart || !rangeEnd) return false;
    const cur = dayDate(d), a=startOfDay(rangeStart), b=startOfDay(rangeEnd);
    const min = a<b ? a : b, max = a<b ? b : a;
    return cur>=min && cur<=max;
  };
  const isStartCell = (d)=> d && selectionMode==="range" && rangeStart && sameDate(dayDate(d), rangeStart);
  const isEndCell   = (d)=> d && selectionMode==="range" && rangeEnd   && sameDate(dayDate(d), rangeEnd);
  const isSingleCell= (d)=> d && selectionMode==="single" && sameDate(dayDate(d), selectedSingle);

  const status = useMemo(()=>{
    if(selectionMode==="single"){
      const mode = disablePast ? "appointment" : "single";
      return { mode, date:selectedSingle??null, start:null, end:null, label: selectedSingle ? fmt.format(selectedSingle) : "Select a date" };
    }
    if(rangeStart && rangeEnd) return { mode:"range-done", date:null, start:rangeStart, end:rangeEnd, label:`${fmt.format(rangeStart)} – ${fmt.format(rangeEnd)}` };
    if(rangeStart && !rangeEnd) return { mode:"range-pending", date:null, start:rangeStart, end:null, label:`Start: ${fmt.format(rangeStart)} · Select end` };
    return { mode:"range-pending", date:null, start:null, end:null, label:"Select start date" };
  },[selectionMode,disablePast,selectedSingle,rangeStart,rangeEnd]);

  useEffect(()=>{ onStatusChange && onStatusChange(status); },[status,onStatusChange]);

  const handleMonthChange = (e) => {
    setViewMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setViewYear(parseInt(e.target.value));
  };

  return (
    <div 
      style={{ 
        width:"23.3125rem", 
        height:"280px", 
        borderRadius:"12px", 
        background:"#fff", 
        boxShadow:"0 2px 12px rgba(0,0,0,0.08)", 
        padding:"12px", 
        display:"flex", 
        flexDirection:"column", 
        ...style 
      }} 
      className={`calendar ${className || ""}`}
    >
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <button 
          type="button" 
          aria-label="Previous month" 
          onClick={gotoPrev} 
          style={{ 
            border:0, 
            background:"transparent", 
            width:28, 
            height:28, 
            borderRadius:6, 
            fontSize:18, 
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            color: HEADER_COLOR
          }}
        >
          &lt;
        </button>
        
        <div style={{ flex:1, display:"flex", gap:8, justifyContent:"center" }}>
          <select 
            value={viewMonth} 
            onChange={handleMonthChange}
            style={{
              padding:"4px 8px",
              borderRadius:6,
              border:"1px solid #ddd",
              fontSize:14,
              fontWeight:600,
              cursor:"pointer",
              background:"#fff",
              color: HEADER_COLOR
            }}
          >
            {monthNames.map((name, idx) => (
              <option key={idx} value={idx}>{name}</option>
            ))}
          </select>
          
          <select 
            value={viewYear} 
            onChange={handleYearChange}
            style={{
              padding:"4px 8px",
              borderRadius:6,
              border:"1px solid #ddd",
              fontSize:14,
              fontWeight:600,
              cursor:"pointer",
              background:"#fff",
              color: HEADER_COLOR
            }}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        
        <button 
          type="button" 
          aria-label="Next month" 
          onClick={gotoNext} 
          style={{ 
            border:0, 
            background:"transparent", 
            width:28, 
            height:28, 
            borderRadius:6, 
            fontSize:18, 
            cursor:"pointer",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            color: HEADER_COLOR
          }}
        >
          &gt;
        </button>
      </div>

      <div style={{ 
        display:"grid", 
        gridTemplateColumns:"repeat(7, 1fr)", 
        gap:4, 
        padding:"4px 0", 
        color:"#8A8A8A", 
        fontSize:11,
        fontWeight:500
      }}>
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>
          <div key={d} style={{ textAlign:"center" }}>{d}</div>
        )}
      </div>

      <div style={{ 
        display:"grid", 
        gridTemplateColumns:"repeat(7, 1fr)", 
        gap:4, 
        marginTop:4,
        flex:1
      }}>
        {weeks.map((w, wi)=>
          w.map((day, di)=>{
            const startCell=isStartCell(day), endCell=isEndCell(day), between=inRange(day), singleCell=isSingleCell(day);
            const disabled=isDisabled(day);
            const pillLeft = startCell ? 0 : between ? -2 : 0;
            const pillRight= endCell ? 0 : between ? -2 : 0;
            return (
              <button
                type="button"
                key={`${wi}-${di}`}
                onClick={()=>clickDay(day)}
                disabled={!day || disabled}
                style={{
                  height:30, 
                  border:"none", 
                  outline:"none", 
                  borderRadius:6,
                  background: (between||startCell||endCell)?RANGE_BG:"transparent",
                  display:"flex", 
                  alignItems:"center", 
                  justifyContent:"center",
                  cursor:(!day||disabled)?"not-allowed":"pointer",
                  color: disabled?"#C4C4C4":"#333", 
                  position:"relative", 
                  padding:0,
                  ...(between||startCell||endCell ? {
                    borderRadius: startCell&&endCell?9999 : startCell?"9999px 0 0 9999px" : endCell?"0 9999px 9999px 0" : 6,
                    marginLeft:pillLeft, 
                    marginRight:pillRight
                  }: {})
                }}
              >
                <span style={{ 
                  width:26, 
                  height:26, 
                  lineHeight:"26px", 
                  textAlign:"center", 
                  borderRadius:"50%",
                  background:(singleCell||startCell||endCell)?ACCENT:"transparent",
                  color:(singleCell||startCell||endCell)?"#fff":(disabled?"#C4C4C4":"#333"),
                  fontWeight:600, 
                  fontVariantNumeric:"tabular-nums", 
                  letterSpacing:0.25,
                  fontSize:12
                }}>
                  {day ? pad2(day) : ""}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div style={{ 
        marginTop:8, 
        color:"#555", 
        fontSize:12,
        textAlign:"center",
        paddingTop:8,
        borderTop:"1px solid #f0f0f0"
      }}>
        {status.label}
      </div>
    </div>
  );
}