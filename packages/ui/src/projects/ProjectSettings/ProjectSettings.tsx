import React, { FunctionComponent, useEffect, useState } from "react";
import { useFormik } from "formik";
import classes from "./ProjectSettings.module.scss";
import { BaseCard } from "../../common/cards/BaseCard/BaseCard";
import Button from "../../common/buttons/Button/Button";
import FullScreenLoading from "../../common/loaders/FullScreenLoading/FullScreenLoading";
import { toast } from "react-hot-toast";
import classNames from "classnames";
import { FlowUtils } from "../../utils/flow-utils";
import * as yup from "yup";
import { useErrorHandler } from "../../hooks/use-error-handler";
import { useProjectManager } from "../../contexts/projects.context";
import { SettingsSection } from "../SettingsSection/SettingsSection";
import {
  RadioField,
  RadioFieldProps,
  TextField,
  FieldProps,
  ToggleField,
} from "../FormFields/FormFields";
import { useFilePicker } from "../../contexts/platform-adapter.context";
import { AnalyticEvent, useAnalytics } from "../../hooks/use-analytics";
import {
  FlowEmulatorConfig,
  FlowserProject,
  HashAlgorithm,
  SignatureAlgorithm,
} from "@onflowser/api";
import { useServiceRegistry } from "../../contexts/service-registry.context";
import { useGetFlowCliInfo } from "../../api";

const projectSchema = yup.object().shape({
  name: yup.string().required("Required"),
  filesystemPath: yup.string().required("Required"),
});

type ProjectSettingsProps = {
  projectId: string;
};

