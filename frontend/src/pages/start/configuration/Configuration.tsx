import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useHistory, useParams } from "react-router-dom";

import copy from "copy-to-clipboard";
import Joi from "joi";
import classes from "./Configuration.module.scss";
import Input from "../../../shared/components/input/Input";
import ToggleButton from "../../../shared/components/toggle-button/ToggleButton";
import RadioButton from "../../../shared/components/radio-button/RadioButton";
import { ReactComponent as IconBackButton } from "../../../shared/assets/icons/back-button.svg";
import Card from "../../../shared/components/card/Card";
import Label from "../../../shared/components/label/Label";
import Button from "../../../shared/components/button/Button";
import { routes } from "../../../shared/constants/routes";
import { useProjectApi } from "../../../shared/hooks/project-api";
import ConfirmDialog from "../../../shared/components/confirm-dialog/ConfirmDialog";
import FullScreenLoading from "../../../shared/components/fullscreen-loading/FullScreenLoading";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";
import splitbee from "@splitbee/web";

const formSchema = Joi.object()
  .keys({
    name: Joi.string()
      .min(3)
      .max(100)
      .pattern(new RegExp("^[a-zA-Z0-9 ]+$"))
      .required()
      .messages({
        "string.pattern.base":
          "Only letters, numbers and white spaces are allowed",
      }),
    rpcServerPort: Joi.number().integer().greater(1000).less(10000).required(),
    httpServerPort: Joi.number().integer().greater(1000).less(10000).required(),
    // blockTime: Joi.string().pattern(new RegExp('(^[1-9][0-9]*(ns|us|µs|ms|s|m|h)$)|(^0{1}$)')),
    blockTime: Joi.alternatives().try(
      Joi.string().pattern(
        new RegExp("(^[1-9][0-9]*(ns|us|µs|ms|s|m|h)$)|(^0{1}$)")
      ),
      Joi.number().greater(-1).less(1)
    ),
    tokenSupply: Joi.number().integer().positive().required(),
    transactionExpiry: Joi.number().integer().positive().required(),
    transactionMaxGasLimit: Joi.number().integer().positive().required(),
    scriptGasLimit: Joi.number().integer().positive().required(),
    numberOfInitialAccounts: Joi.number().integer().greater(-1).required(),
  })
  .unknown(true);

