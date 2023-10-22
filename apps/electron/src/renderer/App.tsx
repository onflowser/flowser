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
  FlowAccountStorage,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowTransaction,
} from '@onflowser/api';
import { FlowserUsageRequirements } from '@onflowser/ui/src/common/misc/FlowserUsageRequirements/FlowserUsageRequirements';
import { IpcIndex } from './ipc-index';
import { FlowserRouter } from './router';
import { UpdateLoader } from './components/loaders/UpdateLoader';
import { AnalyticsService } from '../services/analytics.service';
import { FlowserIndexes } from '../services/flowser-app.service';

const indexes: FlowserIndexes = {
  accountStorage: new IpcIndex<FlowAccountStorage>('accountStorage'),
  contract: new IpcIndex<FlowContract>('contract'),
  transaction: new IpcIndex<FlowTransaction>('transaction'),
  account: new IpcIndex<FlowAccount>('account'),
  block: new IpcIndex<FlowBlock>('block'),
  event: new IpcIndex<FlowEvent>('event'),
};

const analyticsService = new AnalyticsService();

export function App() {
  const [isExiting, setIsExiting] = useState(false);
  const [appUpdateDownloadPercentage, setAppUpdateDownloadPercentage] =
    useState(0);
  const isUpdating = ![0, 100].includes(appUpdateDownloadPercentage);

  window.electron.platformAdapter.handleExit(() => {
    setIsExiting(true);
  });

  window.electron.platformAdapter.handleUpdateDownloadProgress((percentage) => {
    setAppUpdateDownloadPercentage(percentage);
  });

  window.electron.platformAdapter.handleUpdateDownloadStart(() => {
    setAppUpdateDownloadPercentage(0);
  });
  window.electron.platformAdapter.handleUpdateDownloadEnd(() => {
    setAppUpdateDownloadPercentage(100);
  });

  return (
    <>
      {isExiting && <ExitLoader />}
      {isUpdating && (
        <UpdateLoader loadingPercentage={appUpdateDownloadPercentage} />
      )}

      <ServiceRegistryProvider
        services={{
          flowService: {} as never,
          interactionsService: window.electron.interactions,
          accountIndex: indexes.account,
          accountStorageIndex: indexes.accountStorage,
          contractIndex: indexes.contract,
          eventsIndex: indexes.event,
          blocksIndex: indexes.block,
          transactionsIndex: indexes.transaction,
          processOutputIndex: undefined as never,
          monitoringService: undefined as never,
          analyticsService,
          workspaceService: window.electron.workspaces,
          snapshotService: undefined as never,
          walletService: undefined as never,
        }}
      >
        <ConfirmDialogProvider>
          <FilePickerProvider
            pickDirectory={window.electron.platformAdapter.showDirectoryPicker}
          >
            <ConsentAnalytics />
            <FlowserUsageRequirements />
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