export const ProjectSettings: FunctionComponent<ProjectSettingsProps> = (
  props
) => {
  const { projectId } = props;
  const { projectsService } = useServiceRegistry();
  const [isLoading, setIsLoading] = useState(true);

  const { track } = useAnalytics();
  const { pickDirectory } = useFilePicker();
  const { startProject, removeProject, createProject, updateProject } =
    useProjectManager();
  const { data: flowCliInfo } = useGetFlowCliInfo();
  const { handleError } = useErrorHandler(ProjectSettings.name);
  const isExistingProject = Boolean(projectId);

  const formik = useFormik<FlowserProject>({
    validationSchema: projectSchema,
    validateOnChange: false,
    // Initial value is set in a hook bellow.
    initialValues: {} as FlowserProject,
    onSubmit: async () => {
      toast.promise(saveAndStartProject(), {
        loading: "Running project",
        success: "Project started",
        error: "Failed to projects project",
      });
    },
  });

  async function saveAndStartProject() {
    if (!isExistingProject) {
      track(AnalyticEvent.PROJECT_CREATED);
    }

    let updatedProject: FlowserProject;
    try {
      updatedProject = isExistingProject
        ? await updateProject(formik.values)
        : await createProject(formik.values);
    } catch (e) {
      handleError(e);
      window.scrollTo(0, 0);
      throw e;
    }

    await startProject(updatedProject, {
      replaceCurrentPage: true,
    });
  }

  useEffect(() => {
    if (!formik.isValid) {
      toast.error("Oops, please double check this form!");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [formik.isValid]);

  useEffect(() => {
    setIsLoading(true);
    (isExistingProject
      ? loadExistingProject(projectId)
      : loadDefaultProject()
    ).finally(() => {
      setIsLoading(false);
    });
  }, []);

  async function loadExistingProject(id: string) {
    try {
      const existingProject = await projectsService.getSingle(id);
      if (existingProject) {
        formik.setValues(existingProject, false);
      }
    } catch (e) {
      console.error(e);
      toast.error(
        `Something went wrong: Can not load emulator settings from server`
      );
    }
  }

  async function loadDefaultProject() {
    try {
      const defaultProject = await projectsService.getDefaultProjectInfo();
      if (defaultProject) {
        formik.setValues(defaultProject, false);
      }
    } catch (e) {
      toast.error(
        "Something went wrong: Can not fetch default ProjectSettings from server"
      );
    }
  }

  if (formik.isSubmitting || isLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.innerWrapper}>
        <header>
          <h1 className={classes.title}>Project settings</h1>
        </header>

        <main>
          <SettingsSection title="General" className={classes.section}>
            <BaseCard className={classes.card}>
              <TextField
                label="Project name"
                description="Give your project a cool name"
                path="name"
                formik={formik}
              />
              <TextField
                label="Project root path"
                description="Specify the path to your project (where flow.json is located)"
                path="filesystemPath"
                onClick={async () => {
                  const path = await pickDirectory?.();
                  if (path) {
                    formik.setFieldValue("filesystemPath", path);
                  }
                }}
                formik={formik}
              />
            </BaseCard>
          </SettingsSection>
          <SettingsSection
            title="Emulator"
            description="If flow-emulator is not running, Flowser will start it automatically."
            collapseChildren
            className={classes.section}
          >
            <BaseCard className={classes.card}>
              <EmulatorTextField
                label="RPC Port"
                path="grpcServerPort"
                description="gRPC port to listen on"
                formik={formik}
              />
              <EmulatorTextField
                label="HTTP Port"
                path="restServerPort"
                description="REST API port to listen on"
                formik={formik}
              />
              <EmulatorTextField
                label="Admin Port"
                path="adminServerPort"
                description="Admin API port to listen on"
                formik={formik}
              />
              <EmulatorTextField
                label="Service Private Key"
                path="servicePrivateKey"
                description="Private key used for the service account"
                formik={formik}
              />
              <EmulatorTextField
                label="Block time"
                path="blockTime"
                description="Time between sealed blocks. Valid units are ns, us (or µs), ms, s, m, h"
                formik={formik}
              />
              <EmulatorTextField
                label="Database path"
                path="databasePath"
                description="Specify path for the database file persisting the state"
                formik={formik}
              />
              <EmulatorTextField
                label="Token supply"
                path="tokenSupply"
                description="Initial FLOW token supply"
                formik={formik}
              />
              <EmulatorTextField
                label="Transaction Expiry"
                path="transactionExpiry"
                description="Transaction expiry, measured in blocks"
                formik={formik}
              />
              <EmulatorTextField
                label="Transaction Expiry"
                path="storagePerFlow"
                description="Specify size of the storage in MB for each FLOW in account balance. Default value from the flow-go"
                formik={formik}
              />
              <EmulatorTextField
                label="Minimum Account Balance"
                path="minAccountBalance"
                description="Specify minimum balance the account must have. Default value from the flow-go"
                formik={formik}
              />
              <EmulatorTextField
                label="Transaction Max Gas Limit"
                path="transactionMaxGasLimit"
                description="Maximum gas limit for transactions"
                formik={formik}
              />
              <EmulatorTextField
                label="Script Gas Limit"
                path="scriptGasLimit"
                description="Specify gas limit for script execution"
                formik={formik}
              />
            </BaseCard>
            <BaseCard className={classNames(classes.card, classes.radioCard)}>
              <EmulatorRadioField
                className={classes.radioField}
                label="Service Signature Algorithm"
                path="serviceSignatureAlgorithm"
                formik={formik}
                options={getSignatureAlgorithmRadioOptions([
                  SignatureAlgorithm.ECDSA_P256,
                  SignatureAlgorithm.ECDSA_secp256k1,
                  SignatureAlgorithm.BLS_BLS12_381,
                ])}
              />
              <EmulatorRadioField
                className={classes.radioField}
                label="Service Hash Algorithm"
                path="serviceHashAlgorithm"
                formik={formik}
                options={getHashAlgorithmRadioOptions([
                  HashAlgorithm.SHA2_256,
                  HashAlgorithm.SHA2_384,
                  HashAlgorithm.SHA3_256,
                  HashAlgorithm.SHA3_384,
                  HashAlgorithm.KMAC128_BLS_BLS12_381,
                  HashAlgorithm.KECCAK_256,
                ])}
              />
            </BaseCard>
            <BaseCard className={classes.card}>
              <EmulatorToggleField
                label="REST API debug"
                path="enableRestDebug"
                description="Enable REST API debugging output (not recommended as it slows down the app)"
                formik={formik}
              />
              <EmulatorToggleField
                label="GRPC API debug"
                path="enableGrpcDebug"
                description="enable gRPC server reflection for debugging with grpc_cli"
                formik={formik}
              />
              <EmulatorToggleField
                label="Verbose"
                path="verboseLogging"
                description="Enable verbose logging"
                formik={formik}
              />
              <EmulatorToggleField
                label="Persist"
                path="persist"
                description="Persist emaulator blockchain state between restarts"
                formik={formik}
              />
              <EmulatorToggleField
                label="Snapshots"
                path="snapshot"
                description="Enable blockchain state snapshots (this option automatically enables persistence)"
                formik={formik}
              />
              <EmulatorToggleField
                label="Simple Addresses"
                path="useSimpleAddresses"
                description="Use sequential addresses starting with 0x1"
                formik={formik}
              />
              <EmulatorToggleField
                label="Storage Limit"
                path="storageLimit"
                description="Enable account storage limit"
                formik={formik}
              />
              <EmulatorToggleField
                label="Transaction Fees"
                path="transactionFees"
                description="Enable transaction fees"
                formik={formik}
              />
              <EmulatorToggleField
                label="Contracts"
                path="withContracts"
                description="Start with contracts like FUSD, NFT and an NFT Marketplace, when the emulator starts"
                formik={formik}
              />
            </BaseCard>
          </SettingsSection>
        </main>

        <footer className={classes.footer}>
          <div>
            <Button
              className={classes.footerButton}
              onClick={() => removeProject(formik.values)}
              variant="middle"
              outlined={true}
              disabled={!projectId}
            >
              DELETE
            </Button>
            <Button
              variant="middle"
              onClick={formik.submitForm}
              className={classes.footerButton}
            >
              SAVE & RUN
            </Button>
          </div>

          <div className={classes.versionWrapper}>
            <a
              target="_blank"
              href={`https://github.com/onflow/flow-cli/releases/tag/${flowCliInfo?.version}`}
              rel="noreferrer"
            >
              Flow CLI version {flowCliInfo?.version || "-"}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

function getHashAlgorithmRadioOptions(hashAlgorithms: HashAlgorithm[]) {
  return hashAlgorithms.map((algo) => ({
    label: FlowUtils.getHashAlgoName(algo),
    value: algo,
  }));
}

function getSignatureAlgorithmRadioOptions(
  sigAlgorithms: SignatureAlgorithm[]
) {
  return sigAlgorithms.map((algo) => ({
    label: FlowUtils.getSignatureAlgoName(algo),
    value: algo,
  }));
}

function EmulatorTextField({
  path,
  ...restProps
}: FieldProps & { path: keyof FlowEmulatorConfig }) {
  return <TextField path={`emulator.${path}`} {...restProps} />;
}

function EmulatorRadioField({
  path,
  ...restProps
}: RadioFieldProps & { path: keyof FlowEmulatorConfig }) {
  return <RadioField path={`emulator.${path}`} {...restProps} />;
}

function EmulatorToggleField({
  path,
  ...restProps
}: FieldProps & { path: keyof FlowEmulatorConfig }) {
  return <ToggleField path={`emulator.${path}`} {...restProps} />;
}
