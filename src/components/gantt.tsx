import { MainContext } from "@/contexts/mainContext";
import { Task } from "@/models/task";
import { Gantt, Task as GanttTask } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "./gantt.module.css";

const TaskListHeaderDefault: React.FC<{
  headerHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
}> = ({ headerHeight, fontFamily, fontSize, rowWidth }) => {
  return (
    <div
      className={styles.ganttTable}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      <div
        className={styles.ganttTable_Header}
        style={{
          height: headerHeight - 2,
        }}
      >
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;Name
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.2,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;From
        </div>
        <div
          className={styles.ganttTable_HeaderSeparator}
          style={{
            height: headerHeight * 0.5,
            marginTop: headerHeight * 0.25,
          }}
        />
        <div
          className={styles.ganttTable_HeaderItem}
          style={{
            minWidth: rowWidth,
          }}
        >
          &nbsp;To
        </div>
      </div>
    </div>
  );
};

const localeDateStringCache = {};
const toLocaleDateStringFactory =
  (locale: string) =>
  (date: Date, dateTimeOptions: Intl.DateTimeFormatOptions) => {
    const key = date.toString();
    // @ts-ignore
    let lds = localeDateStringCache[key];
    if (!lds) {
      lds = date.toLocaleDateString(locale, dateTimeOptions);
      // @ts-ignore
      localeDateStringCache[key] = lds;
    }
    return lds;
  };
const dateTimeOptions: Intl.DateTimeFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "long",
  day: "numeric",
};

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: GanttTask[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: GanttTask) => void;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  locale,
  onExpanderClick,
}) => {
  const toLocaleDateString = useMemo(
    () => toLocaleDateStringFactory(locale),
    [locale]
  );

  return (
    <div
      className={styles.taskListWrapper}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize,
      }}
    >
      {tasks.map((t) => {
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "▼";
        } else if (t.hideChildren === true) {
          expanderSymbol = "▶";
        }

        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
            key={`${t.id}row`}
          >
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
              title={t.name}
            >
              <div className={styles.taskListNameWrapper}>
                <div
                  className={
                    expanderSymbol
                      ? styles.taskListExpander
                      : styles.taskListEmptyExpander
                  }
                  onClick={() => onExpanderClick(t)}
                >
                  {expanderSymbol}
                </div>
                <div>{t.name}</div>
              </div>
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.start, dateTimeOptions)}
            </div>
            <div
              className={styles.taskListCell}
              style={{
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              &nbsp;{toLocaleDateString(t.end, dateTimeOptions)}
            </div>
          </div>
        );
      })}
    </div>
  );
};
export function MyGantt() {
  const headerHeight = 50;
  const scrollHeight = 20;
  const { filteredTasks, ganttViewMode } = useContext(MainContext);
  const ganttContainerRef = useRef(null);
  const [ganttHeight, setGanttHeight] = useState(0);

  useEffect(() => {
    const updateGanttHeight = () => {
      if (ganttContainerRef.current) {
        setGanttHeight(
          // @ts-ignore
          ganttContainerRef.current.offsetHeight - headerHeight - scrollHeight
        );
      }
    };

    window.addEventListener("resize", updateGanttHeight); // ウィンドウリサイズ時に高さを更新
    updateGanttHeight(); // コンポーネントマウント時にも高さを初期化

    return () => {
      window.removeEventListener("resize", updateGanttHeight); // イベントリスナーのクリーンアップ
    };
  }, []);

  const ganttTasks: GanttTask[] = useMemo(() => {
    return (filteredTasks.toJS() as Task[]).map(
      ({ id, name, startTime, endTime, from, spentTime, estimatedTime }) => {
        const now = new Date();
        return {
          id,
          start: startTime?.toDate() ?? now,
          end:
            endTime?.toDate() ??
            new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
          name,
          type: "task",
          progress:
            estimatedTime === null ? 0 : (spentTime / estimatedTime) * 100,
          isDisabled: true,
          styles: {
            progressColor: "#ffbb54",
            progressSelectedColor: "#ff9e0d",
          },
          dependencies: from,
        };
      }
    );
  }, [filteredTasks]);
  return (
    <div ref={ganttContainerRef} className="gantt">
      <Gantt
        tasks={ganttTasks}
        TaskListHeader={TaskListHeaderDefault}
        TaskListTable={TaskListTableDefault}
        ganttHeight={ganttHeight}
        headerHeight={headerHeight}
        viewMode={ganttViewMode}
      />
    </div>
  );
}