const Configuration: FunctionComponent<any> = ({ props }) => {
  const [formState, setFormState] = useState<any>({});
  const [validation, setValidation] = useState(formSchema.validate(formState));
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingText, setLoadingText] = useState("loading");
  const [showDialog, setShowDialog] = useState(false);
  const { data: flowVersionInfo } = useQuery<any>("/api/flow/version");

  const history = useHistory();
  const { id } = useParams<any>();
  const {
    getDefaultConfiguration,
    saveConfiguration,
    updateConfiguration,
    useProject,
    deleteProject,
    getProjectDetails,
  } = useProjectApi();

  useEffect(() => {
    async function init() {
      let response;
      try {
        if (id) {
          response = await getProjectDetails(id);
          if (!response.data) {
            throw Error("No data");
          }
          setFormState({ ...response.data.emulator, name: response.data.name });
        } else {
          response = await getDefaultConfiguration();
          setFormState(response.data);
        }
      } catch (e) {
        if (id) {
          setError(
            `Something went wrong: Can not load emulator settings from server`
          );
        } else {
          setError(
            "Something went wrong: Can not fetch default settings from server"
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    setValidation(formSchema.validate(formState));
  }, [formState]);

  const onFormFieldChange = (name: string, value: any) => {
    setFormState((state: any) => ({ ...state, [name]: value }));
  };

  const getValidationError = useCallback(
    (formField: string) => {
      if (isLoading || !validation.error) {
        return "";
      } else {
        const error = validation.error.details.find(
          (detail) => detail.context?.key === formField
        );
        return error?.message || "";
      }
    },
    [validation]
  );

  const handleSubmit = async (event: React.FormEvent) => {
    let response;
    setError("");
    event.preventDefault();

    if (id) {
      response = await updateExistingEmulator();
    } else {
      response = await createNewEmulator();
    }

    if (!response) {
      window.scrollTo(0, 0);
      return;
    }

    toast("Configuration saved successfully!");
    setIsSubmitting(true);

    try {
      await useProject(response.data.id);
    } catch (e: any) {
      setError(
        `Something went wrong, ` + e.error ||
          e.message ||
          " can not run emulator"
      );
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return false;
    }
    history.replace(`/${routes.firstRouteAfterStart}`);
  };

  const createNewEmulator = async () => {
    let response: any;
    const name = formState.name;
    const configuration = {
      isCustom: true,
      name,
      emulator: formState,
      gateway: {
        port: formState.httpServerPort,
        address: "http://127.0.0.1",
      },
    };
    try {
      response = await saveConfiguration(configuration);
      splitbee.track("Configuration: create");
    } catch (e: any) {
      setError(`Can not save the configuration. ${e.message}`);
    }

    return response;
  };

  const updateExistingEmulator = async () => {
    let response;
    const name = formState.name;
    const configuration = {
      id,
      name,
      emulator: formState,
      gateway: {
        port: formState.httpServerPort,
        address: "http://127.0.0.1",
      },
    };

    try {
      response = await updateConfiguration(id, configuration);
      splitbee.track("Configuration: update");
    } catch (e: any) {
      setError(`Can not update the configuration. ${e.message}`);
    }
    return response;
  };

  const onBack = useCallback(() => {
    history.goBack();
  }, []);

  const onDelete = async (event: any) => {
    event.preventDefault();
    setLoadingText("Deleting ...");
    setIsLoading(true);

    try {
      await deleteProject(id);
      toast(`Project "${formState.name}" deleted!`);
      onBack();
      splitbee.track("Configuration: delete");
    } catch (e) {
      setIsLoading(false);
      setError("Something went wrong: can not delete custom emulator");
    }
  };

  const copyAccountConfig = (event: any) => {
    event.preventDefault();
    copy(`"emulator-account": {
    "address": "${formState.serviceAddress}",
    "key": "${formState.servicePrivateKey}"
}`);
    toast("Service account config copied to clipboard!");
  };

  const closeDialog = () => {
    setShowDialog(false);
  };

  const openDialog = (event: any) => {
    event.preventDefault();
    setShowDialog(true);
  };

  if (isSubmitting) {
    return <FullScreenLoading className={classes.loader} />;
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
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
              {error && (
                <div className={classes.errors}>
                  <span>{error}</span>
                </div>
              )}
              <div className={classes.bottom1}>
                <Label variant="xlarge">Configuration Name:</Label>

                <div className={classes.nameInput}>
                  <input
                    type="text"
                    value={formState.name || ""}
                    onChange={(e) => onFormFieldChange("name", e.target.value)}
                  />
                </div>
                {getValidationError("name") && (
                  <span className={classes.errorMessage}>
                    {getValidationError("name")}
                  </span>
                )}
              </div>
              <div className={classes.bottom2}>
                {/* LEFT */}
                <div className={classes.left}>
                  <div className={classes.row}>
                    <span>Port</span>
                    <Input
                      type="text"
                      disabled
                      value={formState.rpcServerPort}
                      onChange={(e) =>
                        onFormFieldChange("rpcServerPort", e.target.value)
                      }
                    />
                    {getValidationError("rpcServerPort") ? (
                      <span className={classes.errorMessage}>
                        Provide a valid port number
                      </span>
                    ) : (
                      <span>RPC port to listen on</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>HTTP Port</span>
                    <Input
                      type="text"
                      disabled
                      value={formState.httpServerPort}
                      onChange={(e) =>
                        onFormFieldChange("httpServerPort", e.target.value)
                      }
                    />
                    {getValidationError("httpServerPort") ? (
                      <span className={classes.errorMessage}>
                        Provide a valid port number
                      </span>
                    ) : (
                      <span>HTTP port to listen on</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Service address</span>
                    <Input
                      type="text"
                      value={formState.serviceAddress}
                      disabled
                    />
                    <span>Service account address</span>
                  </div>

                  <div className={classes.row}>
                    <span>Service Private Key</span>
                    <Input
                      type="text"
                      disabled
                      value={formState.servicePrivateKey}
                      onChange={(e) =>
                        onFormFieldChange("servicePrivateKey", e.target.value)
                      }
                    />
                    <span>Private key used for the service account</span>
                  </div>

                  <div className={classes.row}>
                    <span>Service Public Key</span>
                    <Input
                      type="text"
                      disabled
                      value={formState.servicePublicKey}
                      onChange={(e) =>
                        onFormFieldChange("servicePublicKey", e.target.value)
                      }
                    />
                    <span>Public key used for the service account</span>
                  </div>

                  <div className={classes.row}>
                    <span>Block Time</span>
                    <Input
                      type="text"
                      value={formState.blockTime}
                      onChange={(e) =>
                        onFormFieldChange("blockTime", e.target.value)
                      }
                    />
                    {getValidationError("blockTime") ? (
                      <span className={classes.errorMessage}>
                        Valid block time is required or zero. Valid units are:
                        ns, us (or µs), ms, s, m or h
                      </span>
                    ) : (
                      <span>
                        Time between sealed blocks. Valid units are: ns, us (or
                        µs), ms, s, m or h
                      </span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Database Path</span>
                    <Input
                      type="text"
                      value={formState.databasePath}
                      onChange={(e) =>
                        onFormFieldChange("databasePath", e.target.value)
                      }
                    />
                    {getValidationError("databasePath") ? (
                      <span className={classes.errorMessage}>
                        Database Path is required
                      </span>
                    ) : (
                      <span>
                        Specify path for the database file persisting the state
                      </span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Token supply</span>
                    <Input
                      type="text"
                      value={formState.tokenSupply}
                      onChange={(e) =>
                        onFormFieldChange("tokenSupply", e.target.value)
                      }
                    />
                    {getValidationError("tokenSupply") ? (
                      <span className={classes.errorMessage}>
                        Token Supply is required
                      </span>
                    ) : (
                      <span>Initial FLOW token supply</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Transaction Expiry</span>
                    <Input
                      type="text"
                      value={formState.transactionExpiry}
                      onChange={(e) =>
                        onFormFieldChange("transactionExpiry", e.target.value)
                      }
                    />
                    {getValidationError("transactionExpiry") ? (
                      <span className={classes.errorMessage}>
                        Transaction Expiry is required
                      </span>
                    ) : (
                      <span>Transaction expiry, measured in blocks</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Storage Per Flow</span>
                    <Input
                      type="text"
                      value={formState.storagePerFlow}
                      onChange={(e) =>
                        onFormFieldChange("storagePerFlow", e.target.value)
                      }
                    />
                    <span>
                      Specify size of the storage in MB for each FLOW in account
                      balance. Default value from the flow-go
                    </span>
                  </div>

                  <div className={classes.row}>
                    <span>Minimum Account Balance</span>
                    <Input
                      type="text"
                      value={formState.minAccountBalance}
                      onChange={(e) =>
                        onFormFieldChange("minAccountBalance", e.target.value)
                      }
                    />
                    <span>
                      Specify minimum balance the account must have. Default
                      value from the flow-go
                    </span>
                  </div>

                  <div className={classes.row}>
                    <span>Transaction Max Gas Limit</span>
                    <Input
                      type="text"
                      value={formState.transactionMaxGasLimit}
                      onChange={(e) =>
                        onFormFieldChange(
                          "transactionMaxGasLimit",
                          e.target.value
                        )
                      }
                    />
                    {getValidationError("transactionMaxGasLimit") ? (
                      <span className={classes.errorMessage}>
                        Transaction Max Gas Limit is required
                      </span>
                    ) : (
                      <span>Maximum gas limit for transactions</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Script Gas Limit</span>
                    <Input
                      type="text"
                      value={formState.scriptGasLimit}
                      onChange={(e) =>
                        onFormFieldChange("scriptGasLimit", e.target.value)
                      }
                    />
                    {getValidationError("scriptGasLimit") ? (
                      <span className={classes.errorMessage}>
                        Script Gas Limit is required
                      </span>
                    ) : (
                      <span>Specify gas limit for script execution</span>
                    )}
                  </div>

                  <div className={classes.row}>
                    <span>Initial accounts</span>
                    <Input
                      type="text"
                      value={formState.numberOfInitialAccounts}
                      onChange={(e) =>
                        onFormFieldChange(
                          "numberOfInitialAccounts",
                          e.target.value
                        )
                      }
                    />
                    {getValidationError("numberOfInitialAccounts") ? (
                      <span className={classes.errorMessage}>
                        There must be at least 1 initial account.
                      </span>
                    ) : (
                      <span>
                        Specify number of additional accounts created besides
                        the service account.
                      </span>
                    )}
                  </div>
                </div>
                {/* RIGHT */}
                <div className={classes.right}>
                  <div className={classes.firstPart}>
                    <div>
                      <div>
                        <h6>
                          Service Signature Algorithm
                          <span>Service account key signature algorithm</span>
                        </h6>
                      </div>
                      <div>
                        <span>ECDSA_P256</span>
                        <RadioButton
                          checked={
                            formState.serviceSignatureAlgorithm === "ECDSA_P256"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceSignatureAlgorithm",
                              "ECDSA_P256"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>ECDSA_secp256k1</span>
                        <RadioButton
                          checked={
                            formState.serviceSignatureAlgorithm ===
                            "ECDSA_secp256k1"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceSignatureAlgorithm",
                              "ECDSA_secp256k1"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>BLS_BLS_12_381</span>
                        <RadioButton
                          checked={
                            formState.serviceSignatureAlgorithm ===
                            "BLS_BLS_12_381"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceSignatureAlgorithm",
                              "BLS_BLS_12_381"
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <div>
                        <h6>
                          Service Hash Algorithm
                          <span>Service account key hash algorithm</span>
                        </h6>
                      </div>
                      <div>
                        <span>SHA2_256</span>
                        <RadioButton
                          checked={
                            formState.serviceHashAlgorithm === "SHA2_256"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceHashAlgorithm",
                              "SHA2_256"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>SHA2_384</span>
                        <RadioButton
                          checked={
                            formState.serviceHashAlgorithm === "SHA2_384"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceHashAlgorithm",
                              "SHA2_384"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>SHA3_256</span>
                        <RadioButton
                          checked={
                            formState.serviceHashAlgorithm === "SHA3_256"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceHashAlgorithm",
                              "SHA3_256"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>SHA3_384</span>
                        <RadioButton
                          checked={
                            formState.serviceHashAlgorithm === "SHA3_384"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceHashAlgorithm",
                              "SHA3_384"
                            )
                          }
                        />
                      </div>
                      <div>
                        <span>KMAC128_BLS_BLS12_381</span>
                        <RadioButton
                          checked={
                            formState.serviceHashAlgorithm ===
                            "KMAC128_BLS_BLS12_381"
                          }
                          onChange={(e) =>
                            onFormFieldChange(
                              "serviceHashAlgorithm",
                              "KMAC128_BLS_BLS12_381"
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className={classes.secondPart}>
                    <div className={classes.row}>
                      <span>Verbose</span>
                      <div>
                        <span>False</span>
                        <ToggleButton
                          value={formState.verboseLogging === true}
                          onChange={(state) =>
                            onFormFieldChange("verboseLogging", state)
                          }
                        />
                        <span>True</span>
                      </div>
                      <span>Enable verbose logging (useful for debugging)</span>
                    </div>
                    <div className={classes.row}>
                      <span>Persist</span>
                      <div>
                        <span>False</span>
                        <ToggleButton
                          value={formState.persist === true}
                          onChange={(state) =>
                            onFormFieldChange("persist", state)
                          }
                        />
                        <span>True</span>
                      </div>
                      <span>
                        Enable persistence of the state between restarts
                      </span>
                    </div>
                    <div className={classes.row}>
                      <span>Simple Addresses</span>
                      <div>
                        <span>False</span>
                        <ToggleButton
                          value={formState.simpleAddresses === true}
                          onChange={(state) =>
                            onFormFieldChange("simpleAddresses", state)
                          }
                        />
                        <span>True</span>
                      </div>
                      <span>Use sequential addresses starting with 0x1</span>
                    </div>
                    <div className={classes.row}>
                      <span>Storage Limit</span>
                      <div>
                        <span>False</span>
                        <ToggleButton
                          value={formState.storageLimit === true}
                          onChange={(state) =>
                            onFormFieldChange("storageLimit", state)
                          }
                        />
                        <span>True</span>
                      </div>
                      <span>Enable account storage limit</span>
                    </div>
                    <div className={classes.row}>
                      <span>Transaction Fees</span>
                      <div>
                        <span>False</span>
                        <ToggleButton
                          value={formState.transactionFees === true}
                          onChange={(state) =>
                            onFormFieldChange("transactionFees", state)
                          }
                        />
                        <span>True</span>
                      </div>
                      <span>Enable transaction fees</span>
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
                      <Button
                        variant="middle"
                        type="submit"
                        disabled={validation.error !== undefined}
                      >
                        SAVE & RUN
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className={classes.versionWrapper}>
                <a
                  target="_blank"
                  href={`https://github.com/onflow/flow-cli/commit/${flowVersionInfo?.data?.commit}`}
                  rel="noreferrer"
                >
                  Emulator version: {flowVersionInfo?.data?.version || "-"}
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

export default Configuration;
