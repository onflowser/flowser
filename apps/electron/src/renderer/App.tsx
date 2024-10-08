import React, { useState } from 'react';
import { ExitLoader } from './components/loaders/ExitLoader';
import { ConfirmDialogProvider } from '@onflowser/ui/src/contexts/confirm-dialog.context';
import { FilePickerProvider } from '@onflowser/ui/src/contexts/file-picker.context';
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
import { FlowNetworkProvider } from '@onflowser/ui/src/contexts/flow-network.context';
import { FlowFlixV11Service } from '@onflowser/core/src/flow-flix-v11.service';
import { HttpService } from '@onflowser/core/src/http.service';
import { IFlowserLogger } from '@onflowser/core';
import { DependencyErrors } from './components/DependencyErrors/DependencyErrors';
import { FlowserRouter } from './router';
import { UpdateLoader } from './components/loaders/UpdateLoader';
import { AnalyticsService } from '../services/analytics.service';
import { SentryRendererService } from '../services/sentry-renderer.service';
import { indexSyncIntervalInMs, IpcIndexCache } from './ipc-index-cache';

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

class WebLogger implements IFlowserLogger {
  debug(message: any): void {
    console.debug(message);
  }

  error(message: any, error?: unknown): void {
    console.error(message, error);
  }

  log(message: any): void {
    console.log(message);
  }

  verbose(message: any): void {
    console.debug(message);
  }

  warn(message: any): void {
    console.warn(message);
  }
}

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
        <FlowNetworkProvider config={{ networkId: 'emulator' }}>
          <ServiceRegistryProvider
            services={{
              flowConfigService: window.electron.flowConfigService,
              walletService: window.electron.wallet,
              flowService: window.electron.flow,
              flowCliService: window.electron.flowCliService,
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
              flixService: new FlowFlixV11Service(
                {
                  flixServerUrl: 'https://flix-indexer.fly.dev',
                },
                new HttpService(new WebLogger()),
              ),
            }}
          >
            <ConfirmDialogProvider>
              <FilePickerProvider
                pickDirectory={window.electron.app.showDirectoryPicker}
              >
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
        </FlowNetworkProvider>
      </SWRConfig>
    </>
  );
}
