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

export function toOption<S>(
  toLabel: (value: S) => string
): (value: S) => Option<S> {
  return (value: S) => ({
    value,
    label: toLabel(value),
  });
}

type SelectBoxProps<S> = {
  isDisabled: boolean;
  defaultOption: S;
  data: Set<S>;
  setSelectedValue: React.Dispatch<React.SetStateAction<S>>;
  toLabel: (value: S) => string;
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
    singleValue: (base: any, state: any) => ({
      ...base,
      color: isDisabled ? "black" : base.color, // ここで色を変更
    }),
  };
}

export const SelectBox = forwardRef<BoxRef, SelectBoxProps<any>>(
  (props: SelectBoxProps<any>, ref) => {
    const { isDisabled, defaultOption, data, setSelectedValue, toLabel } =
      props;

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
      <Select
        className="selectbox"
        options={Array.from(data).map(toOptionLocal)}
        components={{ DropdownIndicator: null }}
        filterOption={createFilter({ ignoreAccents: false })}
        onChange={(newValue) => {
          const nv = newValue as Option<any>;
          if (newValue == null) {
            return;
          }
          setSelectedValue(nv.value);
        }}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={boxStyles(isDisabled)}
        ref={selectRef}
        value={toOptionLocal(defaultOption)}
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
