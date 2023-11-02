import { FlowCliService } from '@onflowser/nodejs';
import commandExists from 'command-exists';
import semver from 'semver';
import { FlowserDependencyError, FlowserDependencyErrorType } from './types';

export class DependencyManagerService {
  constructor(private readonly flowCliService: FlowCliService) {}

  async validateDependencies(): Promise<FlowserDependencyError[]> {
    const errors: FlowserDependencyError[] = [];

    try {
      await commandExists('flow');
    } catch (error) {
      errors.push({
        type: FlowserDependencyErrorType.MISSING_FLOW_CLI,
        name: 'Missing Flow CLI',
      });

      return errors;
    }

    const flowCliVersion = await this.flowCliService.getVersion();
    const actualVersion = semver.coerce(flowCliVersion.version)?.version;

    if (!actualVersion) {
      throw new Error('Could not parse Flow CLI version');
    }

    const minSupportedVersion = '1.0.0';
    const isSupportedVersion = semver.lte(minSupportedVersion, actualVersion);

    if (!isSupportedVersion) {
      errors.push({
        type: FlowserDependencyErrorType.UNSUPPORTED_CLI_VERSION,
        name: 'Unsupported Flow CLI version',
        unsupportedCliVersion: {
          minSupportedVersion,
          actualVersion,
        },
      });
    }

    return errors;
  }
}
