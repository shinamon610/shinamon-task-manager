import React, {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
} from "react";
import Select, { createFilter, SelectInstance } from "react-select";
import { boxStyles, BoxRef, Option } from "./selectBox";
import { UUID } from "@/models/task";
import { Task } from "@/models/task";

type MultiBoxProps = {
  isDisabled: boolean;
  defaultOption: Set<UUID>;
  tasks: Task[];
  setSelectedValue: React.Dispatch<React.SetStateAction<Set<UUID>>>;
};

export const MultiBox = forwardRef<BoxRef, MultiBoxProps>(
  (props: MultiBoxProps, ref) => {
    const { isDisabled, defaultOption, tasks, setSelectedValue } = props;

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
        options={tasks.map((task) => ({
          value: task.id,
          label: task.name,
        }))}
        components={{ DropdownIndicator: null }}
        filterOption={createFilter({ ignoreAccents: false })}
        onChange={(newValue) => {
          const selectedOptions = newValue as Option<UUID>[];
          setSelectedValue(new Set(selectedOptions.map((o) => o.value)));
        }}
        placeholder=""
        isClearable
        isDisabled={isDisabled}
        menuPlacement="top"
        styles={boxStyles(isDisabled)}
        ref={selectRef}
        value={Array.from(defaultOption).map((id) => ({
          value: id,
          label: tasks.filter((task) => task.id === id)[0].name,
        }))}
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
