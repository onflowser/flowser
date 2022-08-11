import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory, useParams } from "react-router-dom";

import { useFormik } from "formik";
import classes from "./Configuration.module.scss";
import Input from "../../../components/input/Input";
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
import {
  Emulator,
  Gateway,
  Project,
} from "@flowser/types/generated/entities/projects";
import { CommonUtils } from "../../../utils/common-utils";
import { FormikErrors } from "formik/dist/types";
import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";
import { FlowUtils } from "../../../utils/flow-utils";

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
    // TODO(milestone-3): add project schema validation
    initialValues: Project.fromPartial({
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
        toast.error(`Something went wrong, cannot run emulator`);
        window.scrollTo(0, 0);
      }
    },
  });

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
        formik.setValues(existingProject);
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
        formik.setValues(defaultProject);
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

  const copyAccountConfig = (event: any) => {
    event.preventDefault();
    // TODO(milestone-3): build & copy config
    // copy(`"emulator-account": {
    //   "address": "${formState?.serviceAddress}",
    //   "key": "${formState?.servicePrivateKey}"
    // }`);
    // toast("Service account config copied to clipboard!");
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

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <div className={classes.root}>
          <div className={classes.inner}>
            <IconBackButton className={classes.backButton} onClick={onBack} />
            <div className={classes.top}>
              <h2>EMULATOR CONFIGURATION</h2>
            </div>
            <Card
              className={classes.bottom}
              loading={isLoading}
              loadingText={loadingText}
            >
              <div className={classes.bottom1}>
                <Label variant="xlarge">Configuration Name:</Label>

                <div className={classes.nameInput}>
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
              <div className={classes.bottom2}>
                <div className={classes.left}>
                  <div className={classes.row}>
                    <Field
                      label="RPC Port"
                      path="emulator.rpcServerPort"
                      description="RPC port to listen on"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="HTTP Port"
                      path="emulator.httpServerPort"
                      description="HTTP port to listen on"
                      formik={formik}
                    />
                  </div>

                  {/* TODO(milestone-3): Provide service address config */}
                  {/*<div className={classes.row}>*/}
                  {/*  <span>Service address</span>*/}
                  {/*  <Input*/}
                  {/*    type="text"*/}
                  {/*    value={formState.serviceAddress}*/}
                  {/*    disabled*/}
                  {/*  />*/}
                  {/*  <span>Service account address</span>*/}
                  {/*</div>*/}

                  <div className={classes.row}>
                    <Field
                      label="Service Private Key"
                      path="emulator.servicePrivateKey"
                      description="Private key of the service account"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Service Public Key"
                      path="emulator.servicePublicKey"
                      description="Public key of the service account"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Block time"
                      path="emulator.blockTime"
                      description="Time between sealed blocks. Valid units are: ns, us (or µs), ms, s, m or h"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Database path"
                      path="emulator.databasePath"
                      description="Specify path for the database file persisting the state"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Token supply"
                      path="emulator.tokenSupply"
                      description="Initial FLOW token supply"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Transaction Expiry"
                      path="emulator.transactionExpiry"
                      description="Transaction expiry, measured in blocks"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Transaction Expiry"
                      path="emulator.storagePerFlow"
                      description="Specify size of the storage in MB for each FLOW in account balance. Default value from the flow-go"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Minimum Account Balance"
                      path="emulator.minAccountBalance"
                      description="Specify minimum balance the account must have. Default value from the flow-go"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Transaction Max Gas Limit"
                      path="emulator.transactionMaxGasLimit"
                      description="Maximum gas limit for transactions"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Script Gas Limit"
                      path="emulator.scriptGasLimit"
                      description="Specify gas limit for script execution"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.row}>
                    <Field
                      label="Initial accounts"
                      path="emulator.numberOfInitialAccounts"
                      description="Specify number of initial accounts"
                      formik={formik}
                    />
                  </div>

                  <div className={classes.right}>
                    <div className={classes.firstPart}>
                      <RadioField
                        label="Service Signature Algorithm"
                        path="emulator.serviceSignatureAlgorithm"
                        formik={formik}
                        options={getSignatureAlgorithmRadioOptions([
                          SignatureAlgorithm.ECDSA_P256,
                          SignatureAlgorithm.ECDSA_secp256k1,
                          SignatureAlgorithm.BLS_BLS12_381,
                        ])}
                      />
                      <RadioField
                        label="Service Hash Algorithm"
                        path="emulator.serviceHashAlgorithm"
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
                    <div className={classes.secondPart}>
                      <div className={classes.row}>
                        <ToggleField
                          label="Verbose"
                          path="emulator.verboseLogging"
                          description="Enable verbose logging"
                          formik={formik}
                        />
                      </div>
                      <div className={classes.row}>
                        <ToggleField
                          label="Persist"
                          path="emulator.persist"
                          description="Enable persistence of the state between restarts"
                          formik={formik}
                        />
                      </div>
                      <div className={classes.row}>
                        <ToggleField
                          label="Simple Addresses"
                          path="emulator.simpleAddresses"
                          description="Use sequential addresses starting with 0x1"
                          formik={formik}
                        />
                      </div>
                      <div className={classes.row}>
                        <ToggleField
                          label="Storage Limit"
                          path="emulator.storageLimit"
                          description="Enable account storage limit"
                          formik={formik}
                        />
                      </div>
                      <div className={classes.row}>
                        <ToggleField
                          label="Transaction Fees"
                          path="emulator.transactionFees"
                          description="Enable transaction fees"
                          formik={formik}
                        />
                      </div>
                    </div>
                    <div className={classes.buttons}>
                      <div>
                        <Button
                          onClick={copyAccountConfig}
                          variant="middle"
                          outlined={true}
                          style={{ width: 150 }}
                        >
                          COPY SERVICE CONFIG
                        </Button>
                      </div>
                      <div>
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
                  </div>
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

type FieldProps = {
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

function Field({ label, description, formik, path }: FieldProps) {
  const error = CommonUtils.getNestedValue(formik.errors, path) as string;
  return (
    <>
      {label && <span>{label}</span>}
      <Input
        type="text"
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
            checked={value === option.value}
            onChange={() => formik.setFieldValue(path, option.value)}
          />
        </div>
      ))}
    </div>
  );
}

function ToggleField({ label, description, formik, path }: FieldProps) {
  const value = CommonUtils.getNestedValue(formik.values, path) as boolean;

  return (
    <>
      <span>{label}</span>
      <div>
        <span>False</span>
        <ToggleButton
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
