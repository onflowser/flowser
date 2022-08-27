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
import logo from "../../../assets/images/logo_with_text.svg";
import trash from "../../../assets/icons/trash.svg";
import newProject from "../../../assets/icons/new_project.svg";
import openProject from "../../../assets/icons/open_project.svg";
import yellowLine from "../../../assets/icons/yellow_line.svg";
import classes from "./Main.module.scss";
import splitbee from "@splitbee/web";
import { toast } from "react-hot-toast";
import { ProjectsService } from "../../../services/projects.service";
import { useGetAllProjects } from "../../../hooks/use-api";
import { Project } from "@flowser/types/generated/entities/projects";
import classNames from "classnames";
import ConfirmDialog from "../../../components/confirm-dialog/ConfirmDialog";
import Search from "../../../components/search/Search";
import { useSearch } from "../../../hooks/use-search";
import moment from "moment";

const tabs = [
  { id: "projects", label: "Projects", default: true },
  { id: "about", label: "About" },
];

enum DialogTypes {
  deleteProject,
  openProject,
}

type IProps = RouteChildrenProps;

const Main: FunctionComponent<IProps> = (props) => {
  const [showDialog, setShowDialog] = useState<{
    confirmBtnLabel: string;
    cancelBtnLabel: string;
    body: ReactElement;
    onConfirm?: any;
  } | null>(null);

  const { searchTerm, setPlaceholder } = useSearch("projectSearch");

  useEffect(() => {
    setPlaceholder("Search projects");
  }, []);

  const tab = props.location.hash?.replace("#", "");
  const history = useHistory();
  const projectService = ProjectsService.getInstance();
  const { projects } = useGetAllProjects()?.data ?? {};

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

  const onDelete = async (project: Project) => {
    try {
      splitbee.track("Configuration: delete");
      await projectService.removeProject(project.id);
      toast(`Project "${project.name}" deleted!`);
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    } finally {
      closeDialog();
    }
  };

  const closeDialog = () => {
    setShowDialog(null);
  };

  const openDialog = (type: DialogTypes, props?: any) => {
    // return is just to break out of switch
    switch (type) {
      case DialogTypes.deleteProject:
        return setShowDialog({
          body: (
            <>
              <h3>Delete project</h3>
              <span>Are you sure you want to delete this project?</span>
            </>
          ),
          onConfirm: () => onDelete(props),
          confirmBtnLabel: "DELETE",
          cancelBtnLabel: "BACK",
        });
      case DialogTypes.openProject:
        return setShowDialog({
          body: (
            <>
              <h3>New emulator</h3>
              <span>Not supported yet :(</span>
            </>
          ),
          confirmBtnLabel: "CREATE",
          cancelBtnLabel: "CANCEL",
        });
    }
  };

  const tabsDom = {
    // Projects tab
    [tabs[0].id]:
      projects && projects.length ? (
        <div className={classes.projectList}>
          <div className={classes.projectListHeader}>
            <Search className={classes.projectSearch} context="projectSearch" />
          </div>
          <ul className={classes.projectListBody}>
            {projects
              ?.filter((p) => !searchTerm || p.name.includes(searchTerm))
              .map((project) => (
                <li key={project.id}>
                  <span
                    className={classes.projectName}
                    onClick={() => onQuickstart(project)}
                  >
                    {project.name}
                  </span>
                  <span className={classes.projectLastOpened}>
                    last opened on{" "}
                    {moment(project.updatedAt).format("DD-MM-YYYY")}
                  </span>
                  <span
                    className={classes.projectTrashcan}
                    onClick={() =>
                      openDialog(DialogTypes.deleteProject, project)
                    }
                  >
                    <img src={trash} alt="trash icon" />
                  </span>
                </li>
              ))}
          </ul>
        </div>
      ) : (
        <div className={classes.bodyCenter}>
          <div>
            To start, you need to create a project or <br />
            <Link to="">open</Link> an existing folder
          </div>
        </div>
      ),
    // About tab
    [tabs[1].id]: (
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
          <a
            href="https://github.com/onflowser/flowser"
            title="Flowser discord"
          >
            Github
          </a>
        </div>
      </div>
    ),
  };

  return (
    <div className={classes.container}>
      <aside>
        <div className={classes.sideBarHeader}>
          <span>
            <img src={logo} alt="FLOWSER" />
          </span>
        </div>
        <ul className={classes.sideBarBody}>
          {tabs.map((tabData) => (
            <li
              key={tabData.id}
              className={classNames({
                [classes.activeTab]:
                  tab == tabData.id || (tabData.default && !tab),
              })}
            >
              <Link to={`/start#${tabData.id}`}>
                <img
                  src={yellowLine}
                  alt="yellow line"
                  className={classes.yellowLine}
                />
                {tabData.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className={classes.sideBarFooter}>
          <IconButton
            variant="middle"
            onClick={() => openDialog(DialogTypes.openProject)}
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
      {tab ? tabsDom[tab] : tabsDom[tabs.find((t) => t.default)?.id || ""]}
      {showDialog && (
        <ConfirmDialog
          onClose={closeDialog}
          onConfirm={showDialog.onConfirm}
          confirmBtnLabel={showDialog.confirmBtnLabel}
          cancelBtnLabel={showDialog.cancelBtnLabel}
        >
          {showDialog.body}
        </ConfirmDialog>
      )}
    </div>
  );
};

export default Main;
