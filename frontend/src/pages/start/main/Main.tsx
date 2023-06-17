import React, {
  FunctionComponent,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link, RouteChildrenProps, useHistory } from "react-router-dom";
import { routes } from "../../../constants/routes";
import IconButton from "../../../components/icon-button/IconButton";
// @ts-ignore .png import error
import longLogo from "../../../assets/images/long_logo.png";
import trash from "../../../assets/icons/trash.svg";
import newProject from "../../../assets/icons/new_project.svg";
import openProject from "../../../assets/icons/open_project.svg";
import yellowLine from "../../../assets/icons/yellow_line.svg";
import classes from "./Main.module.scss";
import {
  useGetAllProjects,
  useGetCurrentProject,
} from "../../../hooks/use-api";
import { Project } from "@flowser/shared";
import classNames from "classnames";
import Search from "../../../components/search/Search";
import { useSearch } from "../../../hooks/use-search";
import moment from "moment";
import { useConfirmDialog } from "../../../contexts/confirm-dialog.context";
import { useProjectActions } from "../../../contexts/project.context";
import { SimpleButton } from "../../../components/simple-button/SimpleButton";
import { ServiceRegistry } from "../../../services/service-registry";
import { useErrorHandler } from "../../../hooks/use-error-handler";
import { useAnalytics } from "../../../hooks/use-analytics";
import { AnalyticEvent } from "../../../services/analytics.service";
import { ConsentDialog } from "../../../components/consent-dialog/ConsentDialog";
import { useAnalyticsConsent } from "../../../hooks/use-analytics-consent";

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

const enableOpenProjectAction = false;

const Main: FunctionComponent<RouteChildrenProps> = (props) => {
  const { showDialog } = useConfirmDialog();
  const history = useHistory();
  const { data: currentProject, isFetching: isFetchingProject } =
    useGetCurrentProject();

  const providedTabId = props.location.hash?.replace("#", "");
  const providedTab = tabs.find((tab) => tab.id === providedTabId);
  const defaultTab = tabs.find((tab) => tab.isDefault);
  const fallbackTab = tabs[0];
  const activeTab = providedTab ?? defaultTab ?? fallbackTab;

  useEffect(() => {
    const isStartPage = history.location.pathname.startsWith("/start");
    const isRunningProject = Boolean(currentProject?.project);
    if (isStartPage && isRunningProject && !isFetchingProject) {
      history.push(routes.firstRouteAfterStart);
    }
  }, [history.location, currentProject]);

  const onConfigure = useCallback(() => {
    history.push(routes.configure);
  }, []);

  function showOpenProjectDialog() {
    showDialog({
      title: "New emulator",
      body: <span>Not supported yet :(</span>,
      confirmButtonLabel: "CREATE",
      cancelButtonLabel: "CANCEL",
    });
  }

  return (
    <div className={classes.container}>
      <aside className={classes.sidebar}>
        <div className={classes.sideBarHeader}>
          <span className={classes.logoWrapper}>
            <img className={classes.logo} src={longLogo} alt="FLOWSER" />
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
  const { data: projects } = useGetAllProjects();
  const { searchTerm, setPlaceholder } = useSearch("projectSearch");
  const { removeProject } = useProjectActions();
  const { handleError } = useErrorHandler(ProjectsListContent.name);
  const history = useHistory();
  const { track } = useAnalytics();
  const projectService = ServiceRegistry.getInstance().projectsService;
  const showProjectList = projects && projects.length > 0;

  useEffect(() => {
    setPlaceholder("Search projects");
  }, []);

  const runProject = async (project: Project) => {
    try {
      await projectService.useProject(project.id);
      track(AnalyticEvent.PROJECT_STARTED);
      history.push(routes.firstRouteAfterStart);
    } catch (e: unknown) {
      handleError(e);
      history.replace(`/start/configure/${project.id}`);
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
          <li key={project.id} className={classes.projectItem}>
            <span
              className={classes.projectName}
              onClick={() => runProject(project)}
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
  const [showAnalyticSettings, setShowAnalyticSettings] = useState(false);
  const [consentAnalyticsSetting, setConsentAnalyticsSetting] =
    useAnalyticsConsent();
  return (
    <div className={classes.bodyCenter}>
      {showAnalyticSettings && (
        <ConsentDialog
          onClose={() => setShowAnalyticSettings(false)}
          consent={consentAnalyticsSetting ?? true}
          setConsent={(consent) => {
            setConsentAnalyticsSetting(consent);
            setShowAnalyticSettings(false);
          }}
        />
      )}
      <div>
        Send feedback over{" "}
        <a href="mailto:info.flowser@gmail.com" title="Flowser email">
          Email
        </a>
        <br />
        Connect with us on{" "}
        <a href="https://discord.gg/2gx7ZsRUkD" title="Flowser discord">
          Discord
        </a>
        <br />
        Follow us on{" "}
        <a href="https://twitter.com/onflowser" title="Flowser twitter">
          Twitter
        </a>{" "}
        <br />
        Contribute on{" "}
        <a href="https://github.com/onflowser/flowser" title="Flowser github">
          Github
        </a>
        <br />
        <br />
        <a
          style={{ cursor: "pointer" }}
          onClick={() => setShowAnalyticSettings(true)}
        >
          Analytic settings
        </a>
      </div>
    </div>
  );
}

export default Main;
