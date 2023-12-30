import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import Select, { createFilter, components, SelectInstance } from "react-select";
import { Option } from "./selectBox";

type MultiBoxProps = {
  isDisabled: boolean;
  defaultOption: Set<Option<string>>;
  data: Set<Option<String>>;
  setSelectedValue: React.Dispatch<React.SetStateAction<Set<Option<String>>>>;
};

interface MultiBoxRef {
  focus: () => void;
  blur: () => void;
  isMenuOpen: () => void;
}

export const MultiBox = forwardRef<MultiBoxRef, MultiBoxProps>(
  (props: MultiBoxProps, ref) => {
    const { isDisabled, defaultOption, data, setSelectedValue } = props;

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

    const customStyles = {
      control: (base: any, state: any) => ({
        ...base,
        backgroundColor: isDisabled ? "var(--active)" : "white",
        borderColor: isDisabled ? "var(--active)" : base.borderColor,
      }),
    };

    return (
      <Select
        className="selectbox"
        options={Array.from(data)}
        components={{ DropdownIndicator: null }}
        filterOption={createFilter({ ignoreAccents: false })}
        onChange={(newValue) => {
          const selectedOptions = newValue as Option<string>[];
          setSelectedValue(new Set(selectedOptions));
        }}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={customStyles}
        ref={selectRef}
        defaultValue={Array.from(defaultOption)}
        isMulti={true}
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

MultiBox.displayName = "MultiBox";
