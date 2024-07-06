import useStore from "@/store/useStore";
import { MenuItem, Select } from "@mui/material";
import { TimeField } from "@mui/x-date-pickers";

type Props = {
  label: string;
  index: number;
};

type Key = "start" | "end";

export default function Day({ label, index }: Props) {
  const { setTimes, times, types, setTypes, getPlusMinus } = useStore();
  const plusMinus = getPlusMinus(index);

  const handleTimeChange = (newValue: any, context: any, key: Key) => {
    if (context.validationError) {
      return;
    }
    const updatedTime = { ...times[index] };
    updatedTime[key] = newValue;
    setTimes(index, updatedTime);
    localStorage.setItem(`day-${index}`, JSON.stringify(updatedTime));
  };

  const handleTypeChange = (event: any) => {
    const newType = event.target.value;

    if (newType === "fullLeave") {
      setTimes(index, { start: null, end: null });
      localStorage.removeItem(`day-${index}`);
    }
    const updatedTypes = { ...types };
    updatedTypes[index] = newType;
    setTypes(index, newType);
    localStorage.setItem("types", JSON.stringify(updatedTypes));
  };

  return (
    <div className="flex gap-5 my-4 items-center">
      <div>{label}</div>
      <div className="flex gap-2 items-center">
        <div>
          <TimeField
            format="HH:mm"
            value={times[index].start}
            onChange={(newValue, context) => handleTimeChange(newValue, context, "start")}
            disabled={types[index] === "fullLeave"}
            className="w-[78px]"
            size="small"
          />
        </div>
        <div>~</div>
        <div>
          <TimeField
            format="HH:mm"
            value={times[index].end}
            onChange={(newValue, context) => handleTimeChange(newValue, context, "end")}
            disabled={types[index] === "fullLeave"}
            className="w-[78px]"
            size="small"
          />
        </div>
      </div>
      <div>
        <Select value={types[index]} onChange={handleTypeChange} size="small">
          <MenuItem value={"default"}>근무</MenuItem>
          <MenuItem value={"fullLeave"}>연차</MenuItem>
          <MenuItem value={"halfLeave"}>반차</MenuItem>
        </Select>
      </div>
      <div className="">
        {plusMinus === 0 && <span className="text-black">0</span>}
        {plusMinus > 0 && <span className="text-green-600">{"+" + plusMinus}</span>}
        {plusMinus < 0 && <span className="text-red-600">{plusMinus}</span>}
      </div>
    </div>
  );
}
