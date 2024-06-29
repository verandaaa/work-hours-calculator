import { Time } from "@/model/type";
import useStore from "@/store/useStore";

type Props = {
  label: string;
  index: number;
};

type Key = "start" | "end";
type SubKey = "hour" | "minute";

export default function Day({ label, index }: Props) {
  const { setTimes, times, types, getPlusMinus } = useStore();
  const plusMinus = getPlusMinus(index);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [key, subKey] = name.split("-") as [Key, SubKey];
    const updatedTime = { ...times[index] };
    updatedTime[key][subKey] = value;
    setTimes(index, updatedTime);
    localStorage.setItem(`day-${index}`, JSON.stringify(updatedTime));
  };

  return (
    <div className="flex gap-4 my-4">
      <div>{label}</div>
      <div className="flex gap-4">
        <div>
          <input
            type="text"
            value={times[index].start.hour}
            maxLength={2}
            placeholder="HH"
            name="start-hour"
            onChange={handleInputChange}
            className="w-10"
            autoComplete="off"
          />
          <input
            type="text"
            value={times[index].start.minute}
            maxLength={2}
            placeholder="MM"
            name="start-minute"
            onChange={handleInputChange}
            className="w-10"
            autoComplete="off"
          />
        </div>
        <div>~</div>
        <div>
          <input
            type="text"
            value={times[index].end.hour}
            maxLength={2}
            placeholder="HH"
            name="end-hour"
            onChange={handleInputChange}
            className="w-10"
            autoComplete="off"
          />
          <input
            type="text"
            value={times[index].end.minute}
            maxLength={2}
            placeholder="MM"
            name="end-minute"
            onChange={handleInputChange}
            className="w-10"
            autoComplete="off"
          />
        </div>
        <div>{types[index]}</div>
        <div className={""}>
          {plusMinus >= 0 ? "+" : ""}
          {plusMinus}
        </div>
      </div>
    </div>
  );
}
