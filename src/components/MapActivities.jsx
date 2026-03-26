import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const MapActivities = (apiData) => {
  return apiData.map((a) => {
    let text;

    if (a.type === "AI_QUERY") {
      text = (
        <>
          <strong>AI Tutor</strong> answered a question
        </>
      );
    } else if (a.type === "MATERIAL_UPLOAD") {
      text = (
        <>
          <strong>{a.message.split(" uploaded")[0]}</strong> uploaded
        </>
      );
    } else if (a.type === "JOIN") {
      text = <>{a.message}</>;
    } else {
      text = <>{a.message}</>;
    }

    return {
      text,
      time: dayjs(a.createdAt).fromNow(),
    };
  });
};
