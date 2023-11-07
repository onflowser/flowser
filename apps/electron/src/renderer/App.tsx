import React, { useState } from 'react';
import { ExitLoader } from './components/loaders/ExitLoader';
import { ConfirmDialogProvider } from '@onflowser/ui/src/contexts/confirm-dialog.context';
import { FilePickerProvider } from '@onflowser/ui/src/contexts/platform-adapter.context';
import { useAnalytics } from '@onflowser/ui/src/hooks/use-analytics';
import { ConsentDialog } from '@onflowser/ui/src/common/overlays/dialogs/consent/ConsentDialog';
import { Toaster } from 'react-hot-toast';
import './App.scss';
import { ServiceRegistryProvider } from '@onflowser/ui/src/contexts/service-registry.context';
import {
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowTransaction,
} from '@onflowser/api';
import { SWRConfig } from 'swr';
import { SentryRendererService } from '../services/sentry-renderer.service';
import { AnalyticsService } from '../services/analytics.service';
import { UpdateLoader } from './components/loaders/UpdateLoader';
import { FlowserRouter } from './router';
import { indexSyncIntervalInMs, IpcIndexCache } from './ipc-index-cache';
import { DependencyErrors } from './components/DependencyErrors/DependencyErrors';

const indexes = {
  accountStorage: new IpcIndexCache<FlowAccountStorage>('accountStorage'),
  contract: new IpcIndexCache<FlowContract>('contract'),
  transaction: new IpcIndexCache<FlowTransaction>('transaction'),
  account: new IpcIndexCache<FlowAccount>('account'),
  block: new IpcIndexCache<FlowBlock>('block'),
  event: new IpcIndexCache<FlowEvent>('event'),
  accountKey: new IpcIndexCache<FlowAccountKey>('accountKey'),
};

const analyticsService = new AnalyticsService();
const monitoringService = new SentryRendererService();

export function App() {
  const [isExiting, setIsExiting] = useState(false);
  const [appUpdateDownloadPercentage, setAppUpdateDownloadPercentage] =
    useState(0);
  const isUpdating = ![0, 100].includes(appUpdateDownloadPercentage);

  window.electron.app.handleLog((log, level) => {
    // @ts-ignore Ignore `level` cannot be used to index `console`.
    console[level]?.(log);
  });

  window.electron.app.handleExit(() => {
    setIsExiting(true);
  });

  window.electron.app.handleUpdateDownloadProgress((percentage) => {
    setAppUpdateDownloadPercentage(percentage);
  });

  window.electron.app.handleUpdateDownloadStart(() => {
    setAppUpdateDownloadPercentage(0);
  });
  window.electron.app.handleUpdateDownloadEnd(() => {
    setAppUpdateDownloadPercentage(100);
  });

  return (
    <>
      {isExiting && <ExitLoader />}
      {isUpdating && (
        <UpdateLoader loadingPercentage={appUpdateDownloadPercentage} />
      )}

      <SWRConfig
        value={{
          refreshInterval: indexSyncIntervalInMs,
          // Most of the time (e.g. when polling transaction in outcome display)
          // we want this polling to happen with the same frequency as above.
          errorRetryInterval: indexSyncIntervalInMs,
        }}
      >
        <ServiceRegistryProvider
          services={{
            flowConfigService: window.electron.flowConfigService,
            walletService: window.electron.wallet,
            flowService: window.electron.flow,
            interactionsService: window.electron.interactions,
            accountIndex: indexes.account,
            accountStorageIndex: indexes.accountStorage,
            contractIndex: indexes.contract,
            eventsIndex: indexes.event,
            blocksIndex: indexes.block,
            accountKeyIndex: indexes.accountKey,
            transactionsIndex: indexes.transaction,
            processManagerService: window.electron.processManagerService,
            monitoringService,
            analyticsService,
            workspaceService: window.electron.workspaces,
            snapshotService: window.electron.snapshots,
          }}
        >
          <ConfirmDialogProvider>
            <FilePickerProvider
              pickDirectory={window.electron.app.showDirectoryPicker}
            >
              <ConsentAnalytics />
              <DependencyErrors />
              <FlowserRouter />
              <Toaster
                position="bottom-center"
                gutter={8}
                toastOptions={{
                  className: '',
                  style: {
                    background: '#9BDEFA', // $blue
                    color: '#363F53', // $table-line-background
                    padding: '12px', // $spacing-base
                    maxWidth: '400px',
                    maxHeight: '200px',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </FilePickerProvider>
          </ConfirmDialogProvider>
        </ServiceRegistryProvider>
      </SWRConfig>
    </>
  );
}

function ConsentAnalytics() {
  const { isConsented, setIsConsented } = useAnalytics();
  if (isConsented !== undefined) {
    return null;
  }
  return (
    <ConsentDialog consent={isConsented ?? true} setConsent={setIsConsented} />
  );
}
