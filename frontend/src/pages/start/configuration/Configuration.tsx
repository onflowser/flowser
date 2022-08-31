import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory, useParams } from "react-router-dom";

import { useFormik } from "formik";
import classes from "./Configuration.module.scss";
import Input, { InputProps } from "../../../components/input/Input";
import ToggleButton from "../../../components/toggle-button/ToggleButton";
import RadioButton from "../../../components/radio-button/RadioButton";
import { ReactComponent as IconBackButton } from "../../../assets/icons/back-button.svg";
import Card from "../../../components/card/Card";
import Label from "../../../components/label/Label";
import Button from "../../../components/button/Button";
import { routes } from "../../../constants/routes";
import ConfirmDialog from "../../../components/confirm-dialog/ConfirmDialog";
import FullScreenLoading from "../../../components/fullscreen-loading/FullScreenLoading";
import { toast } from "react-hot-toast";
import splitbee from "@splitbee/web";
import { ProjectsService } from "../../../services/projects.service";
import { useGetFlowCliInfo } from "../../../hooks/use-api";
import { DevWallet, Emulator, Gateway, Project } from "@flowser/shared";
import { CommonUtils } from "../../../utils/common-utils";
import { FormikErrors } from "formik/dist/types";
import { HashAlgorithm, SignatureAlgorithm } from "@flowser/shared";
import { FlowUtils } from "../../../utils/flow-utils";
import * as yup from "yup";

const projectSchema = yup.object().shape({
  name: yup.string().required("Required"),
  filesystemPath: yup.string().required("Required"),
});

