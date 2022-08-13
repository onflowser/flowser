import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../../constants/routes";
import IconButton from "../../../components/icon-button/IconButton";
import Logo from "../../../assets/images/logo.svg";
import classes from "./Main.module.scss";
import { ReactComponent as CaretIcon } from "../../../assets/icons/caret.svg";
import { ReactComponent as PlusIcon } from "../../../assets/icons/plus.svg";
import splitbee from "@splitbee/web";
import { toast } from "react-hot-toast";
import { ProjectsService } from "../../../services/projects.service";
import {
  useGetAllProjects,
  useGetCurrentProject,
  useGetFlowserVersion,
} from "../../../hooks/use-api";

const Main: FunctionComponent = () => {
  const history = useHistory();
  const projectService = ProjectsService.getInstance();
  const { data: projectData } = useGetAllProjects();
  const { projects } = projectData ?? {};
  const { data: currentProject } = useGetCurrentProject();
  const { data: flowserVersion } = useGetFlowserVersion();

  useEffect(() => {
    if (currentProject) {
      // there is a project currently in use
      // redirect to main app screen
      history.push("/accounts");
    }
  }, [currentProject]);

  const onQuickstart = async (name: string) => {
    try {
      await projectService.useProject(name);
      splitbee.track(`Start: use ${name}`);
      history.push(`/${routes.firstRouteAfterStart}`);
    } catch (e: unknown) {
      toast.error("Can't open project: " + e);
    }
  };

  const onConfigure = useCallback(() => {
    history.push(`/${routes.start}/configure`);
  }, []);

  return (
    <div className={classes.container}>
      <img src={Logo} alt="FLOWSER" />
      <div className={classes.header}>
        <h1>FLOWSER</h1>
        <span className={classes.version}>{flowserVersion?.version}</span>
      </div>
      {projects?.map((project) => (
        <IconButton
          key={project.id}
          onClick={() => onQuickstart(project.id)}
          variant="big"
          icon={<CaretIcon className={classes.caret} />}
          iconPosition="after-end"
        >
          {project.name}
        </IconButton>
      ))}

      <IconButton
        variant="big"
        outlined={true}
        onClick={onConfigure}
        icon={<PlusIcon />}
        iconPosition="after-end"
        className={`${classes.newProjectBtn}`}
      >
        ADD PROJECT
      </IconButton>
    </div>
  );
};

export default Main;
