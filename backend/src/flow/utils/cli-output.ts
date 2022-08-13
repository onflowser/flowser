export class FlowCliOutput {
  private data: string;

  constructor(data) {
    this.data = data;
  }

  parse() {
    return FlowCliOutput.sanitiseOutput(this.data)
      .split("\n")
      .map(FlowCliOutput.parseLine)
      .filter(Boolean);
  }

  findValue(keyPattern) {
    const lineMatch = this.parse().filter((line) =>
      new RegExp(keyPattern, "gi").test(line[0])
    );
    if (lineMatch.length > 0) {
      return lineMatch[0][1]; // value of the first match
    } else {
      return null;
    }
  }

  static sanitiseOutput(out) {
    const removeEmptyLines = (lines) =>
      lines.split("\n").filter(Boolean).join("\n");
    // if new flow-cli version is available, most of flow-cli commands will include this text:
    // ⚠️  Version warning: a new version of Flow CLI is available (v0.28.4).
    // Read the installation guide for upgrade instructions: https://docs.onflow.org/flow-cli/install
    const versionWarningFound = out.includes("Version warning");
    const lastVersionWarningLinePrefix = "Read the installation guide";
    if (versionWarningFound) {
      const lines = out.split("\n");
      const startIndex =
        lines.findIndex((line) => line.includes(lastVersionWarningLinePrefix)) +
        1;
      out = lines.slice(startIndex, lines.length).join("\n");
    }
    return removeEmptyLines(out);
  }

  static parseLine(line) {
    const value = line.trim();
    // parse multiple possible key -> value mapping formats
    // "key: value" or "key value"
    if (/\t/.test(value)) {
      return value.split(/[ ]*\t[ ]*/);
    }
    if (/: /.test(value)) {
      return value.split(/: /);
    } else {
      return value;
    }
  }
}
