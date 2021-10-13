import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import classes from './Logs.module.scss';
import Search from '../../shared/components/search/Search';
import { ReactComponent as ExpandIcon } from '../../shared/assets/icons/expand.svg';
import { ReactComponent as ShrinkIcon } from '../../shared/assets/icons/shrink.svg';
import { ReactComponent as LogsIcon } from '../../shared/assets/icons/logs.svg';
import { LogDrawerSize, useLogDrawer } from '../../shared/hooks/log-drawer';
import CaretIcon from '../../shared/components/caret-icon/CaretIcon';
import { useSyntaxHighlighter } from '../../shared/hooks/syntax-highlighter';

interface OwnProps {
    className?: any;
}

type Props = OwnProps;

const Logs: FunctionComponent<Props> = ({ className }) => {
    const { logDrawerSize, setSize } = useLogDrawer();
    const { highlightLogKeywords } = useSyntaxHighlighter();
    const miniLogRef = useRef(null);
    const bigLogRef = useRef(null);

    const data = [
        'INFO[0000] ⚙️ Using service account 0xf8d6e0586b0a20c7 serviceAddress=f8d6e0586b0a20c7 serviceHashAlgo=SHA3_256 servicePrivKey=e6c6be81fb7e8d7cd465a2cf6819bbfc385b5a573ccd6ab2d3e6d3b854016d93 servicePubKey=c5abc7c325bf74ee226afbf874b86e40a890f2f29b446bb35e293b811cd54768a072c5313308d7277619110797ae756ae628e908abf54cd8f162e2d9f3e201bc serviceSigAlgo=ECDSA_P256',
        'INFO[0000] 📜 Flow contracts FlowFees=0xe5a8b7f23e8b548f FlowServiceAccount=0xf8d6e0586b0a20c7 FlowStorageFees=0xf8d6e0586b0a20c7 FlowToken=0x0ae53cb6e3f42a79 FungibleToken=0xee82856bf20e2aa6',
        'INFO[0000] 🌱 Starting gRPC server on port 3569 port=3569',
        'INFO[0000] 🌱 Starting HTTP server on port 8080 port=8080',
        'DEBU[0004] 🎁 GetLatestBlock called blockHeight=0 blockID=7bc42fe85d32ca513769a74f97f7e1a7bad6c9407f0d934c2aa645ef9cf613c7',
        'DEBU[0004] 👤 GetAccountAtLatestBlock called address=f8d6e0586b0a20c7',
        'DEBU[0004] ✉️ Transaction submitted txID=fed30466e0c0c6a17218771eed1fc6da132909dcd0fe06738b48026d837a3047',
        'INFO[0004] ⭐ Transaction executed txID=fed30466e0c0c6a17218771eed1fc6da132909dcd0fe06738b48026d837a3047',
        'INFO[0000] ⚙️   Using service account 0xf8d6e0586b0a20c7  serviceAddress=f8d6e0586b0a20c7 serviceHashAlgo=SHA3_256 servicePrivKey=feacb599c6070f0a5d32ff834d57467f83646908a68c17a1fb7aad918db873d2 servicePubKey=ee69a34c1a8c4fdc5d55bd1a78174ef1fd5f579243ecb032672cbb23845973d4b8c393078807b820dcf6a4573dbca61dcfffc2ceca1af3d2bc03eac31fdbe67c serviceSigAlgo=ECDSA_P256',
        'INFO[0000] 📜  Flow contracts                             FlowFees=0xe5a8b7f23e8b548f FlowServiceAccount=0xf8d6e0586b0a20c7 FlowStorageFees=0xf8d6e0586b0a20c7 FlowToken=0x0ae53cb6e3f42a79 FungibleToken=0xee82856bf20e2aa6',
        'INFO[0000] 🌱  Starting gRPC server on port 3569          port=3569',
        'INFO[0000] 🌱  Starting HTTP server on port 8080          port=8080',
        'INFO[0006] ⭐  Transaction executed                       txID=00d6fada7b4b05cc22e13d4022d5ec88789c70d65a13b093d16a2e580accb3df',
        'INFO[0006] ⭐  Transaction executed                       txID=c4c72d93d33414dbe57db86c6324dc6120bc524ec7031bdf99e10db98a090d34',
        'INFO[0007] ⭐  Transaction executed                       txID=9b503c0346279b637cf1b37354a18c5b2977c4429d36b91ac8c7597bdaf0cdfa',
        'INFO[0007] ⭐  Transaction executed                       txID=1c2a4d3e2604edc955add97c6cd388cba9832dbb3de6bc30dab7d12d68d46791',
        'INFO[0008] ⭐  Transaction executed                       txID=e0ec59186587431704fa37b91b5f797fa381ac66cf58bb0150d7c1b88ada3fd0',
        'INFO[0008] ⭐  Transaction executed                       txID=2a4546e2643fce83218e9d622f2e6a2d55d1294276ba823ef6c3286c57111913',
        'INFO[0009] ⭐  Transaction executed                       txID=c3761c53cda49e42b54fa098ec8d33386c20aeeed26f5e0a3b580d0714890106',
        'INFO[0009] ⭐  Transaction executed                       txID=bb04068a4c8ddfec2ade9dd590915f5ddfd8262cdca8f1fcb2a0312a48d957da',
        'INFO[0010] ⭐  Transaction executed                       txID=a1281152ac6ca224eb359eaeb88b3ebd63e168051c6c2bddc9b0e45748fab90c',
        'INFO[0010] ⭐  Transaction executed                       txID=45dd46512900028d1ee82cf6c9cad09f7f12c11e0069ab575e9ea0ee74992e8d',
        'INFO[0011] ⭐  Transaction executed                       txID=8f8221f8ff9bdcca0f4638992758f1693ab4c35e641e7244fb329a36d51482dd',
        'INFO[0260] ⭐  Transaction executed                       txID=d8c4fa35fc46c5aec670f756fc176bb0439f086ba445cdeeacd5618a72bc72cd',
        'WARN[0294] ❗  Transaction reverted                       txID=5fe569acd2a768b2b5f1184650b1d6f46eaa45c29cee71c574791e7c817d5e94',
        `WARN[0294] ERR [5fe569] [Error Code: 1101] cadence runtime error Execution failed:
        error: cannot find declaration 'HelloWorld' in '0f86e0586b0a20c7.HelloWorld'
    --> 5fe569acd2a768b2b5f1184650b1d6f46eaa45c29cee71c574791e7c817d5e94:1:7
    |
    1 | import HelloWorld from 0xf86e0586b0a20c7
    |        ^^^^^^^^^^ available exported declarations are:`,
        'INFO[0338] ⭐  Transaction executed                       txID=7efc90c6eea240683ff287f18274493e93e16cb890449d36edf1201e1d19e047',
    ];
    const [logs, setLogs] = useState([data[0]]);
    let interval: any;

    const scrollToBottom = (ref: any, smooth = true) => {
        if (ref.current) {
            const options = {
                top: ref.current.scrollHeight,
                left: 0,
                behavior: smooth ? 'smooth' : 'instant',
            };
            ref.current.scrollTo(options);
        }
    };

    useEffect(() => {
        let i = 0;
        interval = setInterval(() => {
            if (i < data.length) {
                i += 1;
            } else {
                clearInterval(interval);
            }
            setLogs((l) => [...l, data[i]]);
            scrollToBottom(miniLogRef);
            scrollToBottom(bigLogRef);
        }, 2000);
    }, []);

    const onCaretChange = useCallback((state) => {
        if (state === false) {
            changeLogDrawerSize('small');
        } else {
            changeLogDrawerSize('tiny');
        }
    }, []);

    const changeLogDrawerSize = useCallback((size: LogDrawerSize) => {
        setSize(size);
        setTimeout(() => {
            scrollToBottom(bigLogRef, false);
            scrollToBottom(miniLogRef, false);
        }, 100);
    }, []);

    return (
        <div className={`${classes.root} ${className}`}>
            <div className={`${classes.header} ${logDrawerSize !== 'tiny' ? classes.expanded : ''}`}>
                <span className={classes.leftContainer}>
                    <LogsIcon />
                    <span>LOGS</span>
                </span>

                {logDrawerSize === 'tiny' && (
                    <div className={classes.midContainer} ref={miniLogRef}>
                        {logs.map((log, key) => (
                            <pre key={key}>
                                <span dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}></span>
                            </pre>
                        ))}
                    </div>
                )}

                <div className={classes.rightContainer}>
                    {logDrawerSize !== 'tiny' && <Search className={classes.searchBox} />}
                    <div>
                        {(logDrawerSize === 'tiny' || logDrawerSize === 'small') && (
                            <CaretIcon
                                inverted={true}
                                isOpen={logDrawerSize !== 'tiny'}
                                className={classes.control}
                                onChange={onCaretChange}
                            />
                        )}
                        {logDrawerSize === 'small' && (
                            <ExpandIcon className={classes.control} onClick={() => changeLogDrawerSize('big')} />
                        )}
                        {logDrawerSize === 'big' && (
                            <ShrinkIcon className={classes.control} onClick={() => changeLogDrawerSize('small')} />
                        )}
                    </div>
                </div>
            </div>

            {logDrawerSize !== 'tiny' && (
                <div className={classes.bigLogsContainer} ref={bigLogRef}>
                    {logs.map((log, key) => (
                        <pre
                            className={classes.line}
                            key={key}
                            dangerouslySetInnerHTML={{ __html: highlightLogKeywords(log) }}
                        ></pre>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Logs;
