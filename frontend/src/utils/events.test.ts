import { getEventDataType, getEventDataValue } from "./events";

const complexArg = {
  type: "Array",
  value: [
    {
      type: "Array",
      value: [
        {
          type: "Dictionary",
          value: [
            {
              key: {
                type: "String",
                value: "HelloWorld",
              },
              value: {
                type: "Number",
                value: 69,
              },
            },
          ],
        },
      ],
    },
  ],
};

describe("Event helper utils test", () => {
  it("should return nested arg type", function () {
    const type = getEventDataType(complexArg);
    expect(type).toEqual("Array<Array<Dictionary<String, Number>>>");
  });

  it("should return nested arg value", function () {
    const value = getEventDataValue(complexArg);
    expect(value).toEqual('[[{"HelloWorld":69}]]');
  });
});
