/* eslint-disable react/jsx-key */
import { useState } from "react";
import Select from "react-select";
import { FlexContainer } from "./flexContainer";

type SelectDurationProps = {
  isDisabled: boolean;
  isSelectedHours: boolean;
  isSelectedMinutes: boolean;
  // hoursRef: React.RefObject<HTMLSelectElement>;
  // minutesRef: React.RefObject<HTMLSelectElement>;
};
export const SelectDuration = ({
  isDisabled,
  isSelectedHours,
  isSelectedMinutes, // hoursRef,
  // minutesRef,
}: SelectDurationProps) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const createOptions = (max: number) => {
    let options = [];
    for (let i = 0; i <= max; i++) {
      options.push({ value: i, label: i });
    }
    return options;
  };

  const hourOptions = createOptions(23); // 0〜23時間
  const minuteOptions = createOptions(59); // 0〜59分

  return (
    <div style={{ display: "flex" }}>
      <FlexContainer
        components={[
          <label>Hours</label>,
          <Select
            options={hourOptions}
            value={hourOptions.find((option) => option.value === hours)}
            onChange={(selectedOption) =>
              setHours(selectedOption ? selectedOption.value : 0)
            }
            menuPlacement="top"
            isDisabled={isDisabled}
          />,
        ]}
        isSelected={isSelectedHours}
        ratios={[0, 1]}
      />
      <FlexContainer
        components={[
          <label>Minutes</label>,
          <Select
            options={minuteOptions}
            value={minuteOptions.find((option) => option.value === minutes)}
            onChange={(selectedOption) =>
              setMinutes(selectedOption ? selectedOption.value : 0)
            }
            menuPlacement="top"
            isDisabled={isDisabled}
          />,
        ]}
        isSelected={isSelectedMinutes}
        ratios={[0, 1]}
      />
    </div>
  );
};
