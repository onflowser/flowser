import React, { FunctionComponent, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useFormik } from "formik";
import classes from "./Configuration.module.scss";
import Card from "../../../components/card/Card";
import Button from "../../../components/button/Button";
import { routes } from "../../../constants/routes";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { toast } from "react-hot-toast";
import splitbee from "@splitbee/web";
import classNames from "classnames";
import { useGetFlowCliInfo } from "../../../hooks/use-api";
import { DevWallet, Emulator, Gateway, Project } from "@flowser/shared";
import { HashAlgorithm, SignatureAlgorithm } from "@flowser/shared";
import { FlowUtils } from "../../../utils/flow-utils";
import * as yup from "yup";
import { ServiceRegistry } from "../../../services/service-registry";
import { useErrorHandler } from "../../../hooks/use-error-handler";
import { useProjectActions } from "../../../contexts/project-actions.context";
import { ConfigurationSection } from "./ConfigurationSection";
import {
  RadioField,
  RadioFieldProps,
  TextField,
  FieldProps,
  ToggleField,
} from "./FormFields";

const projectSchema = yup.object().shape({
  name: yup.string().required("Required"),
  filesystemPath: yup.string().required("Required"),
});

export const Configuration: FunctionComponent = () => {
  const projectService = ServiceRegistry.getInstance().projectsService;
  const [isLoading, setIsLoading] = useState(true);

  const { removeProject } = useProjectActions();
  const { data: flowCliInfo } = useGetFlowCliInfo();
  const { handleError } = useErrorHandler(Configuration.name);
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const isExistingProject = Boolean(id);

  const formik = useFormik({
    validationSchema: projectSchema,
    initialValues: Project.fromPartial({
      filesystemPath: "",
      devWallet: DevWallet.fromPartial({}),
      emulator: Emulator.fromPartial({}),
      gateway: Gateway.fromPartial({}),
    }),
    onSubmit: async () => {
      try {
        splitbee.track("Configuration: update/create");
        const response = isExistingProject
          ? await projectService.updateProject(formik.values)
          : await projectService.createProject(formik.values);
        if (response.project) {
          await projectService.useProject(response.project.id);
        }
        history.replace(`/${routes.firstRouteAfterStart}`);
      } catch (e) {
        handleError(e);
        window.scrollTo(0, 0);
      }
    },
  });

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
      ? loadExistingProject(id)
      : loadDefaultProject()
    ).finally(() => {
      setIsLoading(false);
    });
  }, []);

  async function loadExistingProject(id: string) {
    try {
      const existingProjectData = await projectService.getSingle(id);
      const existingProject = existingProjectData.project;
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
      const defaultProjectData = await projectService.getDefaultProjectInfo();
      const defaultProject = defaultProjectData.project;
      if (defaultProject) {
        formik.setValues(defaultProject, false);
      }
    } catch (e) {
      toast.error(
        "Something went wrong: Can not fetch default settings from server"
      );
    }
  }

  if (formik.isSubmitting || isLoading) {
    return <FullScreenLoading />;
  }

  return (
    <div className={classes.root}>
      <div className={classes.innerWrapper}>
        <h1 className={classes.title}>Project settings</h1>
        <ConfigurationSection title="Flowser" className={classes.section}>
          <Card className={classes.card}>
            <TextField
              label="Project name"
              description="Give your project a cool name"
              path="name"
              formik={formik}
            />
            <TextField
              label="Project root path"
              description="Specify the filesystem path to your project"
              path="filesystemPath"
              formik={formik}
            />
          </Card>
        </ConfigurationSection>
        <ConfigurationSection
          title="Dev wallet"
          className={classes.section}
          toggleButtonTitle="Run dev wallet"
          isEnabled={formik.values.devWallet?.run}
          onToggleEnabled={(isEnabled) =>
            formik.setFieldValue("devWallet.run", isEnabled)
          }
          isToggleable
        >
          <Card className={classes.card}>
            <DevWalletTextField
              label="Port"
              path="port"
              description="Port to start the dev-wallet on"
              formik={formik}
            />
          </Card>
        </ConfigurationSection>
        <ConfigurationSection
          title="Emulator"
          className={classes.section}
          toggleButtonTitle="Run flow emulator"
          isEnabled={formik.values.emulator?.run}
          onToggleEnabled={(isEnabled) =>
            formik.setFieldValue("emulator.run", isEnabled)
          }
          isToggleable
        >
          <Card className={classes.card}>
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
              label="Service Public Key"
              path="servicePublicKey"
              description="Public key used for the service account"
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
          </Card>
          <Card className={classNames(classes.card, classes.radioCard)}>
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
          </Card>
          <Card className={classes.card}>
            <EmulatorToggleField
              label="Verbose"
              path="verboseLogging"
              description="Enable verbose logging"
              formik={formik}
            />
            <EmulatorToggleField
              label="Persist"
              path="persist"
              description="Enable persistence of the state between restarts"
              formik={formik}
            />
            <EmulatorToggleField
              label="Simple Addresses"
              path="simpleAddresses"
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
              label="Init"
              path="performInit"
              description="Generate and set a new service account"
              formik={formik}
            />
            <EmulatorToggleField
              label="Contracts"
              path="withContracts"
              description="Start with contracts like FUSD, NFT and an NFT Marketplace, when the emulator starts"
              formik={formik}
            />
          </Card>
        </ConfigurationSection>

        <div className={classes.footer}>
          <div>
            <Button
              className={classes.footerButton}
              onClick={() => removeProject(formik.values)}
              variant="middle"
              outlined={true}
              disabled={!id}
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
              href={`https://github.com/onflow/flow-cli/commit/${flowCliInfo?.commitHash}`}
              rel="noreferrer"
            >
              Emulator version: {flowCliInfo?.version || "-"}
            </a>
          </div>
        </div>
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

function DevWalletTextField({
  path,
  ...restProps
}: FieldProps & { path: keyof DevWallet }) {
  return <TextField path={`devWallet.${path}`} {...restProps} />;
}

function EmulatorTextField({
  path,
  ...restProps
}: FieldProps & { path: keyof Emulator }) {
  return <TextField path={`emulator.${path}`} {...restProps} />;
}

function EmulatorRadioField({
  path,
  ...restProps
}: RadioFieldProps & { path: keyof Emulator }) {
  return <RadioField path={`emulator.${path}`} {...restProps} />;
}

function EmulatorToggleField({
  path,
  ...restProps
}: FieldProps & { path: keyof Emulator }) {
  return <ToggleField path={`emulator.${path}`} {...restProps} />;
}
