import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { routes } from "../../../constants/routes";
import IconButton from "../../../components/icon-button/IconButton";
import logo from "../../../assets/images/logo_with_text.svg";
import trash from "../../../assets/icons/trash.svg";
import newProject from "../../../assets/icons/new_project.svg";
import openProject from "../../../assets/icons/open_project.svg";
import yellowLine from "../../../assets/icons/yellow_line.svg";
import classes from "./Main.module.scss";
import { ReactComponent as CaretIcon } from "../../../assets/icons/caret.svg";
import { ReactComponent as PlusIcon } from "../../../assets/icons/plus.svg";
import splitbee from "@splitbee/web";
import { toast } from "react-hot-toast";
import { ProjectsService } from "../../../services/projects.service";
import {
  useGetAllProjects,
  useGetFlowserVersion,
} from "../../../hooks/use-api";
import { Project } from "@flowser/types/generated/entities/projects";

const Main: FunctionComponent = () => {
  const history = useHistory();
  const projectService = ProjectsService.getInstance();
  const { data: projectData } = useGetAllProjects();
  const { projects } = projectData ?? {};
  const { data: flowserVersion } = useGetFlowserVersion();

  const onQuickstart = async (project: Project) => {
    try {
      await projectService.useProject(project.id);
      splitbee.track(`Start: use ${project}`);
      history.push(`/${routes.firstRouteAfterStart}`);
    } catch (e: unknown) {
      console.error("Can't open project:", e);
      toast.error("Can't open project");
    }
  };

  const onConfigure = useCallback(() => {
    history.push(`/${routes.start}/configure`);
  }, []);

  return (
    <div className={classes.container}>
      <aside>
        <div className={classes.sideBarHeader}>
          <span>
            <img src={logo} alt="FLOWSER" />
          </span>
        </div>
        <ul className={classes.sideBarBody}>
          <li className={classes.activeTab}>
            <img
              src={yellowLine}
              alt="yellow line"
              className={classes.yellowLine}
            />
            Projects
          </li>
          <li>
            <img
              src={yellowLine}
              alt="yellow line"
              className={classes.yellowLine}
            />
            About
          </li>
        </ul>
        <div className={classes.sideBarFooter}>
          <IconButton
            variant="middle"
            onClick={onConfigure}
            icon={<img src={openProject} alt="open project icon" />}
            iconPosition="before"
            className={`${classes.openProjectButton}`}
          >
            OPEN
          </IconButton>
          <IconButton
            variant="middle"
            onClick={onConfigure}
            icon={<img src={newProject} alt="new project icon" />}
            iconPosition="before"
            className={`${classes.newProjectButton}`}
          >
            NEW PROJECT
          </IconButton>
        </div>
      </aside>
      <div className={classes.projectList}>
        <div className={classes.projectListHeader}>
          {/* PLACEHOLDER! */}
          <div className={classes.projectSearch}></div>
          {/*<Search />*/}
        </div>
        <ul className={classes.projectListBody}>
          {projects?.map((project) => (
            <li key={project.id} onClick={() => onQuickstart(project)}>
              <span className={classes.projectName}>{project.name}</span>
              <span className={classes.projectLastOpened}>
                last opened on 12-08-2022
              </span>
              <span className={classes.projectTrashcan}>
                <img src={trash} alt="trash icon" />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  /*return (
    <div className={classes.container}>
      <img src={Logo} alt="FLOWSER" />
      <div className={classes.header}>
        <h1>FLOWSER</h1>
        <span className={classes.version}>{flowserVersion?.version}</span>
      </div>
      {projects?.map((project) => (
        <IconButton
          key={project.id}
          onClick={() => onQuickstart(project)}
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
  );*/
};

export default Main;