const Configuration: FunctionComponent = () => {
  const projectService = ProjectsService.getInstance();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("loading");
  const [showDialog, setShowDialog] = useState(false);
  const { data: flowCliInfo } = useGetFlowCliInfo();
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
        await projectService.useProject(response.data.project!.id);
        history.replace(`/${routes.firstRouteAfterStart}`);
      } catch (e) {
        // TODO(milestone-3): better handle errors
        toast.error(`Something went wrong, cannot run emulator`);
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
      const existingProject = existingProjectData.data.project;
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
      const defaultProject = defaultProjectData.data.project;
      if (defaultProject) {
        formik.setValues(defaultProject, false);
      }
    } catch (e) {
      toast.error(
        "Something went wrong: Can not fetch default settings from server"
      );
    }
  }

  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  const onDelete = async (event: any) => {
    event.preventDefault();
    setLoadingText("Deleting ...");
    setIsLoading(true);

    try {
      splitbee.track("Configuration: delete");
      await projectService.removeProject(id);
      toast(`Project "${formik.values.name}" deleted!`);
      onBack();
    } catch (e) {
      toast.error("Something went wrong: can not delete custom emulator");
    }
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const openDialog = (event: any) => {
    event.preventDefault();
    setShowDialog(true);
  };

  if (formik.isSubmitting) {
    return <FullScreenLoading className={classes.loader} />;
  }

  function DevWalletTextField({
    path,
    ...restProps
  }: FieldProps & { path: keyof DevWallet }) {
    return (
      <TextField
        disabled={!formik.values.devWallet?.run}
        path={`devWallet.${path}`}
        {...restProps}
      />
    );
  }

  function DevWalletToggleField({
    path,
    diseblable = true,
    ...restProps
  }: FieldProps & { path: keyof DevWallet; diseblable?: boolean }) {
    return (
      <ToggleField
        disabled={!formik.values.devWallet?.run && diseblable}
        path={`devWallet.${path}`}
        {...restProps}
      />
    );
  }

  function EmulatorTextField({
    path,
    ...restProps
  }: FieldProps & { path: keyof Emulator }) {
    return (
      <TextField
        disabled={!formik.values.emulator?.run}
        path={`emulator.${path}`}
        {...restProps}
      />
    );
  }

  function EmulatorRadioField({
    path,
    ...restProps
  }: RadioFieldProps & { path: keyof Emulator }) {
    return (
      <RadioField
        disabled={!formik.values.emulator?.run}
        path={`emulator.${path}`}
        {...restProps}
      />
    );
  }

  function EmulatorToggleField({
    path,
    diseblable = true,
    ...restProps
  }: FieldProps & { path: keyof Emulator; diseblable?: boolean }) {
    return (
      <ToggleField
        disabled={!formik.values.emulator?.run && diseblable}
        path={`emulator.${path}`}
        {...restProps}
      />
    );
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className={classes.root}>
          <div className={classes.inner}>
            <IconBackButton className={classes.backButton} onClick={onBack} />
            <div className={classes.top}>
              <h2>PROJECT SETTINGS</h2>
            </div>

            <Card
              className={classes.card}
              loading={isLoading}
              loadingText={loadingText}
            >
              <div className={classes.section}>
                <div className={classes.projectNameSection}>
                  <Label variant="xlarge">Project Name:</Label>

                  <div className={classes.nameInputWrapper}>
                    <input
                      type="text"
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                    />
                  </div>
                  {formik.errors.name && (
                    <span className={classes.errorMessage}>
                      {formik.errors.name}
                    </span>
                  )}
                </div>
              </div>

              <h2 className={classes.sectionTitle}>Flowser settings</h2>
              <div className={classes.section}>
                <div className={classes.row}>
                  <TextField
                    label="Project root path"
                    description="Specify the filesystem path to your project"
                    path="filesystemPath"
                    formik={formik}
                  />
                </div>
              </div>

              <h2 className={classes.sectionTitle}>Dev Wallet settings</h2>
              <div className={classes.section}>
                <div className={classes.row}>
                  <DevWalletToggleField
                    label="Run dev-wallet"
                    path="run"
                    diseblable={false}
                    description="Start the dev-wallet server"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <DevWalletTextField
                    label="Port"
                    path="port"
                    description="Port to start the dev-wallet on"
                    formik={formik}
                  />
                </div>
              </div>

              <h2 className={classes.sectionTitle}>Emulator settings</h2>

              <div className={classes.section}>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Run emulator"
                    path="run"
                    diseblable={false}
                    description="Start the emulator"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="RPC Port"
                    path="grpcServerPort"
                    description="gRPC port to listen on"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="HTTP Port"
                    path="restServerPort"
                    description="REST API port to listen on"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Admin Port"
                    path="adminServerPort"
                    description="Admin API port to listen on"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Service Private Key"
                    path="servicePrivateKey"
                    description="Private key used for the service account"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Service Public Key"
                    path="servicePublicKey"
                    description="Public key used for the service account"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Block time"
                    path="blockTime"
                    description="Time between sealed blocks. Valid units are ns, us (or µs), ms, s, m, h"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Database path"
                    path="databasePath"
                    description="Specify path for the database file persisting the state"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Token supply"
                    path="tokenSupply"
                    description="Initial FLOW token supply"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Transaction Expiry"
                    path="transactionExpiry"
                    description="Transaction expiry, measured in blocks"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Transaction Expiry"
                    path="storagePerFlow"
                    description="Specify size of the storage in MB for each FLOW in account balance. Default value from the flow-go"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Minimum Account Balance"
                    path="minAccountBalance"
                    description="Specify minimum balance the account must have. Default value from the flow-go"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Transaction Max Gas Limit"
                    path="transactionMaxGasLimit"
                    description="Maximum gas limit for transactions"
                    formik={formik}
                  />
                </div>

                <div className={classes.row}>
                  <EmulatorTextField
                    label="Script Gas Limit"
                    path="scriptGasLimit"
                    description="Specify gas limit for script execution"
                    formik={formik}
                  />
                </div>
              </div>

              <div className={classes.section}>
                <div className={classes.radioInputs}>
                  <EmulatorRadioField
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
                </div>
              </div>

              <div className={classes.section}>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Verbose"
                    path="verboseLogging"
                    description="Enable verbose logging"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Persist"
                    path="persist"
                    description="Enable persistence of the state between restarts"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Simple Addresses"
                    path="simpleAddresses"
                    description="Use sequential addresses starting with 0x1"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Storage Limit"
                    path="storageLimit"
                    description="Enable account storage limit"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Transaction Fees"
                    path="transactionFees"
                    description="Enable transaction fees"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Init"
                    path="performInit"
                    description="Generate and set a new service account"
                    formik={formik}
                  />
                </div>
                <div className={classes.row}>
                  <EmulatorToggleField
                    label="Contracts"
                    path="withContracts"
                    description="Start with contracts like FUSD, NFT and an NFT Marketplace, when the emulator starts"
                    formik={formik}
                  />
                </div>
              </div>

              <div className={classes.section}>
                <div className={classes.footerButtons}>
                  <Button
                    onClick={openDialog}
                    variant="middle"
                    outlined={true}
                    disabled={!id}
                  >
                    DELETE
                  </Button>
                  <Button variant="middle" type="submit">
                    SAVE & RUN
                  </Button>
                </div>
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
            </Card>
          </div>
        </div>
      </form>
      {showDialog && (
        <ConfirmDialog
          onClose={closeDialog}
          onConfirm={onDelete}
          confirmBtnLabel="DELETE"
          cancelBtnLabel="BACK"
        >
          <h3>Delete emulator</h3>
          <span>Are you sure you want to delete this emulator?</span>
        </ConfirmDialog>
      )}
    </>
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

type FieldProps = Pick<InputProps, "type" | "disabled"> & {
  label?: string;
  description?: string;
  path: string;
  formik: {
    handleChange: (e: React.ChangeEvent) => void;
    values: Project;
    errors: FormikErrors<Project>;
    setFieldValue: (
      field: string,
      value: unknown,
      shouldValidate?: boolean
    ) => void;
  };
};

function TextField({
  label,
  description,
  formik,
  path,
  ...inputProps
}: FieldProps) {
  const error = CommonUtils.getNestedValue(formik.errors, path) as string;
  return (
    <>
      {label && <span>{label}</span>}
      <Input
        {...inputProps}
        name={path}
        value={CommonUtils.getNestedValue(formik.values, path) as string}
        onChange={formik.handleChange}
      />
      {error ? (
        <span className={classes.errorMessage}>{error}</span>
      ) : (
        description && <span>{description}</span>
      )}
    </>
  );
}

type RadioFieldProps = FieldProps & {
  options: RadioFieldOption[];
};

type RadioFieldOption = {
  label: string;
  value: string | number;
};

function RadioField({
  label,
  description,
  formik,
  path,
  options,
  disabled,
}: RadioFieldProps) {
  const value = CommonUtils.getNestedValue(formik.values, path);

  return (
    <div>
      <div>
        <h6>
          {label}
          <span>{description}</span>
        </h6>
      </div>
      {options.map((option) => (
        <div key={option.value}>
          <span>{option.label}</span>
          <RadioButton
            disabled={disabled}
            checked={value === option.value}
            onChange={() => formik.setFieldValue(path, option.value)}
          />
        </div>
      ))}
    </div>
  );
}

function ToggleField({
  label,
  description,
  formik,
  path,
  disabled,
}: FieldProps) {
  const value = CommonUtils.getNestedValue(formik.values, path) as boolean;

  return (
    <>
      <span>{label}</span>
      <div className={classes.toggleButton}>
        <span>False</span>
        <ToggleButton
          disabled={disabled}
          value={value}
          onChange={(state) => formik.setFieldValue(path, state)}
        />
        <span>True</span>
      </div>
      <span>{description}</span>
    </>
  );
}

export default Configuration;
