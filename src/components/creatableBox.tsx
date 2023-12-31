import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import { SelectInstance } from "react-select";
import { Option, BoxRef, boxStyles } from "./selectBox";
import CreatableSelect from "react-select/creatable";
import { toOption } from "./selectBox";

type CreatableBoxProps = {
  isDisabled: boolean;
  defaultOption: string | null;
  data: Set<string>;
  setData: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedValue: React.Dispatch<React.SetStateAction<string | null>>;
  toLabel: (value: string) => string;
};

export const CreatableBox = forwardRef<BoxRef, CreatableBoxProps>(
  (props: CreatableBoxProps, ref) => {
    const {
      isDisabled,
      defaultOption,
      data,
      setData,
      setSelectedValue,
      toLabel,
    } = props;

    const selectRef = useRef<SelectInstance>(null);
    const [innerMenuIsOpen, setInnerMenuIsOpen] = useState(false);
    const [menuIsOpen, setMenuIsOpen] = useState(false);

    const toOptionLocal = toOption(toLabel);

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
        options={Array.from(data).map(toOptionLocal)}
        components={{ DropdownIndicator: null }}
        onChange={(newValue) => {
          const nv = newValue as Option<string>;
          setSelectedValue(nv.value);
        }}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={boxStyles(isDisabled)}
        ref={selectRef}
        value={defaultOption == null ? "" : toOptionLocal(defaultOption)}
        onCreateOption={(newValue) => {
          setData(new Set([...Array.from(data), newValue]));
          setSelectedValue(newValue);
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
