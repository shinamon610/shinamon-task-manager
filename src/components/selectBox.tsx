import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import Select, { createFilter, SelectInstance } from "react-select";

export type Option<S> = {
  value: S;
  label: string;
};

type SelectBoxProps<S> = {
  isDisabled: boolean;
  defaultOption: Option<S> | null;
  data: Set<Option<S>>;
  setData: React.Dispatch<React.SetStateAction<Set<Option<S>>>> | null;
  setSelectedValue:
    | React.Dispatch<React.SetStateAction<Option<S>>>
    | React.Dispatch<React.SetStateAction<Option<S> | null>>;
};

export interface BoxRef {
  focus: () => void;
  blur: () => void;
  isMenuOpen: () => void;
}

export function boxStyles(isDisabled: boolean) {
  return {
    control: (base: any, state: any) => ({
      ...base,
      backgroundColor: isDisabled ? "var(--active)" : "white",
      borderColor: isDisabled ? "var(--active)" : base.borderColor,
    }),
  };
}
export const SelectBox = forwardRef<BoxRef, SelectBoxProps<any>>(
  (props: SelectBoxProps<any>, ref) => {
    const { isDisabled, defaultOption, data, setData, setSelectedValue } =
      props;

    const selectRef = useRef<SelectInstance>(null);
    const [innerMenuIsOpen, setInnerMenuIsOpen] = useState(false);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    useImperativeHandle(ref, () => ({
      focus: () => {
        selectRef.current?.focus();
      },
      blur: () => {
        selectRef.current?.blur();
      },
      isMenuOpen: () => menuIsOpen,
    }));

    return (
      <Select
        className="selectbox"
        options={Array.from(data)}
        components={{ DropdownIndicator: null }}
        filterOption={createFilter({ ignoreAccents: false })}
        // onInputChange={handleInputChange}
        // @ts-ignore
        onChange={(newValue) => setSelectedValue(newValue)}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={boxStyles(isDisabled)}
        ref={selectRef}
        defaultValue={defaultOption}
        onMenuOpen={() => setInnerMenuIsOpen(true)}
        onMenuClose={() => {
          setInnerMenuIsOpen(false);
        }}
        onKeyDown={(e) => {
          setMenuIsOpen(innerMenuIsOpen);
        }}
      />
    );
  }
);

SelectBox.displayName = "SelectBox";
