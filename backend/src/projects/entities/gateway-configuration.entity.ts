export class GatewayConfigurationEntity {
  port: number;

  address: string;

  constructor(address?: string, port?: number) {
    if (address) {
      this.address = address;
    }
    if (port) {
      this.port = port;
    }
  }

  url() {
    const { address, port } = this;
    const host = `${address}${port ? `:${port}` : ""}`;
    return host.startsWith("http") ? host : `http://${host}`;
  }
}
