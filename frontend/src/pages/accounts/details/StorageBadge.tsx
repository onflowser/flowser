import classes from "./StorageBadge.module.scss";

type StorageBadgeProps = {
  text: string;
};

export function StorageBadge({ text }: StorageBadgeProps) {
  return (
    <div className={classes.root}>
      <div className={classes.badge}>{text}</div>
    </div>
  );
}

