import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import Select, { SelectInstance } from "react-select";
import { Option, BoxRef, boxStyles } from "./selectBox";
import CreatableSelect from "react-select/creatable";

type CreatableBoxProps<S> = {
  isDisabled: boolean;
  defaultOption: Option<S> | null;
  data: Set<Option<S>>;
  setData: React.Dispatch<React.SetStateAction<Set<Option<S>>>>;
  setSelectedValue: React.Dispatch<React.SetStateAction<Option<S> | null>>;
};

export const CreatableBox = forwardRef<BoxRef, CreatableBoxProps<any>>(
  (props: CreatableBoxProps<any>, ref) => {
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
      <CreatableSelect
        className="selectbox"
        options={Array.from(data)}
        components={{ DropdownIndicator: null }}
        // @ts-ignore
        onChange={(newValue) => setSelectedValue(newValue)}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={boxStyles(isDisabled)}
        ref={selectRef}
        value={defaultOption}
        onCreateOption={(newValue) => {
          console.log(newValue);
          const newOption = { label: newValue, value: newValue };
          setData(new Set([...Array.from(data), newOption]));
          setSelectedValue(newOption);
        }}
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

CreatableBox.displayName = "CreatableBox";
