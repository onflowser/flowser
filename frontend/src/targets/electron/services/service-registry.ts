import { AppUpdateService } from "./app-update.service";

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  public appUpdateService: AppUpdateService;

  constructor() {
    this.appUpdateService = new AppUpdateService();
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }
}
