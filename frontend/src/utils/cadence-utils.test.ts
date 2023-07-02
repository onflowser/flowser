import { CadenceUtils } from "./cadence-utils";

describe("CadenceUtils", function () {
  it("should parse Cadence error returned from `sendTransaction`", function () {
    const exampleCadenceError =
      '\n      HTTP Request Error: An error occurred when interacting with the Access API.\n      error=Invalid Flow request: failed to parse transaction Cadence script: Parsing failed:\nerror: unexpected token: EOF\n  --> :10:2\n   |\n10 |   \n   |   ^\n\n      hostname=http://localhost:8888\n      path=/v1/transactions\n      method=POST\n      requestBody={"script":"dHJhbnNhY3Rpb24gewoKCgoKCgoKCiAg","arguments":[],"reference_block_id":"279102ae41e27aafe632a8469dcabe15774bbb79bcbbff192b03793b188525fe","gas_limit":"9999","payer":"f8d6e0586b0a20c7","proposal_key":{"address":"f8d6e0586b0a20c7","key_index":"0","sequence_number":"12"},"authorizers":[],"payload_signatures":[],"envelope_signatures":[{"address":"f8d6e0586b0a20c7","key_index":"0","signature":"nnpBZbxlkCUk3PuNSlTQLwgxeqB1jZtWaR6tb9+sH9Yb98kfN5U5Zvup3iYNHYIh1Pw1bXbkObnvt9+KFsotcA=="}]}\n      responseBody={"code":400,"message":"Invalid Flow request: failed to parse transaction Cadence script: Parsing failed:\\nerror: unexpected token: EOF\\n  --> :10:2\\n   |\\n10 |   \\n   |   ^\\n"}\n      responseStatusText=Bad Request\n      statusCode=400\n    ';
    const parsed = CadenceUtils.parseCadenceError(exampleCadenceError);

    expect(Object.keys(parsed)).toEqual([
      "hostname",
      "path",
      "method",
      "requestBody",
      "responseBody",
      "responseStatusText",
      "statusCode",
    ]);
  });
});
