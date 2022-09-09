import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
} from "react";
import { Link, RouteChildrenProps, useHistory } from "react-router-dom";
import { routes } from "../../../constants/routes";
import IconButton from "../../../components/icon-button/IconButton";
import logo from "../../../assets/images/logo_with_text.svg";
import trash from "../../../assets/icons/trash.svg";
import newProject from "../../../assets/icons/new_project.svg";
import openProject from "../../../assets/icons/open_project.svg";
import yellowLine from "../../../assets/icons/yellow_line.svg";
import classes from "./Main.module.scss";
import splitbee from "@splitbee/web";
import { toast } from "react-hot-toast";
import { useGetAllProjects } from "../../../hooks/use-api";
import { Project } from "@flowser/shared";
import classNames from "classnames";
import Search from "../../../components/search/Search";
import { useSearch } from "../../../hooks/use-search";
import moment from "moment";
import { useConfirmDialog } from "../../../contexts/confirm-dialog.context";
import { useProjectActions } from "../../../contexts/project-actions.context";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import { ServiceRegistry } from "../../../services/service-registry";

type ProjectTab = {
  id: string;
  label: string;
  isDefault?: boolean;
  content: ReactElement;
};

const tabs: ProjectTab[] = [
  {
    id: "projects",
    label: "Projects",
    isDefault: true,
    content: <ProjectsListContent />,
  },
  {
    id: "about",
    label: "About",
    content: <AboutContent />,
  },
];

// TODO(milestone-x): Enable "open project" action?
const enableOpenProjectAction = false;

const Main: FunctionComponent<RouteChildrenProps> = (props) => {
  const { showDialog } = useConfirmDialog();
  const history = useHistory();

  const providedTabId = props.location.hash?.replace("#", "");
  const providedTab = tabs.find((tab) => tab.id === providedTabId);
  const defaultTab = tabs.find((tab) => tab.isDefault);
  const fallbackTab = tabs[0];
  const activeTab = providedTab ?? defaultTab ?? fallbackTab;

  const onConfigure = useCallback(() => {
    history.push(`/${routes.start}/configure`);
  }, []);

  function showOpenProjectDialog() {
    showDialog({
      title: "New emulator",
      body: <span>Not supported yet :(</span>,
      confirmBtnLabel: "CREATE",
      cancelBtnLabel: "CANCEL",
    });
  }

  return (
    <div className={classes.container}>
      <aside className={classes.sidebar}>
        <div className={classes.sideBarHeader}>
          <span className={classes.logoWrapper}>
            <img className={classes.logo} src={logo} alt="FLOWSER" />
          </span>
        </div>
        <ul className={classes.sideBarBody}>
          {tabs.map((tab) => (
            <li
              key={tab.id}
              className={classNames(classes.tabWrapper, {
                [classes.activeTab]: tab.id === activeTab.id,
              })}
            >
              <Link to={`/start#${tab.id}`} className={classes.tabLink}>
                <img
                  src={yellowLine}
                  alt="yellow line"
                  className={classes.yellowLine}
                />
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={classes.sideBarFooter}>
          {enableOpenProjectAction && (
            <IconButton
              variant="middle"
              onClick={() => showOpenProjectDialog()}
              icon={<img src={openProject} alt="open project icon" />}
              iconPosition="before"
              className={classes.openProjectButton}
            >
              OPEN
            </IconButton>
          )}
          <IconButton
            variant="middle"
            onClick={onConfigure}
            icon={<img src={newProject} alt="new project icon" />}
            iconPosition="before"
            className={classes.newProjectButton}
          >
            NEW PROJECT
          </IconButton>
        </div>
      </aside>
      {activeTab.content}
    </div>
  );
};

function ProjectsListContent() {
  const { projects } = useGetAllProjects()?.data ?? {};
  const { searchTerm, setPlaceholder } = useSearch("projectSearch");
  const { removeProject } = useProjectActions();
  const history = useHistory();
  const projectService = ServiceRegistry.getInstance().projectsService;
  const showProjectList = projects && projects.length > 0;

  useEffect(() => {
    setPlaceholder("Search projects");
  }, []);

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

  if (!showProjectList) {
    return (
      <div className={classes.bodyCenter}>
        <div>To start, you need to create a project.</div>
      </div>
    );
  }

  const filteredProjects = projects?.filter(
    (p) => !searchTerm || p.name.includes(searchTerm)
  );

  return (
    <div className={classes.projectList}>
      <div className={classes.projectListHeader}>
        <Search className={classes.projectSearch} context="projectSearch" />
      </div>
      <ul className={classes.projectListBody}>
        {filteredProjects.map((project) => (
          <li key={project.id} className={classes.projectWrapper}>
            <span
              className={classes.projectName}
              onClick={() => onQuickstart(project)}
            >
              {project.name}
            </span>
            <span className={classes.projectLastOpened}>
              last opened on {moment(project.updatedAt).format("DD-MM-YYYY")}
            </span>
            <SimpleButton
              className={classes.projectTrashcan}
              onClick={() => removeProject(project)}
            >
              <img src={trash} alt="trash icon" />
            </SimpleButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AboutContent() {
  return (
    <div className={classes.bodyCenter}>
      <div>
        Flowser 2022, v1.1 <br />
        Connect with us on{" "}
        <a href="https://discord.gg/WJe6CKfp" title="Flowser discord">
          Discord
        </a>
        <br />
        Follow us on{" "}
        <a href="https://twitter.com/onflowser" title="Flowser twitter">
          Twitter
        </a>{" "}
        <br />
        Contribute on{" "}
        <a href="https://github.com/onflowser/flowser" title="Flowser discord">
          Github
        </a>
      </div>
    </div>
  );
}

export default Main;
