import React, { FunctionComponent, ReactElement, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import IconButton from "../../common/buttons/IconButton/IconButton";
import longLogo from "../../assets/long_logo.png";
import trash from "../../common/icons/assets/trash.svg";
import classes from "./ProjectListPage.module.scss";
import { useFlowserHooksApi } from "../../contexts/api-hooks.context";
import classNames from "classnames";
import { useProjectManager } from "../../contexts/projects.context";
import { SimpleButton } from "../../common/buttons/SimpleButton/SimpleButton";
import { ConsentDialog } from "../../common/overlays/dialogs/consent/ConsentDialog";
import { useAnalytics } from "../../hooks/use-analytics";
import { FlowserIcon } from "../../common/icons/FlowserIcon";
import { TextUtils } from "../../utils/text-utils";

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

export const ProjectListPage: FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const providedTabId = location.hash?.replace("#", "");
  const providedTab = tabs.find((tab) => tab.id === providedTabId);
  const defaultTab = tabs.find((tab) => tab.isDefault);
  const fallbackTab = tabs[0];
  const activeTab = providedTab ?? defaultTab ?? fallbackTab;

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
              <Link to={`/projects#${tab.id}`} className={classes.tabLink}>
                <div className={classes.indicator} />
                {tab.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={classes.sideBarFooter}>
          <IconButton
            variant="middle"
            onClick={() => navigate("/projects/create")}
            icon={<FlowserIcon.Plus />}
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
  const api = useFlowserHooksApi();
  const { data: projects } = api.useGetFlowserProjects();
  const { startProject, removeProject } = useProjectManager();
  const showProjectList = projects && projects.length > 0;

  if (!showProjectList) {
    return (
      <div className={classes.bodyCenter}>
        <div>To start, you need to create a project.</div>
      </div>
    );
  }

  return (
    <div className={classes.projectList}>
      <ul className={classes.projectListBody}>
        {projects.map((project) => (
          <li key={project.id} className={classes.projectItem}>
            <span
              className={classes.projectName}
              onClick={() => startProject(project)}
            >
              {project.name}
            </span>
            <span className={classes.projectLastOpened}>
              last opened on {TextUtils.longDate(project.updatedAt)}
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
  const { isConsented, setIsConsented } = useAnalytics();
  return (
    <div className={classes.bodyCenter}>
      {showAnalyticSettings && (
        <ConsentDialog
          onClose={() => setShowAnalyticSettings(false)}
          consent={isConsented ?? true}
          setConsent={(consent) => {
            setIsConsented(consent);
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
