import { Mode } from "@/vim/mode";
import { KeyBar } from "./KeyBar";
import { PurifyBar } from "./purifybar";

export function BottomBar({ mode }: { mode: Mode }) {
  if (mode === Mode.PurifyInputting) {
    return <PurifyBar />;
  }
  return <KeyBar mode={mode} />;
}
