import { Task, UUID } from "@/models/task";
import { List } from "immutable";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Select, { SelectInstance, createFilter } from "react-select";
import { BoxRef, Option, boxStyles } from "./selectBox";
type MultiBoxProps = {
  isDisabled: boolean;
  defaultOption: Set<UUID>;
  tasks: List<Task>;
  setSelectedValue: React.Dispatch<React.SetStateAction<Set<UUID>>>;
};

const customBoxStyles = (isDisabled: boolean) => {
  return {
    ...boxStyles(isDisabled),
    valueContainer: (base: any) => ({
      ...base,
      maxHeight: "50px", // 最大高さを設定
    }),
  };
};

export const MultiBox = forwardRef<BoxRef, MultiBoxProps>(
  (props: MultiBoxProps, ref) => {
    const { isDisabled, defaultOption, tasks, setSelectedValue } = props;

    const selectRef = useRef<SelectInstance>(null);
    const [innerMenuIsOpen, setInnerMenuIsOpen] = useState(false);
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [focused, setFocused] = useState(false);

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
        options={tasks
          .map((task) => ({
            value: task.id,
            label: task.name,
          }))
          .toJS()}
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
        styles={focused ? boxStyles(isDisabled) : customBoxStyles(isDisabled)}
        ref={selectRef}
        value={Array.from(defaultOption).map((id) => ({
          value: id,
          label: tasks.filter((task) => task.id === id).get(0)!.name,
        }))}
        isMulti={true}
        onMenuOpen={() => setInnerMenuIsOpen(true)}
        onMenuClose={() => {
          setInnerMenuIsOpen(false);
        }}
        onKeyDown={(e) => {
          setMenuIsOpen(innerMenuIsOpen);
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    );
  }
);

MultiBox.displayName = "MultiBox";
