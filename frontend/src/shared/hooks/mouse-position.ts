import { useCallback, useEffect, useState } from "react";

export const useMouseMove = (track: boolean): MouseEvent | undefined => {
  const [event, setEvent] = useState<MouseEvent>();

  const onMouseMove = useCallback((e) => {
    setEvent(e);
  }, []);

  useEffect(() => {
    if (track) {
      document.addEventListener("mousemove", onMouseMove);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
    }
  }, [track]);

  return event;
};
