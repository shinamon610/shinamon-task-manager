import React, {
  useState,
  useEffect,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import Select, { createFilter, components, SelectInstance } from "react-select";

export type Option<S> = {
  value: S;
  label: string;
};

type SelectBoxProps<S, T> = {
  isDisabled: boolean;
  isMulti: boolean;
  defaultOption: Option<S> | Set<Option<S>> | null;
  data: Set<Option<S>>;
  setData: React.Dispatch<React.SetStateAction<Set<Option<S>>>> | null;
  setSelectedValue:
    | React.Dispatch<React.SetStateAction<Option<S>>>
    | React.Dispatch<React.SetStateAction<Set<Option<S>>>>
    | React.Dispatch<React.SetStateAction<Option<S> | null>>;
};

interface SelectBoxRef {
  focus: () => void;
  blur: () => void;
  isMenuOpen: () => void;
}

export const SelectBox = forwardRef<SelectBoxRef, SelectBoxProps<any, any>>(
  (props: SelectBoxProps<any, any>, ref) => {
    const {
      isDisabled,
      isMulti,
      defaultOption,
      data,
      setData,
      setSelectedValue,
    } = props;

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

    // const handleInputChange = (
    //   inputValue: string,
    //   { action }: { action: string }
    // ) => {
    //   if (action === "input-change") {
    //     const newOption = { value: inputValue, label: inputValue };
    //     if (!options.some((option) => option.value === inputValue)) {
    //       setOptions((currentOptions) => [...currentOptions, newOption]);
    //     }
    //   }
    // };

    const customStyles = {
      control: (base: any, state: any) => ({
        ...base,
        backgroundColor: isDisabled ? "var(--active)" : "white",
        borderColor: isDisabled ? "var(--active)" : base.borderColor,
      }),
    };

    // defaultOptionがSetかどうかをチェックする関数
    const isSet = (obj: any): obj is Set<any> => obj instanceof Set;

    // defaultValueを決定する
    const defaultValue = isSet(defaultOption)
      ? Array.from(defaultOption)
      : defaultOption;

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
        styles={customStyles}
        ref={selectRef}
        defaultValue={defaultValue}
        isMulti={isMulti}
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
