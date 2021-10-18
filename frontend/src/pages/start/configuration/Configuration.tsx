import React, { FunctionComponent, useCallback } from 'react';
import classes from './Configuration.module.scss';
import Input from '../../../shared/components/input/Input';
import ToggleButton from '../../../shared/components/toggle-button/ToggleButton';
import RadioButton from '../../../shared/components/radio-button/RadioButton';
import { ReactComponent as IconBackButton } from '../../../shared/assets/icons/back-button.svg';
import Card from '../../../shared/components/card/Card';
import { useHistory } from 'react-router-dom';
import Label from '../../../shared/components/label/Label';
import Button from '../../../shared/components/button/Button';
import { routes } from '../../../shared/constants/routes';

const Configuration: FunctionComponent<any> = () => {
    const history = useHistory();

    const onChange = (checked: boolean) => {
        console.log('checked', checked);
    };

    const onBack = useCallback(() => {
        history.goBack();
    }, []);

    const onSaveAndRun = () => {
        console.log('onSaveAndRun');
        history.push(`/${routes.firstRouteAfterStart}`);
    };
    const onDelete = () => {
        console.log('onDelete');
    };

    return (
        <div className={classes.root}>
            <div className={classes.inner}>
                <IconBackButton className={classes.backButton} onClick={onBack} />
                <div className={classes.top}>
                    <h2>EMULATOR CONFIGURATION</h2>
                </div>
                <Card className={classes.bottom}>
                    <div className={classes.bottom1}>
                        <Label variant="xlarge">Configuration Name:</Label>

                        <div className={classes.nameInput}>
                            <input type="text" value="New emulator configuration #1" />
                        </div>
                    </div>
                    <div className={classes.bottom2}>
                        {/* LEFT */}
                        <div className={classes.left}>
                            <div className={classes.row}>
                                <span>Port</span>
                                <Input type="text" value="3569" />
                                <span>RPC port to listen on</span>
                            </div>

                            <div className={classes.row}>
                                <span>HTTP Port</span>
                                <Input type="text" value="8080" />
                                <span>HTTP port to listen on</span>
                            </div>

                            <div className={classes.row}>
                                <span>Block Time</span>
                                <Input type="text" value="0" />
                                <span>Time between sealed blocks. Valid units are: ns, us (or µs), ms, s, m or h</span>
                            </div>

                            <div className={classes.row}>
                                <span>Service Private Key</span>
                                <Input type="text" value="" />
                                <span>Private key used for the service account</span>
                            </div>

                            <div className={classes.row}>
                                <span>Service Public Key</span>
                                <Input type="text" value="" />
                                <span>Public key used for the service account</span>
                            </div>

                            <div className={classes.row}>
                                <span>Database Path</span>
                                <Input type="text" value="./flowdb" />
                                <span>Specify path for the database file persisting the state</span>
                            </div>

                            <div className={classes.row}>
                                <span>Token supply</span>
                                <Input type="text" value="1000000000.0" />
                                <span>Initial FLOW token supply</span>
                            </div>

                            <div className={classes.row}>
                                <span>Transaction Expiry</span>
                                <Input type="text" value="10" />
                                <span>Transaction expiry, measured in blocks</span>
                            </div>

                            <div className={classes.row}>
                                <span>Storage Per Flow</span>
                                <Input type="text" value="" />
                                <span>
                                    Specify size of the storage in MB for each FLOW in account balance. Default value
                                    from the flow-go
                                </span>
                            </div>

                            <div className={classes.row}>
                                <span>Minimum Account Balance</span>
                                <Input type="text" value="" />
                                <span>
                                    Specify minimum balance the account must have. Default value from the flow-go
                                </span>
                            </div>

                            <div className={classes.row}>
                                <span>Transaction Max Gas Limit</span>
                                <Input type="text" value="9999" />
                                <span>Maximum gas limit for transactions</span>
                            </div>

                            <div className={classes.row}>
                                <span>Script Gas Limit</span>
                                <Input type="text" value="100000" />
                                <span>Specify gas limit for script execution</span>
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
                                        <RadioButton checked={true} onChange={() => false} />
                                    </div>
                                    <div>
                                        <span>ECDSA_secp256k1</span>
                                        <RadioButton checked={false} onChange={() => false} />
                                    </div>
                                    <div>
                                        <span>BLS_BLS_12_381</span>
                                        <RadioButton checked={false} onChange={() => true} />
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
                                        <RadioButton checked={false} onChange={() => false} />
                                    </div>
                                    <div>
                                        <span>SHA2_384</span>
                                        <RadioButton checked={true} onChange={() => false} />
                                    </div>
                                    <div>
                                        <span>SHA3_256</span>
                                        <RadioButton checked={false} onChange={() => true} />
                                    </div>
                                    <div>
                                        <span>SHA3_384</span>
                                        <RadioButton checked={false} onChange={() => false} />
                                    </div>
                                    <div>
                                        <span>KMAC128_BLS_BLS12_381</span>
                                        <RadioButton checked={false} onChange={() => false} />
                                    </div>
                                </div>
                            </div>
                            <div className={classes.secondPart}>
                                <div className={classes.row}>
                                    <span>Verbose</span>
                                    <div>
                                        <span>False</span>
                                        <ToggleButton value={true} />
                                        <span>True</span>
                                    </div>
                                    <span>Enable verbose logging (useful for debugging)</span>
                                </div>
                                <div className={classes.row}>
                                    <span>Persist</span>
                                    <div>
                                        <span>False</span>
                                        <ToggleButton value={true} />
                                        <span>True</span>
                                    </div>
                                    <span>Enable persistence of the state between restarts</span>
                                </div>
                                <div className={classes.row}>
                                    <span>Simple Addresses</span>
                                    <div>
                                        <span>False</span>
                                        <ToggleButton value={true} />
                                        <span>True</span>
                                    </div>
                                    <span>Use sequential addresses starting with 0x1</span>
                                </div>
                                <div className={classes.row}>
                                    <span>Storage Limit</span>
                                    <div>
                                        <span>False</span>
                                        <ToggleButton value={true} />
                                        <span>True</span>
                                    </div>
                                    <span>Enable account storage limit</span>
                                </div>
                                <div className={classes.row}>
                                    <span>Transaction Fees</span>
                                    <div>
                                        <span>False</span>
                                        <ToggleButton value={true} />
                                        <span>True</span>
                                    </div>
                                    <span>Enable transaction fees</span>
                                </div>
                            </div>
                            <div className={classes.buttons}>
                                <Button onClick={onDelete} variant="middle" outlined={true} disabled={true}>
                                    DELETE
                                </Button>
                                <Button onClick={onSaveAndRun} variant="middle">
                                    SAVE & RUN
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Configuration;
