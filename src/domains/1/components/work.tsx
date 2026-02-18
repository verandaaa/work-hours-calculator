import {
  LOCAL_STORAGE_KEY,
  WORK_TIME,
  WORK_TYPE,
} from "@/domains/1/constants/constant";
import useStore from "@/domains/1/stores/use-store";
import { WorkTime } from "@/domains/1/types/type";
import { getIsDayOff } from "@/domains/1/utils/util";
import { MenuItem, Select } from "@mui/material";
import { TimeField } from "@mui/x-date-pickers";

type Props = {
  label: string;
  index: number;
};

const TIME_FORMAT = "HH:mm";

export default function Work({ label, index }: Props) {
  const {
    setWorkTimes,
    workTimes,
    workTypes,
    setWorkTypes,
    getPlusMinus,
    getNewWorkTimes,
  } = useStore();
  const plusMinus = getPlusMinus(index);

  const handleTimeChange = (newValue: any, context: any, key: WorkTime) => {
    if (context.validationError) {
      return;
    }
    const updatedTime = { ...workTimes[index] };
    updatedTime[key] = newValue;
    const newTimes = getNewWorkTimes(index, updatedTime);
    setWorkTimes(newTimes);
    localStorage.setItem(
      LOCAL_STORAGE_KEY.WORK_TIMES,
      JSON.stringify(newTimes)
    );
  };

  const handleTypeChange = (event: any) => {
    const newWorkType = event.target.value;

    if (getIsDayOff(newWorkType)) {
      const newTimes = getNewWorkTimes(index, { start: null, end: null });
      setWorkTimes(newTimes);
      localStorage.setItem(
        LOCAL_STORAGE_KEY.WORK_TIMES,
        JSON.stringify(newTimes)
      );
    }
    const updatedWorkTypes = { ...workTypes };
    updatedWorkTypes[index] = newWorkType;
    setWorkTypes(index, newWorkType);
    localStorage.setItem(
      LOCAL_STORAGE_KEY.WORK_TYPES,
      JSON.stringify(updatedWorkTypes)
    );
  };

  return (
    <div className="flex gap-2 my-4 items-center">
      <div>{label}</div>
      <div className="flex gap-1 items-center">
        <div>
          <TimeField
            format={TIME_FORMAT}
            value={workTimes[index].start}
            onChange={(newValue, context) =>
              handleTimeChange(newValue, context, WORK_TIME.START)
            }
            disabled={getIsDayOff(workTypes[index])}
            className="w-[78px]"
            size="small"
          />
        </div>
        <div>~</div>
        <div>
          <TimeField
            format={TIME_FORMAT}
            value={workTimes[index].end}
            onChange={(newValue, context) =>
              handleTimeChange(newValue, context, WORK_TIME.END)
            }
            disabled={getIsDayOff(workTypes[index])}
            className="w-[78px]"
            size="small"
          />
        </div>
      </div>
      <div className="w-[80px]">
        <Select
          value={workTypes[index]}
          onChange={handleTypeChange}
          size="small"
          fullWidth
        >
          <MenuItem value={WORK_TYPE.DEFAULT}>근무</MenuItem>
          <MenuItem value={WORK_TYPE.FULL_LEAVE}>연차</MenuItem>
          <MenuItem value={WORK_TYPE.HALF_LEAVE}>반차</MenuItem>
          <MenuItem value={WORK_TYPE.QUARTER_LEAVE}>반반차</MenuItem>
          <MenuItem value={WORK_TYPE.FREE_DINNER}>저녁</MenuItem>
          <MenuItem value={WORK_TYPE.REFRESH_DAY}>리프레시데이</MenuItem>
          <MenuItem value={WORK_TYPE.HOLIDAY}>휴일</MenuItem>
        </Select>
      </div>
      <div className="flex justify-center flex-1">
        {plusMinus === 0 && <span className="text-black">0</span>}
        {plusMinus > 0 && (
          <span className="text-green-600">{"+" + plusMinus}</span>
        )}
        {plusMinus < 0 && <span className="text-red-600">{plusMinus}</span>}
      </div>
    </div>
  );
}
